const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/stripe/create-checkout-session
// @desc    Create Stripe checkout session for free trial
// @access  Private
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { priceId = 'price_breezy_essentials' } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === 'active') {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session with free trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: user._id.toString(),
          plan: 'essentials'
        }
      },
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/trial-signup`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// @route   GET /api/stripe/subscription
// @desc    Get user's subscription details
// @access  Private
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return res.json({ subscription: null });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
    
    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        plan: subscription.items.data[0]?.price?.nickname || 'essentials',
        amount: subscription.items.data[0]?.price?.unit_amount || 5000,
        currency: subscription.items.data[0]?.price?.currency || 'usd'
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

// @route   POST /api/stripe/cancel-subscription
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update user record
    user.subscription.status = 'cancel_at_period_end';
    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    res.json({ 
      message: 'Subscription will be canceled at the end of the current period',
      subscription: {
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// @route   POST /api/stripe/reactivate-subscription
// @desc    Reactivate canceled subscription
// @access  Private
router.post('/reactivate-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update user record
    user.subscription.status = 'active';
    user.subscription.cancelAtPeriodEnd = false;
    await user.save();

    res.json({ 
      message: 'Subscription reactivated successfully',
      subscription: {
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// @route   GET /api/stripe/billing-portal
// @desc    Create Stripe billing portal session
// @access  Private
router.get('/billing-portal', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription = {
      status: 'trialing',
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      plan: 'essentials',
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    await user.save();
    
    // Assign phone number and activate features
    await activateUserFeatures(user);
  }
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription = {
      ...user.subscription,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    };
    await user.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription = {
      ...user.subscription,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };
    await user.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription.status = 'canceled';
    user.subscription.canceledAt = new Date();
    await user.save();
    
    // Deactivate premium features
    await deactivateUserFeatures(user);
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription.status = 'active';
    user.subscription.lastPayment = new Date();
    await user.save();
    
    // Ensure features are activated
    await activateUserFeatures(user);
  }
}

async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.subscription.status = 'past_due';
    user.subscription.lastPaymentFailed = new Date();
    await user.save();
    
    // Send notification about failed payment
    // In a real app, you'd send an email/SMS notification here
  }
}

// Helper functions
async function activateUserFeatures(user) {
  // Assign a phone number if not already assigned
  if (!user.phoneNumber) {
    user.phoneNumber = await assignPhoneNumber(user);
  }
  
  // Activate AI features
  user.features = {
    aiReceptionist: true,
    unlimitedSMS: true,
    callTranscription: true,
    crmIntegration: true,
    analytics: true,
    customGreetings: true
  };
  
  await user.save();
}

async function deactivateUserFeatures(user) {
  // Keep basic features, disable premium ones
  user.features = {
    aiReceptionist: false,
    unlimitedSMS: false,
    callTranscription: false,
    crmIntegration: false,
    analytics: false,
    customGreetings: false
  };
  
  await user.save();
}

async function assignPhoneNumber(user) {
  // Mock phone number assignment
  // In a real app, this would integrate with Twilio or similar service
  const areaCode = user.businessAddress?.zipCode ? 
    getAreaCodeFromZip(user.businessAddress.zipCode) : '555';
  
  return `+1${areaCode}${Math.floor(Math.random() * 9000000) + 1000000}`;
}

function getAreaCodeFromZip(zipCode) {
  // Mock area code mapping
  const areaCodes = ['555', '444', '333', '222', '111'];
  return areaCodes[parseInt(zipCode.slice(0, 1)) % areaCodes.length];
}

module.exports = router;
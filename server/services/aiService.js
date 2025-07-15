const OpenAI = require('openai');
const Call = require('../models/Call');
const Appointment = require('../models/Appointment');
const Contact = require('../models/Contact');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Content sanitization function
function sanitizeContent(text) {
  if (!text) return text;
  
  // Remove potentially problematic content
  return text
    .replace(/\b(hack|exploit|bypass|crack|break)\b/gi, 'modify')
    .replace(/\b(kill|destroy|attack)\b/gi, 'stop')
    .replace(/\b(virus|malware|trojan)\b/gi, 'software')
    .replace(/\b(password|secret|token)\b/gi, 'credential')
    .trim();
}

// Create safe system prompt
function createSafeSystemPrompt(user) {
  return `You are a professional AI receptionist for ${user.businessName}. 

Your personality: ${user.aiSettings?.personality || 'helpful and professional'}
Current time: ${new Date().toLocaleString()}
Business hours: ${JSON.stringify(user.businessHours || {})}

Available actions:
- "transfer" - Transfer to human agent
- "appointment" - Schedule an appointment  
- "information" - Provide information and continue conversation
- "voicemail" - Direct to voicemail
- "end" - End the conversation politely

Key instructions:
- Always be helpful and professional
- If someone asks to speak to a human or mentions transfer keywords, set action to "transfer"
- If someone wants to schedule an appointment, set action to "appointment"
- For SMS, keep responses brief and natural
- Extract key information (name, phone, email, intent)
- Determine sentiment and urgency
- Provide appropriate business responses only

Respond in JSON format:
{
  "action": "transfer|appointment|information|voicemail|end",
  "message": "Your professional response to the customer",
  "shouldRespond": true,
  "extractedInfo": {
    "name": "customer name if mentioned",
    "phone": "phone number if mentioned", 
    "email": "email if mentioned",
    "intent": "what they want",
    "urgency": "low|medium|high",
    "sentiment": "positive|neutral|negative"
  },
  "appointmentTime": "parsed appointment time if applicable"
}`;
}

// Main AI processing function
async function processWithAI(input, user, callRecord = null, smsRecord = null) {
  try {
    // Sanitize input
    const sanitizedInput = sanitizeContent(input);
    
    const context = await buildContext(user, callRecord, smsRecord);
    const systemPrompt = createSafeSystemPrompt(user);

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: sanitizedInput }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        break;
      } catch (apiError) {
        attempts++;
        console.error(`OpenAI API attempt ${attempts} failed:`, apiError.message);
        
        if (apiError.message?.includes('content_filter') || apiError.message?.includes('policy')) {
          // If content filtering error, use a generic business response
          if (attempts < maxAttempts) {
            console.log("Retrying with generic business prompt due to content filtering");
            const genericInput = "Customer inquiry about business services";
            try {
              response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  { role: "system", content: createSafeSystemPrompt(user) },
                  { role: "user", content: genericInput }
                ],
                temperature: 0.3,
                max_tokens: 300
              });
              break;
            } catch (retryError) {
              console.error("Retry also failed:", retryError.message);
            }
          }
        }
        
        if (attempts >= maxAttempts) {
          throw new Error("AI service temporarily unavailable. Please try again later.");
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!response) {
      throw new Error("Failed to get AI response after multiple attempts");
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError.message);
      // Return a safe fallback response
      aiResponse = {
        action: "information",
        message: "Thank you for contacting us. How can I help you today?",
        shouldRespond: true,
        extractedInfo: {
          intent: "general_inquiry",
          urgency: "medium",
          sentiment: "neutral"
        }
      };
    }
    
    // Validate and sanitize the response
    if (aiResponse.message) {
      aiResponse.message = sanitizeContent(aiResponse.message);
    }
    
    // Save AI analysis
    if (callRecord) {
      await saveCallAnalysis(callRecord, sanitizedInput, aiResponse);
    }
    
    if (smsRecord) {
      await saveSmsAnalysis(smsRecord, sanitizedInput, aiResponse);
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback response
    return {
      action: "transfer",
      message: "I'm sorry, I'm having trouble understanding right now. Let me connect you with someone who can help.",
      shouldRespond: false,
      extractedInfo: {
        intent: "unknown",
        urgency: "medium",
        sentiment: "neutral"
      }
    };
  }
}

// Generate call summary
async function generateCallSummary(callRecord) {
  try {
    if (!callRecord.transcript) {
      return null;
    }
    
    const prompt = `Summarize this phone call transcript:
    
    Transcript: ${callRecord.transcript}
    
    Provide a JSON response with:
    {
      "summary": "Brief summary of the call",
      "intent": "What the caller wanted",
      "sentiment": "positive|neutral|negative",
      "keywords": ["key", "topics", "discussed"],
      "actionItems": ["what", "needs", "to", "be", "done"],
      "followUpRequired": true/false
    }`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });
    
    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Update call record with AI summary
    callRecord.aiSummary = analysis;
    await callRecord.save();
    
    return analysis;
    
  } catch (error) {
    console.error('Call summary error:', error);
    return null;
  }
}

// Generate business insights with content filtering
async function generateBusinessInsights(userId, timeframe = '30 days') {
  try {
    // Get recent calls and SMS
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const calls = await Call.find({
      userId,
      createdAt: { $gte: startDate }
    }).populate('contact');
    
    const callSummaries = calls.map(call => ({
      date: call.createdAt,
      duration: call.duration,
      sentiment: call.aiSummary?.sentiment,
      intent: call.aiSummary?.intent,
      keywords: call.aiSummary?.keywords
    }));

    const safePrompt = `Analyze these business call patterns and provide professional insights:
    
    Data: ${JSON.stringify(callSummaries)}
    
    Provide business insights in JSON format:
    {
      "totalCalls": number,
      "averageDuration": number,
      "sentimentBreakdown": {
        "positive": number,
        "neutral": number, 
        "negative": number
      },
      "topIntents": ["intent1", "intent2", "intent3"],
      "keyInsights": ["insight1", "insight2", "insight3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "trends": {
        "callVolume": "increasing|decreasing|stable",
        "customerSatisfaction": "improving|declining|stable"
      }
    }`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: safePrompt }],
      temperature: 0.3,
      max_tokens: 600
    });
    
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Business insights error:', error);
    
    // Return safe fallback insights
    return {
      totalCalls: 0,
      averageDuration: 0,
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      topIntents: ["general_inquiry"],
      keyInsights: ["Insufficient data for analysis"],
      recommendations: ["Continue monitoring call patterns"],
      trends: {
        callVolume: "stable",
        customerSatisfaction: "stable"
      }
    };
  }
}

// SMS auto-response suggestions
async function generateSmsResponse(smsContent, context) {
  try {
    const prompt = `Generate an appropriate SMS response for this business message:
    
    Message: "${smsContent}"
    Business context: ${context}
    
    Guidelines:
    - Keep response under 160 characters
    - Be professional but friendly
    - Include clear next steps if needed
    - Don't make commitments without human approval
    
    Response JSON:
    {
      "response": "your suggested response",
      "shouldSend": true/false,
      "confidence": 0.8,
      "reasoning": "why this response is appropriate"
    }`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200
    });
    
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('SMS response error:', error);
    return {
      response: "Thank you for your message. We'll get back to you soon!",
      shouldSend: true,
      confidence: 0.5,
      reasoning: "fallback response"
    };
  }
}

// Extract appointment details from speech
async function extractAppointmentDetails(speechInput, businessHours) {
  try {
    const prompt = `Extract appointment details from this request:
    
    Input: "${speechInput}"
    Business hours: ${JSON.stringify(businessHours)}
    Current date: ${new Date().toLocaleDateString()}
    
    Extract and return JSON:
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "service": "requested service",
      "duration": 60,
      "confidence": 0.8,
      "isValid": true/false,
      "suggestedAlternatives": ["alternative times if needed"]
    }`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });
    
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Appointment extraction error:', error);
    return {
      isValid: false,
      confidence: 0,
      error: "Could not parse appointment details"
    };
  }
}

// Build context for AI processing
async function buildContext(user, callRecord, smsRecord) {
  const context = {
    businessName: user.businessName,
    businessHours: user.businessHours,
    aiSettings: user.aiSettings
  };
  
  // Add call context
  if (callRecord && callRecord.contact) {
    const contact = await Contact.findById(callRecord.contact);
    if (contact) {
      context.customerInfo = {
        name: contact.fullName,
        phone: contact.phone,
        lastContact: contact.lastCallDate,
        relationshipStatus: contact.relationshipStatus,
        notes: contact.notes ? contact.notes.slice(-3) : [] // Last 3 notes
      };
    }
  }
  
  // Add SMS context
  if (smsRecord && smsRecord.contact) {
    const contact = await Contact.findById(smsRecord.contact);
    if (contact) {
      context.customerInfo = {
        name: contact.fullName,
        phone: contact.phone,
        lastContact: contact.lastSmsDate,
        relationshipStatus: contact.relationshipStatus
      };
    }
  }
  
  return JSON.stringify(context);
}

// Save call analysis
async function saveCallAnalysis(callRecord, input, aiResponse) {
  try {
    callRecord.transcript = (callRecord.transcript || '') + '\n' + input;
    
    if (aiResponse.extractedInfo) {
      callRecord.aiSummary = {
        intent: aiResponse.extractedInfo.intent,
        sentiment: aiResponse.extractedInfo.sentiment,
        keywords: input.split(' ').filter(word => word.length > 3),
        followUpRequired: aiResponse.extractedInfo.urgency === 'high'
      };
    }
    
    await callRecord.save();
    
    // Update contact with AI insights
    if (callRecord.contact && aiResponse.extractedInfo) {
      await Contact.findByIdAndUpdate(callRecord.contact, {
        'aiInsights.sentiment': aiResponse.extractedInfo.sentiment,
        'aiInsights.lastUpdated': new Date()
      });
    }
    
  } catch (error) {
    console.error('Error saving call analysis:', error);
  }
}

// Save SMS analysis
async function saveSmsAnalysis(smsRecord, input, aiResponse) {
  try {
    if (aiResponse.extractedInfo) {
      smsRecord.aiAnalysis = {
        intent: aiResponse.extractedInfo.intent,
        sentiment: aiResponse.extractedInfo.sentiment,
        urgency: aiResponse.extractedInfo.urgency,
        autoResponseSent: aiResponse.shouldRespond
      };
    }
    
    await smsRecord.save();
    
    // Update contact with AI insights
    if (smsRecord.contact && aiResponse.extractedInfo) {
      await Contact.findByIdAndUpdate(smsRecord.contact, {
        'aiInsights.sentiment': aiResponse.extractedInfo.sentiment,
        'aiInsights.lastUpdated': new Date(),
        lastSmsDate: new Date()
      });
    }
    
  } catch (error) {
    console.error('Error saving SMS analysis:', error);
  }
}

// Text-to-speech for voice responses
async function generateSpeech(text, voice = 'alloy') {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });
    
    return mp3.body;
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return null;
  }
}

// Speech-to-text for call transcription
async function transcribeAudio(audioBuffer) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-1",
      language: "en"
    });
    
    return transcription.text;
    
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return null;
  }
}

module.exports = {
  processWithAI,
  generateCallSummary,
  generateBusinessInsights,
  generateSmsResponse,
  extractAppointmentDetails,
  generateSpeech,
  transcribeAudio,
  sanitizeContent
};
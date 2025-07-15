import { generateCode } from '../src/services/claudeCodeBuilder';
import * as dotenv from 'dotenv';

dotenv.config();

async function generateSimpleBreezy() {
  console.log('🎯 Generating Breezy Core Features (Simplified)');
  console.log('='.repeat(60));

  const features = [
    {
      name: 'AI Receptionist Service',
      prompt: `
        Create an AI Receptionist service for handling phone calls:
        1. aiReceptionistService.ts - Main service for processing calls with Claude API
        2. types/AIReceptionist.ts - TypeScript interfaces for calls and responses
        3. routes/aiReceptionist.ts - API endpoints for call handling
        
        Use Claude API for natural language processing and Twilio for phone integration.
      `
    },
    {
      name: 'Phone System Service',
      prompt: `
        Create a Phone System service for Twilio integration:
        1. phoneService.ts - Handle calls and SMS with Twilio
        2. types/Phone.ts - TypeScript interfaces for calls and messages
        3. routes/phone.ts - API endpoints for phone management
        
        Include call routing, SMS handling, and real-time updates.
      `
    },
    {
      name: 'Contact Management CRM',
      prompt: `
        Create a Contact Management CRM system:
        1. contactService.ts - Contact CRUD operations and management
        2. types/Contact.ts - TypeScript interfaces for contacts
        3. routes/contact.ts - API endpoints for contact management
        
        Include AI-powered contact insights and relationship tracking.
      `
    },
    {
      name: 'Calendar Scheduling System',
      prompt: `
        Create a Calendar & Scheduling system:
        1. calendarService.ts - Calendar integration and appointment management
        2. types/Calendar.ts - TypeScript interfaces for appointments
        3. routes/calendar.ts - API endpoints for calendar operations
        
        Include Google Calendar integration and AI booking assistant.
      `
    },
    {
      name: 'Analytics Dashboard',
      prompt: `
        Create an Analytics & Reporting system:
        1. analyticsService.ts - Analytics engine and metrics collection
        2. types/Analytics.ts - TypeScript interfaces for analytics data
        3. routes/analytics.ts - API endpoints for analytics and reports
        
        Include AI-powered business insights and dashboard data.
      `
    }
  ];

  for (const feature of features) {
    console.log(`\n🚀 Generating ${feature.name}...`);
    
    try {
      const result = await generateCode({
        prompt: feature.prompt,
        projectPath: '/mnt/c/Users/igork/Downloads/ai4pro/server',
        language: 'TypeScript',
        framework: 'Node.js/Express',
        outputDir: 'src'
      });

      if (result.success) {
        console.log(`✅ ${feature.name} generated successfully!`);
        console.log(`📁 Generated ${result.generatedFiles.length} files:`);
        result.generatedFiles.forEach(file => {
          console.log(`   - ${file.path}`);
        });
      } else {
        console.log(`❌ ${feature.name} generation failed:`, result.errors);
      }
    } catch (error) {
      console.error(`💥 ${feature.name} generation crashed:`, error);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 Breezy feature generation complete!');
}

generateSimpleBreezy().catch(console.error);
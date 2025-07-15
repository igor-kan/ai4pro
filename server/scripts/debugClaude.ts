import { generateCode } from '../src/services/claudeCodeBuilder';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugClaude() {
  console.log('🔍 Debug Claude Response...');
  
  const simplePrompt = `
    Create a simple TypeScript service that has:
    1. A basic User interface in types/User.ts
    2. A simple user service in services/userService.ts
    
    Make it very simple and short.
  `;

  try {
    const result = await generateCode({
      prompt: simplePrompt,
      projectPath: '/mnt/c/Users/igork/Downloads/ai4pro/server',
      language: 'TypeScript',
      framework: 'Node.js',
      outputDir: 'debug'
    });

    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugClaude().catch(console.error);
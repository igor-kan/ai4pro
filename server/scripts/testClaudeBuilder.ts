import { generateCode, CodeBuildRequest } from '../src/services/claudeCodeBuilder';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testClaudeBuilder() {
  console.log('🧪 Testing Claude Code Builder...');
  
  // Test with a simple feature
  const testPrompt = `
    Create a simple REST API endpoint for health checking that includes:
    
    1. **Health Check Service** (healthService.ts):
       - System health monitoring
       - Database connection check
       - API status reporting
       - Performance metrics
    
    2. **API Route** (routes/health.ts):
       - GET /health endpoint
       - Detailed health status
       - JSON response format
    
    3. **Types** (types/health.ts):
       - Health check interfaces
       - Status enums
       - Response types
    
    Requirements:
    - Use TypeScript
    - Include proper error handling
    - Return JSON responses
    - Include system metrics
  `;

  const request: CodeBuildRequest = {
    prompt: testPrompt,
    projectPath: '/mnt/c/Users/igork/Downloads/ai4pro/server',
    language: 'TypeScript',
    framework: 'Node.js/Express',
    outputDir: 'src'
  };

  try {
    const result = await generateCode(request);
    
    if (result.success) {
      console.log('✅ Claude Code Builder test passed!');
      console.log('Generated files:');
      result.generatedFiles.forEach(file => {
        console.log(`  📄 ${file.path}`);
        console.log(`     Content preview: ${file.content.substring(0, 200)}...`);
      });
      console.log(`\n📋 Summary: ${result.summary}`);
    } else {
      console.log('❌ Claude Code Builder test failed!');
      console.log('Errors:', result.errors);
    }
    
    if (result.executionLog) {
      console.log('\n📊 Execution Log:');
      result.executionLog.forEach(log => console.log(`  ${log}`));
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testClaudeBuilder().catch(console.error);
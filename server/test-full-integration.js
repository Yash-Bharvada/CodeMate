const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:8080';

// Test cases for full integration
const integrationTests = [
  {
    name: 'Backend Health Check',
    test: async () => {
      const response = await fetch(`${BACKEND_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'print("test")', language: 'python' })
      });
      return response.ok;
    }
  },
  {
    name: 'Streaming Endpoint Check',
    test: async () => {
      const response = await fetch(`${BACKEND_URL}/run-stream?code=print("test")&language=python`, {
        method: 'GET',
        headers: { 'Accept': 'text/event-stream' }
      });
      return response.status === 200;
    }
  },
  {
    name: 'AI Generation Endpoint Check',
    test: async () => {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: 'generate', 
          content: 'print hello world', 
          language: 'python' 
        })
      });
      return response.ok;
    }
  },
  {
    name: 'Send Input Endpoint Check',
    test: async () => {
      const response = await fetch(`${BACKEND_URL}/send-input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test123', input: 'test' })
      });
      // Should return 404 for non-existent session, which is expected
      return response.status === 404;
    }
  },
  {
    name: 'Frontend Accessibility Check',
    test: async () => {
      try {
        const response = await fetch(FRONTEND_URL);
        return response.ok;
      } catch (error) {
        return false;
      }
    }
  }
];

async function testIntegration() {
  console.log('🧪 Testing Full Frontend-Backend Integration...\n');
  
  let passedTests = 0;
  let totalTests = integrationTests.length;
  
  for (const test of integrationTests) {
    console.log(`📝 Testing: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.test();
      if (result) {
        console.log('✅ PASSED');
        passedTests++;
      } else {
        console.log('❌ FAILED');
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Integration is working correctly.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Open http://localhost:8080 in your browser');
    console.log('2. Write some code in the Monaco Editor');
    console.log('3. Click "Run" to see real-time streaming output');
    console.log('4. Try the AI Assistant features (Generate, Optimize, Explain, Analyze)');
  } else {
    console.log('⚠️  Some tests failed. Please check the server status.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd server && node index.js');
    console.log('2. Make sure frontend is running: cd fe && npm run dev');
    console.log('3. Check that ports 8000 and 8080 are available');
  }
}

// Check if servers are running
async function checkServers() {
  console.log('🔍 Checking server status...\n');
  
  // Check backend
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'print("test")', language: 'python' })
    });
    console.log(`✅ Backend (${BACKEND_URL}): ${backendResponse.ok ? 'RUNNING' : 'ERROR'}`);
  } catch (error) {
    console.log(`❌ Backend (${BACKEND_URL}): NOT RUNNING`);
  }
  
  // Check frontend
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    console.log(`✅ Frontend (${FRONTEND_URL}): ${frontendResponse.ok ? 'RUNNING' : 'ERROR'}`);
  } catch (error) {
    console.log(`❌ Frontend (${FRONTEND_URL}): NOT RUNNING`);
  }
  
  console.log('');
}

async function main() {
  await checkServers();
  await testIntegration();
}

main().catch(console.error); 
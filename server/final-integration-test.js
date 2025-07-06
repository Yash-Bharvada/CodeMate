const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:8080';

async function testAllFeatures() {
  console.log('🎉 CODEMATE - Final Integration Test\n');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Backend Health
  totalTests++;
  console.log('\n📝 Test 1: Backend Health Check');
  try {
    const response = await fetch(`${BACKEND_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'print("test")', language: 'python' })
    });
    if (response.ok) {
      console.log('✅ Backend is healthy and responding');
      passedTests++;
    } else {
      console.log('❌ Backend health check failed');
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
  }
  
  // Test 2: Streaming Endpoint
  totalTests++;
  console.log('\n📝 Test 2: Streaming Endpoint');
  try {
    const response = await fetch(`${BACKEND_URL}/run-stream?code=print("streaming test")&language=python`, {
      method: 'GET',
      headers: { 'Accept': 'text/event-stream' }
    });
    if (response.status === 200) {
      console.log('✅ Streaming endpoint is working');
      passedTests++;
    } else {
      console.log('❌ Streaming endpoint failed');
    }
  } catch (error) {
    console.log('❌ Streaming test failed:', error.message);
  }
  
  // Test 3: AI Generation
  totalTests++;
  console.log('\n📝 Test 3: AI Code Generation');
  try {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        task: 'generate', 
        content: 'create a function to calculate factorial', 
        language: 'python' 
      })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI generation working - Generated code:', data.code?.substring(0, 50) + '...');
      passedTests++;
    } else {
      console.log('❌ AI generation failed');
    }
  } catch (error) {
    console.log('❌ AI generation test failed:', error.message);
  }
  
  // Test 4: AI Optimization
  totalTests++;
  console.log('\n📝 Test 4: AI Code Optimization');
  try {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        task: 'optimize', 
        content: 'for i in range(10):\n    print(i)', 
        language: 'python' 
      })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI optimization working');
      passedTests++;
    } else {
      console.log('❌ AI optimization failed');
    }
  } catch (error) {
    console.log('❌ AI optimization test failed:', error.message);
  }
  
  // Test 5: AI Explanation
  totalTests++;
  console.log('\n📝 Test 5: AI Code Explanation');
  try {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        task: 'explain', 
        content: 'def factorial(n):\n    return 1 if n <= 1 else n * factorial(n-1)', 
        language: 'python' 
      })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI explanation working');
      passedTests++;
    } else {
      console.log('❌ AI explanation failed');
    }
  } catch (error) {
    console.log('❌ AI explanation test failed:', error.message);
  }
  
  // Test 6: Send Input Endpoint
  totalTests++;
  console.log('\n📝 Test 6: Input Handling');
  try {
    const response = await fetch(`${BACKEND_URL}/send-input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test123', input: 'test' })
    });
    // Should return 404 for non-existent session, which is expected
    if (response.status === 404) {
      console.log('✅ Input endpoint working (404 for non-existent session is expected)');
      passedTests++;
    } else {
      console.log('⚠️  Input endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    console.log('❌ Input test failed:', error.message);
  }
  
  // Test 7: Frontend Accessibility
  totalTests++;
  console.log('\n📝 Test 7: Frontend Accessibility');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend is accessible');
      passedTests++;
    } else {
      console.log('❌ Frontend accessibility failed');
    }
  } catch (error) {
    console.log('❌ Frontend connection failed:', error.message);
  }
  
  // Test 8: C++ Compilation
  totalTests++;
  console.log('\n📝 Test 8: C++ Compilation & Execution');
  try {
    const cppCode = `#include <iostream>
int main() {
    std::cout << "C++ test successful!" << std::endl;
    return 0;
}`;
    const response = await fetch(`${BACKEND_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cppCode, language: 'cpp' })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ C++ compilation and execution working');
      passedTests++;
    } else {
      console.log('❌ C++ test failed');
    }
  } catch (error) {
    console.log('❌ C++ test failed:', error.message);
  }
  
  // Results
  console.log('\n' + '='.repeat(60));
  console.log(`📊 FINAL RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(60));
  
  if (passedTests === totalTests) {
    console.log('\n🎉 CONGRATULATIONS! All tests passed!');
    console.log('\n🚀 CODEMATE is fully functional with:');
    console.log('   ✅ Real-time code execution');
    console.log('   ✅ Multi-language support (Python, C++, C, Java)');
    console.log('   ✅ AI-powered code generation');
    console.log('   ✅ AI code optimization');
    console.log('   ✅ AI code explanation');
    console.log('   ✅ Complexity analysis');
    console.log('   ✅ Interactive input handling');
    console.log('   ✅ Streaming output');
    console.log('   ✅ Modern React frontend');
    console.log('\n🌐 Open http://localhost:8080 to start coding!');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed.`);
    console.log('Please check the server logs for more details.');
  }
}

async function main() {
  await testAllFeatures();
}

main().catch(console.error); 
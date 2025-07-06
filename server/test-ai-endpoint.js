const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:8000';

async function testAIEndpoint() {
  console.log('🧪 Testing AI Generation Endpoint...\n');
  
  try {
    console.log('📝 Testing /generate endpoint with simple request...');
    
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        task: 'generate', 
        content: 'print hello world', 
        language: 'python' 
      })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

async function testAllEndpoints() {
  console.log('🔍 Testing all backend endpoints...\n');
  
  const endpoints = [
    { name: '/run', method: 'POST', body: { code: 'print("test")', language: 'python' } },
    { name: '/run-stream', method: 'GET', params: 'code=print("test")&language=python' },
    { name: '/send-input', method: 'POST', body: { sessionId: 'test123', input: 'test' } },
    { name: '/generate', method: 'POST', body: { task: 'generate', content: 'print hello', language: 'python' } }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📝 Testing ${endpoint.name}...`);
    
    try {
      let url = `${BACKEND_URL}${endpoint.name}`;
      if (endpoint.params) {
        url += `?${endpoint.params}`;
      }
      
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(url, options);
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`  ✅ ${endpoint.name} is working`);
      } else {
        console.log(`  ⚠️  ${endpoint.name} returned ${response.status}`);
      }
      
    } catch (error) {
      console.log(`  ❌ ${endpoint.name} error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  await testAllEndpoints();
  console.log('─'.repeat(50));
  await testAIEndpoint();
}

main().catch(console.error); 
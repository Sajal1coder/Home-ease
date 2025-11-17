const { QdrantClient } = require('@qdrant/js-client-rest');
const { generateEmbedding } = require('./ingest-data');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const qdrantClient = new QdrantClient({ 
  url: process.env.QDRANT_URL || 'http://localhost:6333' 
});

const COLLECTION_NAME = 'homeease_knowledge';

async function testSearch(query) {
  console.log(`\n🔍 Searching for: "${query}"\n`);
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // Search in Qdrant
  const searchResults = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 3,
    with_payload: true
  });
  
  console.log(`📊 Found ${searchResults.length} results:\n`);
  
  searchResults.forEach((result, index) => {
    console.log(`${index + 1}. Score: ${result.score.toFixed(4)}`);
    console.log(`   Type: ${result.payload.type}`);
    if (result.payload.type === 'faq') {
      console.log(`   Question: ${result.payload.question}`);
      console.log(`   Answer: ${result.payload.answer.substring(0, 100)}...`);
    } else {
      console.log(`   Title: ${result.payload.title}`);
      console.log(`   Route: ${result.payload.route}`);
      console.log(`   Description: ${result.payload.description}`);
    }
    console.log('');
  });
}

async function main() {
  const testQueries = [
    'How do I book a service?',
    'Where can I see my bookings?',
    'What payment methods are accepted?',
    'How to create a new property listing?',
    'Contact support'
  ];
  
  console.log('🧪 Testing vector search...');
  
  for (const query of testQueries) {
    await testSearch(query);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✅ Search tests completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSearch };

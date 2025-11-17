const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize clients
const qdrantClient = new QdrantClient({ 
  url: process.env.QDRANT_URL || 'http://localhost:6333' 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const COLLECTION_NAME = 'homeease_knowledge';
const EMBEDDING_MODEL = 'text-embedding-004';
const VECTOR_SIZE = 768;

// Create collection if it doesn't exist
async function createCollection() {
  try {
    await qdrantClient.getCollection(COLLECTION_NAME);
    console.log(`✅ Collection '${COLLECTION_NAME}' already exists`);
  } catch (error) {
    console.log(`📦 Creating collection '${COLLECTION_NAME}'...`);
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });
    console.log(`✅ Collection created successfully`);
  }
}

// Generate embeddings using Gemini
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Process FAQs CSV
async function processFAQs(filePath) {
  const faqs = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        faqs.push({
          id: parseInt(row.id),
          question: row.question,
          answer: row.answer,
          type: 'faq'
        });
      })
      .on('end', () => {
        console.log(`📚 Loaded ${faqs.length} FAQs`);
        resolve(faqs);
      })
      .on('error', reject);
  });
}

// Process Navigation Tags CSV
async function processNavigationTags(filePath) {
  const navTags = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        navTags.push({
          id: parseInt(row.id),
          route: row.route,
          title: row.title,
          description: row.description,
          category: row.category,
          keywords: row.keywords,
          type: 'navigation'
        });
      })
      .on('end', () => {
        console.log(`🧭 Loaded ${navTags.length} navigation tags`);
        resolve(navTags);
      })
      .on('error', reject);
  });
}

// Ingest data into Qdrant
async function ingestData(items) {
  console.log(`\n🔄 Processing ${items.length} items for ingestion...`);
  
  const points = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Create text for embedding
    let textToEmbed;
    if (item.type === 'faq') {
      textToEmbed = `${item.question} ${item.answer}`;
    } else {
      textToEmbed = `${item.title} ${item.description} ${item.keywords}`;
    }
    
    console.log(`  Processing ${i + 1}/${items.length}: ${item.type} - ${item.question || item.title}`);
    
    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);
    
    // Prepare point for Qdrant
    points.push({
      id: item.type === 'faq' ? item.id : item.id + 1000, // Offset nav IDs
      vector: embedding,
      payload: item
    });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Upsert points to Qdrant
  console.log(`\n💾 Uploading ${points.length} vectors to Qdrant...`);
  await qdrantClient.upsert(COLLECTION_NAME, {
    points: points
  });
  
  console.log(`✅ Successfully ingested ${points.length} items`);
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting data ingestion process...\n');
    
    // Create collection
    await createCollection();
    
    // Load data
    const faqsPath = path.join(__dirname, '../../faqs.csv');
    const navTagsPath = path.join(__dirname, '../../navigation-tags.csv');
    
    const faqs = await processFAQs(faqsPath);
    const navTags = await processNavigationTags(navTagsPath);
    
    // Combine all data
    const allData = [...faqs, ...navTags];
    
    // Ingest data
    await ingestData(allData);
    
    // Verify collection
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log(`\n📊 Collection stats:`, {
      pointsCount: collectionInfo.points_count,
      vectorSize: collectionInfo.config.params.vectors.size
    });
    
    console.log('\n✨ Data ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateEmbedding, createCollection, ingestData };

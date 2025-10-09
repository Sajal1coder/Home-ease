const fs = require('fs');
const path = require('path');

// Create sample image placeholders
const createSampleImages = () => {
  console.log('🖼️  Creating sample image placeholders...');
  
  const uploadsDir = path.join(__dirname, '../public/uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }

  // Sample image URLs (using placeholder services)
  const sampleImageUrls = {
    // Property images
    'sample-property-1.jpg': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
    'sample-property-2.jpg': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
    'sample-property-3.jpg': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop',
    'sample-property-4.jpg': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
    'sample-property-5.jpg': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
    
    // Government ID placeholders
    'sample-govt-id-1.jpg': 'https://via.placeholder.com/400x250/cccccc/666666?text=Government+ID+Sample',
    'sample-govt-id-2.jpg': 'https://via.placeholder.com/400x250/dddddd/777777?text=ID+Document+Sample',
    
    // Profile images
    'profile-1.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'profile-2.jpg': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'profile-3.jpg': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'profile-4.jpg': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'profile-5.jpg': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'profile-6.jpg': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'profile-7.jpg': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'profile-8.jpg': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    'profile-9.jpg': 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    'profile-10.jpg': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    'profile-11.jpg': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    'profile-12.jpg': 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face',
    'profile-13.jpg': 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face',
    'profile-14.jpg': 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    'profile-15.jpg': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    'profile-16.jpg': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'profile-17.jpg': 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=150&h=150&fit=crop&crop=face',
    'profile-18.jpg': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    'profile-19.jpg': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    'profile-20.jpg': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  };

  // Create placeholder files with image URLs as comments
  Object.entries(sampleImageUrls).forEach(([filename, url]) => {
    const filePath = path.join(uploadsDir, filename);
    const content = `# Placeholder for ${filename}\n# Image URL: ${url}\n# This file represents a sample image for seeding purposes.`;
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
    }
  });

  console.log(`✅ Created ${Object.keys(sampleImageUrls).length} sample image placeholders`);
  console.log('📝 Note: These are placeholder files. In production, you would use actual images.');
  
  return Object.keys(sampleImageUrls);
};

// Run if called directly
if (require.main === module) {
  createSampleImages();
}

module.exports = { createSampleImages };

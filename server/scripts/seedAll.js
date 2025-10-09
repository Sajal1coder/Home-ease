const { seedUsers } = require('./seedUsers');
const { seedProperties } = require('./seedProperties');

const seedAll = async () => {
  console.log('🚀 Starting complete database seeding...\n');
  
  try {
    // First seed users
    console.log('Step 1: Seeding Users');
    console.log('='.repeat(50));
    await seedUsers();
    
    console.log('\n' + '='.repeat(50));
    console.log('Step 2: Seeding Properties');
    console.log('='.repeat(50));
    
    // Then seed properties
    await seedProperties();
    
    console.log('\n' + '🎊 Complete seeding finished successfully!');
    console.log('🏠 Your Homease database now has:');
    console.log('   • 20 sample users (property owners)');
    console.log('   • 50 diverse properties across 15 Indian cities');
    console.log('   • Realistic pricing, amenities, and descriptions');
    console.log('   • Mix of verified and pending properties');
    console.log('\n💡 You can now:');
    console.log('   • Browse properties on the homepage');
    console.log('   • Test search and filtering functionality');
    console.log('   • View individual property pages');
    console.log('   • Test booking functionality');
    
  } catch (error) {
    console.error('❌ Error during complete seeding:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedAll();
}

module.exports = { seedAll };

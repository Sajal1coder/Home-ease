const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  makeAdmin();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function makeAdmin() {
  try {
    // Get email from command line argument
    const email = process.argv[2];

    if (!email) {
      console.log('\n❌ Please provide an email address');
      console.log('Usage: node makeAdmin.js <email>');
      console.log('Example: node makeAdmin.js user@example.com\n');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log(`\n❌ User with email "${email}" not found`);
      console.log('💡 Tip: Make sure the user has registered first\n');
      process.exit(1);
    }

    // Check if already admin
    if (user.isAdmin) {
      console.log(`\n✅ ${user.firstName} ${user.lastName} is already an admin!\n`);
      process.exit(0);
    }

    // Make user admin
    user.isAdmin = true;
    await user.save();

    console.log('\n🎉 SUCCESS! User is now an admin:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name:  ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Admin: ${user.isAdmin ? '✅ Yes' : '❌ No'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error making user admin:', error.message);
    process.exit(1);
  }
}

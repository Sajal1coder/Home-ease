const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const User = require('../models/User');

// Sample user data
const sampleUsers = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@example.com',
    profileImagePath: 'uploads/profile-1.jpg'
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    profileImagePath: 'uploads/profile-2.jpg'
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@example.com',
    profileImagePath: 'uploads/profile-3.jpg'
  },
  {
    firstName: 'Sneha',
    lastName: 'Gupta',
    email: 'sneha.gupta@example.com',
    profileImagePath: 'uploads/profile-4.jpg'
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@example.com',
    profileImagePath: 'uploads/profile-5.jpg'
  },
  {
    firstName: 'Anita',
    lastName: 'Verma',
    email: 'anita.verma@example.com',
    profileImagePath: 'uploads/profile-6.jpg'
  },
  {
    firstName: 'Rohit',
    lastName: 'Agarwal',
    email: 'rohit.agarwal@example.com',
    profileImagePath: 'uploads/profile-7.jpg'
  },
  {
    firstName: 'Kavya',
    lastName: 'Nair',
    email: 'kavya.nair@example.com',
    profileImagePath: 'uploads/profile-8.jpg'
  },
  {
    firstName: 'Arjun',
    lastName: 'Reddy',
    email: 'arjun.reddy@example.com',
    profileImagePath: 'uploads/profile-9.jpg'
  },
  {
    firstName: 'Meera',
    lastName: 'Joshi',
    email: 'meera.joshi@example.com',
    profileImagePath: 'uploads/profile-10.jpg'
  },
  {
    firstName: 'Karan',
    lastName: 'Malhotra',
    email: 'karan.malhotra@example.com',
    profileImagePath: 'uploads/profile-11.jpg'
  },
  {
    firstName: 'Pooja',
    lastName: 'Bansal',
    email: 'pooja.bansal@example.com',
    profileImagePath: 'uploads/profile-12.jpg'
  },
  {
    firstName: 'Sanjay',
    lastName: 'Chopra',
    email: 'sanjay.chopra@example.com',
    profileImagePath: 'uploads/profile-13.jpg'
  },
  {
    firstName: 'Ritu',
    lastName: 'Kapoor',
    email: 'ritu.kapoor@example.com',
    profileImagePath: 'uploads/profile-14.jpg'
  },
  {
    firstName: 'Deepak',
    lastName: 'Yadav',
    email: 'deepak.yadav@example.com',
    profileImagePath: 'uploads/profile-15.jpg'
  },
  {
    firstName: 'Sunita',
    lastName: 'Mishra',
    email: 'sunita.mishra@example.com',
    profileImagePath: 'uploads/profile-16.jpg'
  },
  {
    firstName: 'Manish',
    lastName: 'Tiwari',
    email: 'manish.tiwari@example.com',
    profileImagePath: 'uploads/profile-17.jpg'
  },
  {
    firstName: 'Neha',
    lastName: 'Sinha',
    email: 'neha.sinha@example.com',
    profileImagePath: 'uploads/profile-18.jpg'
  },
  {
    firstName: 'Rahul',
    lastName: 'Bhatt',
    email: 'rahul.bhatt@example.com',
    profileImagePath: 'uploads/profile-19.jpg'
  },
  {
    firstName: 'Swati',
    lastName: 'Pandey',
    email: 'swati.pandey@example.com',
    profileImagePath: 'uploads/profile-20.jpg'
  }
];

const seedUsers = async () => {
  try {
    console.log('👥 Starting user seeding process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "Home-ease"
    });
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingUsersCount = await User.countDocuments({ isAdmin: { $ne: true } });
    
    if (existingUsersCount >= 10) {
      console.log(`✅ Found ${existingUsersCount} existing users. Skipping user seeding.`);
      await mongoose.connection.close();
      return;
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Prepare user data
    const usersToInsert = sampleUsers.map(user => ({
      ...user,
      password: hashedPassword,
      verified: Math.random() > 0.2, // 80% verified users
      verifiedAt: Math.random() > 0.2 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null
    }));

    // Insert users
    await User.insertMany(usersToInsert);
    
    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
    const verifiedUsers = await User.countDocuments({ verified: true, isAdmin: { $ne: true } });
    
    console.log('\n🎉 User seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Total Users: ${totalUsers}`);
    console.log(`   • Verified Users: ${verifiedUsers}`);
    console.log(`   • Default Password: password123`);
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding script
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers };

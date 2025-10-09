const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Listing = require('../models/Listing');
const User = require('../models/User');

// Sample data arrays
const cities = [
  { name: 'Mumbai', province: 'Maharashtra' },
  { name: 'Delhi', province: 'Delhi' },
  { name: 'Kolkata', province: 'West Bengal' },
  { name: 'Banglore', province: 'Karnataka' },
  { name: 'Lucknow', province: 'Uttar Pradesh' },
  { name: 'Hydrabad', province: 'Telangana' },
  { name: 'Pune', province: 'Maharashtra' },
  { name: 'Chennai', province: 'Tamil Nadu' },
  { name: 'Ahmedabad', province: 'Gujarat' },
  { name: 'Chandigarh', province: 'Chandigarh' },
  { name: 'Bhopal', province: 'Madhya Pradesh' },
  { name: 'Guwahati', province: 'Assam' },
  { name: 'Jaipur', province: 'Rajasthan' },
  { name: 'Surat', province: 'Gujarat' },
  { name: 'Varanasi', province: 'Uttar Pradesh' }
];

const categories = [
  'Mumbai', 'Delhi', 'Kolkata', 'Banglore', 'Lucknow', 'Hydrabad', 
  'Pune', 'Chennai', 'Ahmedabad', 'Chandigarh', 'Bhopal', 
  'Guwahati', 'Jaipur', 'Surat', 'Varanasi'
];

const types = [
  'An entire place',
  'Room(s)',
  'A Shared Room'
];

const amenitiesList = [
  'Bath tub', 'Personal care products', 'Outdoor shower', 'Washer', 'Dryer',
  'Hangers', 'Iron', 'TV', 'Dedicated workspace', 'Air Conditioning',
  'Heating', 'Security cameras', 'Fire extinguisher', 'First Aid', 'Wifi',
  'Cooking set', 'Refrigerator', 'Microwave', 'Stove', 'Barbecue grill',
  'Outdoor dining area', 'Private patio or Balcony', 'Camp fire', 'Garden',
  'Free parking', 'Self check-in', 'Pet allowed'
];

const streetNames = [
  'MG Road', 'Park Street', 'Brigade Road', 'Commercial Street', 'Linking Road',
  'Hill Road', 'Carter Road', 'Marine Drive', 'Residency Road', 'Church Street',
  'Cunningham Road', 'Richmond Road', 'Kasturba Gandhi Marg', 'Connaught Place',
  'Khan Market', 'Lajpat Nagar', 'Karol Bagh', 'Rajouri Garden', 'Nehru Place',
  'Sector 17', 'Sector 22', 'Sector 35', 'Model Town', 'Civil Lines'
];

const propertyTitles = [
  'Cozy Studio Apartment in Heart of',
  'Spacious 2BHK with Modern Amenities in',
  'Luxury 3BHK Penthouse in Prime',
  'Comfortable 1BHK for Professionals in',
  'Beautiful Family Home in Peaceful',
  'Modern Apartment with City Views in',
  'Elegant 2BHK with Balcony in',
  'Furnished Studio near Metro in',
  'Premium 3BHK with Parking in',
  'Charming 1BHK in Residential Area of',
  'Stylish 2BHK with Garden Access in',
  'Contemporary Flat in Business District of',
  'Serene 1BHK Away from City Noise in',
  'Deluxe 3BHK with All Facilities in',
  'Compact Studio Perfect for Singles in'
];

const descriptions = [
  'A well-maintained property perfect for comfortable living. Features modern amenities and is located in a prime area with easy access to public transport, shopping centers, and restaurants.',
  'This beautiful home offers a perfect blend of comfort and convenience. Situated in a peaceful neighborhood, it provides easy access to schools, hospitals, and major commercial areas.',
  'Ideal for professionals and families alike, this property boasts excellent connectivity and is surrounded by all essential amenities. The area is known for its safety and vibrant community.',
  'A stunning property that combines modern architecture with traditional comfort. Located in one of the most sought-after areas, it offers great investment potential and lifestyle benefits.',
  'This spacious home is perfect for those seeking a comfortable living experience. The property is well-connected to major business hubs and offers a peaceful environment for residents.',
  'Experience luxury living in this beautifully designed property. With top-notch amenities and excellent location advantages, it\'s perfect for modern urban lifestyle.',
  'A perfect home for families looking for comfort and convenience. The property offers excellent amenities and is located in a well-developed area with good infrastructure.',
  'This property offers the perfect combination of affordability and comfort. Located in a developing area with great future prospects and excellent connectivity options.'
];

const highlights = [
  'Prime Location with Easy Connectivity',
  'Modern Amenities and Facilities',
  '24/7 Security and Power Backup',
  'Near Metro Station and Bus Stop',
  'Peaceful Residential Area',
  'Close to Schools and Hospitals',
  'Shopping Centers Nearby',
  'Excellent Investment Opportunity',
  'Fully Furnished and Ready to Move',
  'Garden and Parking Available'
];

const highlightDescriptions = [
  'Located in the heart of the city with excellent connectivity to all major areas. Public transport is easily accessible, making daily commute hassle-free.',
  'The property comes with all modern amenities including high-speed internet, air conditioning, and modern kitchen appliances for a comfortable living experience.',
  'Round-the-clock security ensures safety of residents. Power backup facility ensures uninterrupted electricity supply throughout the day.',
  'Just a few minutes walk from the nearest metro station and bus stop. Multiple transportation options available for easy connectivity to different parts of the city.',
  'Situated in a quiet and peaceful residential area, away from the hustle and bustle of the city, yet well-connected to all major commercial areas.',
  'Educational institutions and healthcare facilities are within walking distance, making it perfect for families with children and elderly members.',
  'Major shopping malls, markets, and restaurants are nearby, providing all daily necessities and entertainment options within easy reach.',
  'Located in a rapidly developing area with excellent appreciation potential. Perfect for both end-users and investors looking for good returns.',
  'The property comes fully furnished with all necessary furniture and appliances. Just bring your belongings and start living comfortably.',
  'Beautiful garden area for morning walks and children to play. Dedicated parking space ensures your vehicle\'s safety and convenience.'
];

// Sample property images (using placeholder images)
const sampleImages = [
  'uploads/sample-property-1.jpg',
  'uploads/sample-property-2.jpg',
  'uploads/sample-property-3.jpg',
  'uploads/sample-property-4.jpg',
  'uploads/sample-property-5.jpg'
];

const sampleGovtIds = [
  'uploads/sample-govt-id-1.jpg',
  'uploads/sample-govt-id-2.jpg'
];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate property data
const generatePropertyData = (creator, index) => {
  const city = getRandomElement(cities);
  const category = city.name;
  const type = getRandomElement(types);
  const bedroomCount = getRandomNumber(1, 4);
  const bathroomCount = Math.min(bedroomCount, getRandomNumber(1, 3));
  const bedCount = bedroomCount + getRandomNumber(0, 2);
  const guestCount = bedCount + getRandomNumber(1, 3);
  
  // Select random amenities (3-8 amenities per property)
  const selectedAmenities = getRandomElements(amenitiesList, getRandomNumber(3, 8));
  
  // Generate price based on city and property type
  const basePrices = {
    'Mumbai': { min: 25000, max: 80000 },
    'Delhi': { min: 20000, max: 70000 },
    'Banglore': { min: 18000, max: 60000 },
    'Pune': { min: 15000, max: 50000 },
    'Chennai': { min: 15000, max: 45000 },
    'Hydrabad': { min: 12000, max: 40000 },
    'Ahmedabad': { min: 10000, max: 35000 },
    'Kolkata': { min: 8000, max: 30000 },
    'Jaipur': { min: 8000, max: 25000 },
    'Lucknow': { min: 7000, max: 25000 },
    'Chandigarh': { min: 12000, max: 35000 },
    'Bhopal': { min: 6000, max: 20000 },
    'Guwahati': { min: 5000, max: 18000 },
    'Surat': { min: 8000, max: 25000 },
    'Varanasi': { min: 5000, max: 15000 }
  };
  
  const cityPrices = basePrices[city.name] || { min: 8000, max: 30000 };
  let basePrice = getRandomNumber(cityPrices.min, cityPrices.max);
  
  // Adjust price based on property type and size
  if (type === 'An entire place') basePrice *= 1.5;
  if (type === 'A Shared Room') basePrice *= 0.6;
  basePrice = Math.round(basePrice * (0.8 + (bedroomCount * 0.3)));
  
  const titlePrefix = getRandomElement(propertyTitles);
  const title = `${titlePrefix} ${city.name}`;
  
  return {
    creator: creator._id,
    category: category,
    type: type,
    streetAddress: `${getRandomNumber(1, 999)} ${getRandomElement(streetNames)}`,
    aptSuite: `Apt ${getRandomNumber(1, 50)}${getRandomElement(['A', 'B', 'C', ''])}`,
    city: city.name,
    province: city.province,
    country: 'India',
    guestCount: guestCount,
    bedroomCount: bedroomCount,
    bedCount: bedCount,
    bathroomCount: bathroomCount,
    amenities: [selectedAmenities.join(',')],
    listingPhotoPaths: getRandomElements(sampleImages, getRandomNumber(3, 5)),
    title: title,
    govtIdPath: getRandomElements(sampleGovtIds, getRandomNumber(1, 2)),
    description: getRandomElement(descriptions),
    highlight: getRandomElement(highlights),
    highlightDesc: getRandomElement(highlightDescriptions),
    price: basePrice,
    verified: Math.random() > 0.3, // 70% properties are verified
    verifiedAt: Math.random() > 0.3 ? new Date(Date.now() - getRandomNumber(1, 90) * 24 * 60 * 60 * 1000) : null,
    status: Math.random() > 0.1 ? 'active' : 'pending', // 90% active, 10% pending
    active: true
  };
};

// Main seeding function
const seedProperties = async () => {
  try {
    console.log('🌱 Starting property seeding process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "Home-ease"
    });
    console.log('✅ Connected to MongoDB');

    // Get existing users to assign as property creators
    const users = await User.find({ isAdmin: { $ne: true } }).limit(20);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${users.length} users to assign as property creators`);

    // Clear existing listings (optional - comment out if you want to keep existing data)
    // await Listing.deleteMany({});
    // console.log('🗑️  Cleared existing properties');

    // Generate and insert properties
    const properties = [];
    
    for (let i = 0; i < 50; i++) {
      const randomUser = getRandomElement(users);
      const propertyData = generatePropertyData(randomUser, i);
      properties.push(propertyData);
    }

    // Insert properties in batches for better performance
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      await Listing.insertMany(batch);
      insertedCount += batch.length;
      console.log(`📝 Inserted ${insertedCount}/${properties.length} properties...`);
    }

    // Update user property lists
    console.log('🔄 Updating user property lists...');
    const insertedProperties = await Listing.find({}).populate('creator');
    
    for (const property of insertedProperties) {
      await User.findByIdAndUpdate(
        property.creator._id,
        { $addToSet: { propertyList: property._id } }
      );
    }

    // Display summary
    const totalProperties = await Listing.countDocuments();
    const verifiedProperties = await Listing.countDocuments({ verified: true });
    const activeProperties = await Listing.countDocuments({ status: 'active' });
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Total Properties: ${totalProperties}`);
    console.log(`   • Verified Properties: ${verifiedProperties}`);
    console.log(`   • Active Properties: ${activeProperties}`);
    console.log(`   • Cities Covered: ${cities.length}`);
    console.log(`   • Price Range: ₹5,000 - ₹80,000 per month`);
    
    // Display city-wise distribution
    console.log('\n🏙️  City-wise Distribution:');
    for (const city of cities) {
      const count = await Listing.countDocuments({ city: city.name });
      if (count > 0) {
        console.log(`   • ${city.name}: ${count} properties`);
      }
    }

  } catch (error) {
    console.error('❌ Error seeding properties:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding script
if (require.main === module) {
  seedProperties();
}

module.exports = { seedProperties, generatePropertyData };

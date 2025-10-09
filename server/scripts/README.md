# 🌱 Homease Database Seeding Scripts

This directory contains scripts to populate your Homease database with realistic sample data for development and testing purposes.

## 📋 What Gets Seeded

### 👥 Users (20 sample users)
- Realistic Indian names and email addresses
- Profile images (placeholders)
- 80% verified users, 20% unverified
- Default password: `password123` for all users

### 🏠 Properties (50 sample properties)
- **15 Indian Cities**: Mumbai, Delhi, Bangalore, Pune, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow, Chandigarh, Bhopal, Guwahati, Surat, Varanasi
- **Property Types**: Entire place, Rooms, Shared rooms
- **Realistic Pricing**: ₹5,000 - ₹80,000/month based on city and property type
- **Amenities**: 3-8 random amenities per property from 27 available options
- **Property Details**: Bedrooms (1-4), bathrooms, guest capacity, etc.
- **Status Distribution**: 90% active, 10% pending, 70% verified

## 🚀 Quick Start

### Option 1: Seed Everything (Recommended)
```bash
cd server
npm run seed
```

### Option 2: Seed Individually
```bash
# Create sample image placeholders
npm run seed:images

# Seed users first
npm run seed:users

# Then seed properties
npm run seed:properties
```

## 📁 File Structure

```
scripts/
├── README.md              # This file
├── seedAll.js            # Master script (runs users + properties)
├── seedUsers.js          # Creates 20 sample users
├── seedProperties.js     # Creates 50 sample properties
└── createSampleImages.js # Creates image placeholders
```

## 🔧 Prerequisites

1. **MongoDB Connection**: Ensure your `.env` file has a valid `MONGO_URL`
2. **Database**: The scripts will use the `Home-ease` database
3. **Node.js**: Make sure you're in the `/server` directory

## 📊 Sample Data Details

### Cities & Pricing
| City | Price Range (₹/month) | Properties |
|------|----------------------|------------|
| Mumbai | 25,000 - 80,000 | ~3-4 |
| Delhi | 20,000 - 70,000 | ~3-4 |
| Bangalore | 18,000 - 60,000 | ~3-4 |
| Pune | 15,000 - 50,000 | ~3-4 |
| Chennai | 15,000 - 45,000 | ~3-4 |
| Others | 5,000 - 35,000 | ~2-3 each |

### Amenities Included
- **Basic**: Wifi, TV, Air Conditioning, Heating
- **Kitchen**: Refrigerator, Microwave, Cooking set, Stove
- **Bathroom**: Bath tub, Personal care products, Outdoor shower
- **Laundry**: Washer, Dryer, Hangers, Iron
- **Safety**: Security cameras, Fire extinguisher, First Aid
- **Outdoor**: Garden, Balcony, Barbecue grill, Free parking
- **Special**: Pet allowed, Self check-in, Dedicated workspace

## 🛠️ Customization

### Modify Property Count
Edit `seedProperties.js` line 185:
```javascript
for (let i = 0; i < 50; i++) { // Change 50 to desired number
```

### Add More Cities
Edit the `cities` array in `seedProperties.js`:
```javascript
const cities = [
  { name: 'YourCity', province: 'YourState' },
  // ... existing cities
];
```

### Adjust Price Ranges
Modify the `basePrices` object in `seedProperties.js`:
```javascript
const basePrices = {
  'YourCity': { min: 10000, max: 30000 },
  // ... existing prices
};
```

## 🧹 Clearing Data

To clear existing data before seeding, uncomment these lines in `seedProperties.js`:
```javascript
// Clear existing listings (optional)
await Listing.deleteMany({});
console.log('🗑️  Cleared existing properties');
```

## 🔍 Verification

After seeding, you can verify the data:

### Check Database
```bash
# Connect to MongoDB and run:
use Home-ease
db.listings.countDocuments()  # Should show 50
db.users.countDocuments()     # Should show 20+ (including existing)
```

### Check Application
1. Start your server: `npm start`
2. Visit `http://localhost:3000`
3. Browse properties on homepage
4. Test search and filtering
5. View individual property pages

## 🚨 Important Notes

### Image Placeholders
- The seeding scripts create placeholder image files
- In production, replace with actual property images
- Image paths are stored in database as `uploads/filename.jpg`

### User Credentials
- All seeded users have password: `password123`
- Use these for testing login functionality
- Example: `rajesh.kumar@example.com` / `password123`

### Performance
- Seeding 50 properties takes ~10-30 seconds
- Uses batch insertion for better performance
- Automatically updates user property lists

## 🐛 Troubleshooting

### "No users found" Error
```bash
# Run user seeding first
npm run seed:users
```

### MongoDB Connection Issues
- Check your `.env` file has correct `MONGO_URL`
- Ensure MongoDB is running
- Verify database name is `Home-ease`

### Permission Errors
```bash
# Make sure you're in the server directory
cd server
npm run seed
```

## 📈 Next Steps

After seeding:
1. **Test Core Features**: Search, filtering, property details
2. **Performance Testing**: Check LCP with 50+ properties
3. **User Experience**: Test booking flow with sample data
4. **Admin Features**: Use admin panel to manage properties
5. **API Testing**: Test all endpoints with realistic data

## 🎯 Production Considerations

- Replace placeholder images with real property photos
- Implement image optimization (WebP, responsive images)
- Add proper image CDN (Cloudinary, AWS S3)
- Set up automated seeding for staging environments
- Create data migration scripts for production updates

---

**Happy Seeding! 🌱** Your Homease application now has realistic data to work with.

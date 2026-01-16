/**
 * Seed script to create initial test data
 * Run with: node scripts/seed-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Office = require('../models/Office');
const User = require('../models/User');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hungry-foodicsers', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Office.deleteMany({});
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create offices
    const offices = [
      {
        name: 'Cairo Office',
        location: 'New Cairo',
        city: 'Cairo',
        country: 'Egypt',
      },
      {
        name: 'Dubai Office',
        location: 'Dubai Marina',
        city: 'Dubai',
        country: 'UAE',
      },
      {
        name: 'Riyadh Office',
        location: 'King Fahd Road',
        city: 'Riyadh',
        country: 'Saudi Arabia',
      },
    ];

    const createdOffices = [];
    for (const officeData of offices) {
      let office = await Office.findOne({ name: officeData.name });
      if (!office) {
        office = await Office.create(officeData);
        console.log(`✅ Created office: ${office.name}`);
      } else {
        console.log(`ℹ️  Office already exists: ${office.name}`);
      }
      createdOffices.push(office);
    }

    // Create test users
    const users = [
      {
        name: 'Ahmed Mohamed',
        email: 'ahmed@foodics.com',
        password: 'password123',
        office: createdOffices[0]._id, // Cairo Office
        role: 'user',
      },
      {
        name: 'Sara Ali',
        email: 'sara@foodics.com',
        password: 'password123',
        office: createdOffices[0]._id, // Cairo Office
        role: 'user',
      },
      {
        name: 'Mohamed Emad',
        email: 'mohamed@foodics.com',
        password: 'password123',
        office: createdOffices[0]._id, // Cairo Office
        role: 'user',
      },
      {
        name: 'Admin User',
        email: 'admin@foodics.com',
        password: 'admin123',
        office: createdOffices[0]._id, // Cairo Office
        role: 'admin',
      },
    ];

    for (const userData of users) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`ℹ️  User already exists: ${user.email}`);
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: ahmed@foodics.com');
    console.log('   Password: password123');
    console.log('\n   Email: sara@foodics.com');
    console.log('   Password: password123');
    console.log('\n   Email: mohamed@foodics.com');
    console.log('   Password: password123');
    console.log('\n   Email: admin@foodics.com');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

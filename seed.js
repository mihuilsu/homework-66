/**
 * Seed script — populates the "items" collection in MongoDB Atlas with sample data.
 * Run once with: node seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Item from './models/Item.js';

const sampleItems = [
  {
    title: 'Introduction to Node.js',
    description: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It enables server-side JavaScript execution with a non-blocking, event-driven architecture.',
    category: 'Backend',
    author: 'mihuilsu',
  },
  {
    title: 'Getting Started with MongoDB Atlas',
    description: 'MongoDB Atlas is a fully managed cloud database service. It offers automated backups, scaling, and monitoring out of the box.',
    category: 'Database',
    author: 'mihuilsu',
  },
  {
    title: 'Passport.js Authentication Strategies',
    description: 'Passport is authentication middleware for Node.js. It supports over 500 strategies, including local, OAuth, JWT, and more.',
    category: 'Security',
    author: 'mihuilsu',
  },
  {
    title: 'Express.js Routing Best Practices',
    description: 'Organizing Express routes into separate modules keeps the codebase maintainable as the application grows.',
    category: 'Backend',
    author: 'mihuilsu',
  },
  {
    title: 'Mongoose Schema Design',
    description: 'Mongoose provides a schema-based solution for modeling application data. Validators and middleware hooks make data integrity easy to enforce.',
    category: 'Database',
    author: 'mihuilsu',
  },
  {
    title: 'Environment Variables with dotenv',
    description: 'Storing configuration in environment variables keeps sensitive data out of source control and makes deployment to different environments seamless.',
    category: 'DevOps',
    author: 'mihuilsu',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data before seeding
    await Item.deleteMany({});
    console.log('🗑️  Cleared existing items');

    const inserted = await Item.insertMany(sampleItems);
    console.log(`🌱 Seeded ${inserted.length} items successfully`);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    process.exit(0);
  }
};

seed();

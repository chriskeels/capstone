// scripts/seed-products.ts
// Script to seed the database with candle products.
// Run with: npx tsx scripts/seed-products.ts

import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '../.env.local' });

import { prisma } from '../lib/prisma';

const regularScents = [
  'Sweet tobacco',
  'Blossom soap',
  'Ocean breeze',
  'Cologne',
  'Fresh cotton',
  'Black spruce',
  'Midnight musk',
  'Myrrh',
  'Vetiver',
  'Forest pine',
  'Fresh linen',
  'Rain',
  'Blue Mystique',
  'Bamboo',
  'Frankincense',
  'Rosewood',
  'Lemon',
  'Lavender',
  'Sage',
  'Sandalwood',
  'Lilac',
  'Cherry blossom',
  'Baby powder',
  'Chamomile',
  'Eucalyptus',
  'Peppermint',
  'Vanilla',
  'Banana',
  'Mountain air',
  'Chocolate',
  'Coffee',
  'Gardenia',
  'Soft powder',
  'Baby Rum',
  'Bitter Coffee',
  'Jasmine',
  'Spearmint',
  'Early Morning',
  'Morning Dew',
  'Lemon Lavender',
  'Fantasy Rain Forest',
  'White Sandalwood',
  'Sea Salt + Sage',
  'Seabreeze',
  'The Secret wood',
  'Lavender Eucalyptus',
  'Oceans'
];

const signatureScents = [
  'Strawberry Milkshake',
  'Cookies and Milk',
  'Hot Chocolate',
  'Fruity pebbles'
];

// Function to assign category based on scent
function assignCategory(scent) {
  const lower = scent.toLowerCase();
  if (lower.includes('lavender') || lower.includes('chamomile') || lower.includes('eucalyptus') || lower.includes('sage') || lower.includes('myrrh') || lower.includes('vetiver') || lower.includes('frankincense') || lower.includes('sandalwood')) {
    return 'RELAXATION';
  }
  if (lower.includes('rosewood') || lower.includes('lilac') || lower.includes('cherry blossom') || lower.includes('jasmine') || lower.includes('vanilla') || lower.includes('chocolate') || lower.includes('strawberry') || lower.includes('cookies') || lower.includes('hot chocolate') || lower.includes('fruity')) {
    return 'ROMANCE';
  }
  if (lower.includes('lemon') || lower.includes('peppermint') || lower.includes('spearmint') || lower.includes('eucalyptus')) {
    return 'ENERGY';
  }
  if (lower.includes('chamomile') || lower.includes('lavender')) {
    return 'SLEEP';
  }
  if (lower.includes('black spruce') || lower.includes('forest pine') || lower.includes('bamboo')) {
    return 'FOCUS';
  }
  if (lower.includes('ocean') || lower.includes('rain') || lower.includes('mountain air') || lower.includes('seabreeze') || lower.includes('oceans')) {
    return 'SEASONAL';
  }
  return 'RELAXATION'; // default
}

async function seedProducts() {
  console.log('Seeding products...');

  for (const scent of regularScents) {
    const slug = scent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = assignCategory(scent);
    const description = `Experience the soothing aroma of ${scent} in this hand-poured candle. Perfect for creating a relaxing atmosphere.`;
    const shortDescription = `Hand-poured ${scent} candle.`;

    try {
      await prisma.product.create({
        data: {
          name: scent,
          slug,
          description,
          shortDescription,
          price: 25.00,
          size: '8 oz',
          category,
          scent,
          burnTime: 40, // assuming 40 hours for 8oz
          externalUrl: '#', // placeholder
          isActive: true,
        },
      });
      console.log(`Created: ${scent}`);
    } catch (error) {
      console.error(`Error creating ${scent}:`, error.message);
    }
  }

  for (const scent of signatureScents) {
    const slug = scent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = 'LIMITED'; // signature as limited
    const description = `Indulge in our signature ${scent} scent, a unique blend crafted for special moments. Hand-poured with premium ingredients.`;
    const shortDescription = `Signature ${scent} candle.`;

    try {
      await prisma.product.create({
        data: {
          name: scent,
          slug,
          description,
          shortDescription,
          price: 35.00,
          size: '8 oz',
          category,
          scent,
          burnTime: 40,
          externalUrl: '#',
          isActive: true,
        },
      });
      console.log(`Created signature: ${scent}`);
    } catch (error) {
      console.error(`Error creating signature ${scent}:`, error.message);
    }
  }

  console.log('Seeding complete.');
}

seedProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
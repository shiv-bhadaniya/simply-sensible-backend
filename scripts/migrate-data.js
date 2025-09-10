#!/usr/bin/env node

/**
 * Data Migration Script
 * Migrates data from monolithic database to microservices databases
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connections
const originalDB = process.env.ORIGINAL_DB_URL || 'mongodb://localhost:27017/ecommerce';
const authDB = process.env.AUTH_DB_URL || 'mongodb://localhost:27017/auth-service';
const productDB = process.env.PRODUCT_DB_URL || 'mongodb://localhost:27017/product-service';
const orderDB = process.env.ORDER_DB_URL || 'mongodb://localhost:27017/order-service';

async function connectToDatabases() {
  try {
    // Connect to original database
    await mongoose.connect(originalDB);
    console.log('✅ Connected to original database');
    
    // Get database instances
    const originalConnection = mongoose.connection;
    const authConnection = mongoose.createConnection(authDB);
    const productConnection = mongoose.createConnection(productDB);
    const orderConnection = mongoose.createConnection(orderDB);
    
    return { originalConnection, authConnection, productConnection, orderConnection };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function migrateUsers(originalConnection, authConnection) {
  try {
    console.log('🔄 Migrating users...');
    
    const users = await originalConnection.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('⚠️  No users found in original database');
      return;
    }
    
    // Clear existing users in auth database
    await authConnection.collection('users').deleteMany({});
    
    // Insert users into auth database
    await authConnection.collection('users').insertMany(users);
    
    console.log(`✅ Migrated ${users.length} users to auth-service database`);
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

async function migrateProducts(originalConnection, productConnection) {
  try {
    console.log('🔄 Migrating products...');
    
    const products = await originalConnection.collection('products').find({}).toArray();
    
    if (products.length === 0) {
      console.log('⚠️  No products found in original database');
      return;
    }
    
    // Clear existing products in product database
    await productConnection.collection('products').deleteMany({});
    
    // Insert products into product database
    await productConnection.collection('products').insertMany(products);
    
    console.log(`✅ Migrated ${products.length} products to product-service database`);
  } catch (error) {
    console.error('❌ Error migrating products:', error);
    throw error;
  }
}

async function migrateOrders(originalConnection, orderConnection) {
  try {
    console.log('🔄 Migrating orders...');
    
    const orders = await originalConnection.collection('orders').find({}).toArray();
    
    if (orders.length === 0) {
      console.log('⚠️  No orders found in original database');
      return;
    }
    
    // Clear existing orders in order database
    await orderConnection.collection('orders').deleteMany({});
    
    // Insert orders into order database
    await orderConnection.collection('orders').insertMany(orders);
    
    console.log(`✅ Migrated ${orders.length} orders to order-service database`);
  } catch (error) {
    console.error('❌ Error migrating orders:', error);
    throw error;
  }
}

async function verifyMigration(authConnection, productConnection, orderConnection) {
  try {
    console.log('🔍 Verifying migration...');
    
    const userCount = await authConnection.collection('users').countDocuments();
    const productCount = await productConnection.collection('products').countDocuments();
    const orderCount = await orderConnection.collection('orders').countDocuments();
    
    console.log(`📊 Migration Summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Orders: ${orderCount}`);
    
    if (userCount > 0 && productCount > 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with warnings - some collections are empty');
    }
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting data migration from monolithic to microservices...');
  
  try {
    const { originalConnection, authConnection, productConnection, orderConnection } = await connectToDatabases();
    
    // Migrate data
    await migrateUsers(originalConnection, authConnection);
    await migrateProducts(originalConnection, productConnection);
    await migrateOrders(originalConnection, orderConnection);
    
    // Verify migration
    await verifyMigration(authConnection, productConnection, orderConnection);
    
    console.log('🎉 Migration process completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    // Close all connections
    await mongoose.disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as migrateData };

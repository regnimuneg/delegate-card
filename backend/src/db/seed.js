/**
 * Seed script to populate database with test data
 * Run: node src/db/seed.js
 * 
 * Note: This requires the database to be set up first
 * For Supabase, it's easier to use the SQL seed file directly
 */

import { supabaseAdmin } from './supabase.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

if (!supabaseAdmin) {
    console.error('Error: Supabase admin client not configured');
    process.exit(1);
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Hash passwords
        const demoPasswordHash = await hashPassword('demo123');
        const adminPasswordHash = await hashPassword('admin123');

        console.log('✅ Generated password hashes');

        // Insert test users and delegates
        // Note: This is a simplified version - use the SQL file for full seed
        
        console.log('\n📝 Note: For full test data, use the SQL seed file:');
        console.log('   backend/src/db/seed.sql');
        console.log('\n   Run it in Supabase SQL Editor after updating password hashes.');
        console.log('\n   To generate password hashes, run:');
        console.log('   node src/db/generatePasswordHash.js <password>');

        console.log('\n✅ Seed script completed (use SQL file for full seed)');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();


import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import 'dotenv/config';

const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite, { schema });

// Initialize database tables if they don't exist
export const initializeDatabase = async () => {
  try {
    // Create tables using Drizzle migrations would be better, but for quick setup:
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        image TEXT,
        google_id TEXT UNIQUE,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS user_assets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        asset_type TEXT NOT NULL,
        asset_id TEXT NOT NULL,
        custom_name TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS valuation_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        zip_code TEXT NOT NULL,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS valuation_results (
        id TEXT PRIMARY KEY,
        request_id TEXT REFERENCES valuation_requests(id),
        trade_in_value REAL,
        private_party_value REAL,
        retail_value REAL,
        loan_amount REAL,
        ltv_ratio REAL,
        estimated_rate REAL,
        monthly_payment REAL,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS land_assessment_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        street_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS land_assessment_results (
        id TEXT PRIMARY KEY,
        request_id TEXT REFERENCES land_assessment_requests(id),
        assessed_value REAL,
        market_value REAL,
        land_value REAL,
        improvement_value REAL,
        property_type TEXT,
        lot_size REAL,
        year_built INTEGER,
        owner_name TEXT,
        apn TEXT,
        created_at INTEGER
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

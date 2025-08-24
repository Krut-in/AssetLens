import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for Google OAuth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  googleId: text("google_id").unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// User assets management table
export const userAssets = sqliteTable("user_assets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  assetType: text("asset_type").notNull(), // 'vehicle' or 'property'
  assetId: text("asset_id").notNull(), // references either valuation_requests or land_assessment_requests
  customName: text("custom_name"), // user-defined name for the asset
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const valuationRequests = sqliteTable("valuation_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  zipCode: text("zip_code").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const valuationResults = sqliteTable("valuation_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestId: text("request_id").references(() => valuationRequests.id),
  tradeInValue: real("trade_in_value"),
  privatePartyValue: real("private_party_value"),
  retailValue: real("retail_value"),
  loanAmount: real("loan_amount"),
  ltvRatio: real("ltv_ratio"),
  estimatedRate: real("estimated_rate"),
  monthlyPayment: real("monthly_payment"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const landAssessmentRequests = sqliteTable("land_assessment_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const landAssessmentResults = sqliteTable("land_assessment_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestId: text("request_id").references(() => landAssessmentRequests.id),
  assessedValue: real("assessed_value"),
  marketValue: real("market_value"),
  landValue: real("land_value"),
  improvementValue: real("improvement_value"),
  propertyType: text("property_type"),
  lotSize: real("lot_size"),
  yearBuilt: integer("year_built"),
  ownerName: text("owner_name"),
  apn: text("apn"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  image: true,
  googleId: true,
});

export const insertUserAssetSchema = createInsertSchema(userAssets).omit({
  id: true,
  createdAt: true,
});

export const insertValuationRequestSchema = createInsertSchema(valuationRequests).omit({
  id: true,
  createdAt: true,
});

export const insertValuationResultSchema = createInsertSchema(valuationResults).omit({
  id: true,
  createdAt: true,
});

export const insertLandAssessmentRequestSchema = createInsertSchema(landAssessmentRequests).omit({
  id: true,
  createdAt: true,
});

export const insertLandAssessmentResultSchema = createInsertSchema(landAssessmentResults).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserAsset = typeof userAssets.$inferSelect;
export type InsertUserAsset = z.infer<typeof insertUserAssetSchema>;
export type ValuationRequest = typeof valuationRequests.$inferSelect;
export type InsertValuationRequest = z.infer<typeof insertValuationRequestSchema>;
export type ValuationResult = typeof valuationResults.$inferSelect;
export type InsertValuationResult = z.infer<typeof insertValuationResultSchema>;
export type LandAssessmentRequest = typeof landAssessmentRequests.$inferSelect;
export type InsertLandAssessmentRequest = z.infer<typeof insertLandAssessmentRequestSchema>;
export type LandAssessmentResult = typeof landAssessmentResults.$inferSelect;
export type InsertLandAssessmentResult = z.infer<typeof insertLandAssessmentResultSchema>;

// Extended types for the API
export type ValuationResponse = {
  request: ValuationRequest;
  result: ValuationResult;
  vehicleInfo: {
    summary: string;
    mileage: string;
    location: string;
  };
  reportInfo: {
    date: string;
  };
};

export type LandAssessmentResponse = {
  request: LandAssessmentRequest;
  result: LandAssessmentResult;
  propertyInfo: {
    summary: string;
    address: string;
    location: string;
  };
  reportInfo: {
    date: string;
  };
};

// Combined asset types for dashboard
export type AssetSummary = {
  id: string;
  type: 'vehicle' | 'property';
  name: string;
  summary: string;
  value: string;
  createdAt: Date;
  details: ValuationResponse | LandAssessmentResponse;
};

export type UserDashboard = {
  user: User;
  assets: AssetSummary[];
  totalValue: string;
  vehicleCount: number;
  propertyCount: number;
};

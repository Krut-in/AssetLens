import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const valuationRequests = pgTable("valuation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  zipCode: text("zip_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const valuationResults = pgTable("valuation_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => valuationRequests.id),
  tradeInValue: decimal("trade_in_value", { precision: 10, scale: 2 }),
  privatePartyValue: decimal("private_party_value", { precision: 10, scale: 2 }),
  retailValue: decimal("retail_value", { precision: 10, scale: 2 }),
  loanAmount: decimal("loan_amount", { precision: 10, scale: 2 }),
  ltvRatio: decimal("ltv_ratio", { precision: 5, scale: 2 }),
  estimatedRate: decimal("estimated_rate", { precision: 5, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const landAssessmentRequests = pgTable("land_assessment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const landAssessmentResults = pgTable("land_assessment_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => landAssessmentRequests.id),
  assessedValue: decimal("assessed_value", { precision: 12, scale: 2 }),
  marketValue: decimal("market_value", { precision: 12, scale: 2 }),
  landValue: decimal("land_value", { precision: 12, scale: 2 }),
  improvementValue: decimal("improvement_value", { precision: 12, scale: 2 }),
  propertyType: text("property_type"),
  lotSize: decimal("lot_size", { precision: 10, scale: 2 }),
  yearBuilt: integer("year_built"),
  ownerName: text("owner_name"),
  apn: text("apn"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

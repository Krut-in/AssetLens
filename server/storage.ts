import { type User, type InsertUser, type ValuationRequest, type InsertValuationRequest, type ValuationResult, type InsertValuationResult, type ValuationResponse, type LandAssessmentRequest, type InsertLandAssessmentRequest, type LandAssessmentResult, type InsertLandAssessmentResult, type LandAssessmentResponse, type UserAsset, type InsertUserAsset, type AssetSummary, type UserDashboard } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "./database";
import * as schema from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  // Asset management
  createUserAsset(asset: InsertUserAsset): Promise<UserAsset>;
  getUserAssets(userId: string): Promise<AssetSummary[]>;
  deleteUserAsset(userId: string, assetId: string): Promise<boolean>;
  
  // Vehicle valuations
  createValuationRequest(request: InsertValuationRequest): Promise<ValuationRequest>;
  createValuationResult(result: InsertValuationResult): Promise<ValuationResult>;
  getValuationWithResult(requestId: string): Promise<ValuationResponse | undefined>;
  
  // Land assessments
  createLandAssessmentRequest(request: InsertLandAssessmentRequest): Promise<LandAssessmentRequest>;
  createLandAssessmentResult(result: InsertLandAssessmentResult): Promise<LandAssessmentResult>;
  getLandAssessmentWithResult(requestId: string): Promise<LandAssessmentResponse | undefined>;
  
  // Dashboard
  getUserDashboard(userId: string): Promise<UserDashboard>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(schema.users).values(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const now = new Date();
    
    await db.update(schema.users)
      .set({
        ...updates,
        updatedAt: now
      })
      .where(eq(schema.users.id, id));

    const updatedUser = await this.getUser(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async createUserAsset(asset: InsertUserAsset): Promise<UserAsset> {
    const id = randomUUID();
    const userAsset: UserAsset = {
      ...asset,
      id,
      createdAt: new Date()
    };
    
    await db.insert(schema.userAssets).values(userAsset);
    return userAsset;
  }

  async getUserAssets(userId: string): Promise<AssetSummary[]> {
    // This is a simplified implementation - in production, you'd want proper joins
    const assets = await db.select().from(schema.userAssets).where(eq(schema.userAssets.userId, userId));
    
    const assetSummaries: AssetSummary[] = [];
    
    for (const asset of assets) {
      if (asset.assetType === 'vehicle') {
        const valuation = await this.getValuationWithResult(asset.assetId);
        if (valuation) {
          assetSummaries.push({
            id: asset.id,
            type: 'vehicle',
            name: asset.customName || `${valuation.request.year} ${valuation.request.make} ${valuation.request.model}`,
            summary: `${valuation.request.year} ${valuation.request.make} ${valuation.request.model}`,
            value: `$${Number(valuation.result.privatePartyValue || 0).toLocaleString()}`,
            createdAt: asset.createdAt!,
            details: valuation
          });
        }
      } else if (asset.assetType === 'property') {
        const assessment = await this.getLandAssessmentWithResult(asset.assetId);
        if (assessment) {
          assetSummaries.push({
            id: asset.id,
            type: 'property',
            name: asset.customName || assessment.propertyInfo.summary,
            summary: assessment.propertyInfo.address,
            value: `$${Number(assessment.result.marketValue || 0).toLocaleString()}`,
            createdAt: asset.createdAt!,
            details: assessment
          });
        }
      }
    }
    
    return assetSummaries;
  }

  async deleteUserAsset(userId: string, assetId: string): Promise<boolean> {
    const result = await db.delete(schema.userAssets)
      .where(and(eq(schema.userAssets.userId, userId), eq(schema.userAssets.id, assetId)));
    return true;
  }

  async createValuationRequest(insertRequest: InsertValuationRequest): Promise<ValuationRequest> {
    const id = randomUUID();
    const request: ValuationRequest = {
      ...insertRequest,
      id,
      createdAt: new Date(),
    };
    
    await db.insert(schema.valuationRequests).values(request);
    return request;
  }

  async createValuationResult(insertResult: InsertValuationResult): Promise<ValuationResult> {
    const id = randomUUID();
    const result: ValuationResult = {
      id,
      requestId: insertResult.requestId || null,
      tradeInValue: insertResult.tradeInValue || null,
      privatePartyValue: insertResult.privatePartyValue || null,
      retailValue: insertResult.retailValue || null,
      loanAmount: insertResult.loanAmount || null,
      ltvRatio: insertResult.ltvRatio || null,
      estimatedRate: insertResult.estimatedRate || null,
      monthlyPayment: insertResult.monthlyPayment || null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.valuationResults).values(result);
    return result;
  }

  async getValuationWithResult(requestId: string): Promise<ValuationResponse | undefined> {
    const requestResult = await db.select().from(schema.valuationRequests)
      .where(eq(schema.valuationRequests.id, requestId)).limit(1);
    const request = requestResult[0];
    if (!request) return undefined;

    const resultResult = await db.select().from(schema.valuationResults)
      .where(eq(schema.valuationResults.requestId, requestId)).limit(1);
    const result = resultResult[0];
    if (!result) return undefined;

    const vehicleInfo = {
      summary: `${request.year} ${request.make} ${request.model}`,
      mileage: `${request.mileage.toLocaleString()} miles`,
      location: `ZIP ${request.zipCode}`,
    };

    const reportInfo = {
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    };

    return {
      request,
      result,
      vehicleInfo,
      reportInfo,
    };
  }

  async createLandAssessmentRequest(insertRequest: InsertLandAssessmentRequest): Promise<LandAssessmentRequest> {
    const id = randomUUID();
    const request: LandAssessmentRequest = {
      id,
      streetAddress: insertRequest.streetAddress,
      city: insertRequest.city,
      state: insertRequest.state,
      zipCode: insertRequest.zipCode || null,
      userId: insertRequest.userId || null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.landAssessmentRequests).values(request);
    return request;
  }

  async createLandAssessmentResult(insertResult: InsertLandAssessmentResult): Promise<LandAssessmentResult> {
    const id = randomUUID();
    const result: LandAssessmentResult = {
      id,
      requestId: insertResult.requestId || null,
      assessedValue: insertResult.assessedValue || null,
      marketValue: insertResult.marketValue || null,
      landValue: insertResult.landValue || null,
      improvementValue: insertResult.improvementValue || null,
      propertyType: insertResult.propertyType || null,
      lotSize: insertResult.lotSize || null,
      yearBuilt: insertResult.yearBuilt || null,
      ownerName: insertResult.ownerName || null,
      apn: insertResult.apn || null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.landAssessmentResults).values(result);
    return result;
  }

  async getLandAssessmentWithResult(requestId: string): Promise<LandAssessmentResponse | undefined> {
    const requestResult = await db.select().from(schema.landAssessmentRequests)
      .where(eq(schema.landAssessmentRequests.id, requestId)).limit(1);
    const request = requestResult[0];
    if (!request) return undefined;

    const resultResult = await db.select().from(schema.landAssessmentResults)
      .where(eq(schema.landAssessmentResults.requestId, requestId)).limit(1);
    const result = resultResult[0];
    if (!result) return undefined;

    const propertyInfo = {
      summary: `${request.streetAddress}`,
      address: `${request.streetAddress}, ${request.city}, ${request.state}${request.zipCode ? ' ' + request.zipCode : ''}`,
      location: `${request.city}, ${request.state}`,
    };

    const reportInfo = {
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    };

    return {
      request,
      result,
      propertyInfo,
      reportInfo,
    };
  }

  async getUserDashboard(userId: string): Promise<UserDashboard> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const assets = await this.getUserAssets(userId);
    
    const totalValue = assets.reduce((sum, asset) => {
      const value = parseInt(asset.value.replace(/[$,]/g, '')) || 0;
      return sum + value;
    }, 0);

    const vehicleCount = assets.filter(a => a.type === 'vehicle').length;
    const propertyCount = assets.filter(a => a.type === 'property').length;

    return {
      user,
      assets,
      totalValue: `$${totalValue.toLocaleString()}`,
      vehicleCount,
      propertyCount,
    };
  }
}

export const storage = new DatabaseStorage();

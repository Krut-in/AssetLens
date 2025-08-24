import { type User, type InsertUser, type ValuationRequest, type InsertValuationRequest, type ValuationResult, type InsertValuationResult, type ValuationResponse, type LandAssessmentRequest, type InsertLandAssessmentRequest, type LandAssessmentResult, type InsertLandAssessmentResult, type LandAssessmentResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createValuationRequest(request: InsertValuationRequest): Promise<ValuationRequest>;
  createValuationResult(result: InsertValuationResult): Promise<ValuationResult>;
  getValuationWithResult(requestId: string): Promise<ValuationResponse | undefined>;
  createLandAssessmentRequest(request: InsertLandAssessmentRequest): Promise<LandAssessmentRequest>;
  createLandAssessmentResult(result: InsertLandAssessmentResult): Promise<LandAssessmentResult>;
  getLandAssessmentWithResult(requestId: string): Promise<LandAssessmentResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private valuationRequests: Map<string, ValuationRequest>;
  private valuationResults: Map<string, ValuationResult>;
  private landAssessmentRequests: Map<string, LandAssessmentRequest>;
  private landAssessmentResults: Map<string, LandAssessmentResult>;

  constructor() {
    this.users = new Map();
    this.valuationRequests = new Map();
    this.valuationResults = new Map();
    this.landAssessmentRequests = new Map();
    this.landAssessmentResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createValuationRequest(insertRequest: InsertValuationRequest): Promise<ValuationRequest> {
    const id = randomUUID();
    const request: ValuationRequest = {
      ...insertRequest,
      id,
      createdAt: new Date(),
    };
    this.valuationRequests.set(id, request);
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
    this.valuationResults.set(id, result);
    return result;
  }

  async getValuationWithResult(requestId: string): Promise<ValuationResponse | undefined> {
    const request = this.valuationRequests.get(requestId);
    if (!request) return undefined;

    const result = Array.from(this.valuationResults.values()).find(
      (r) => r.requestId === requestId
    );
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
      createdAt: new Date(),
    };
    this.landAssessmentRequests.set(id, request);
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
    this.landAssessmentResults.set(id, result);
    return result;
  }

  async getLandAssessmentWithResult(requestId: string): Promise<LandAssessmentResponse | undefined> {
    const request = this.landAssessmentRequests.get(requestId);
    if (!request) return undefined;

    const result = Array.from(this.landAssessmentResults.values()).find(
      (r) => r.requestId === requestId
    );
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
}

export const storage = new MemStorage();

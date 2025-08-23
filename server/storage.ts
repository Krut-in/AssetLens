import { type User, type InsertUser, type ValuationRequest, type InsertValuationRequest, type ValuationResult, type InsertValuationResult, type ValuationResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createValuationRequest(request: InsertValuationRequest): Promise<ValuationRequest>;
  createValuationResult(result: InsertValuationResult): Promise<ValuationResult>;
  getValuationWithResult(requestId: string): Promise<ValuationResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private valuationRequests: Map<string, ValuationRequest>;
  private valuationResults: Map<string, ValuationResult>;

  constructor() {
    this.users = new Map();
    this.valuationRequests = new Map();
    this.valuationResults = new Map();
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
      ...insertResult,
      id,
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
}

export const storage = new MemStorage();

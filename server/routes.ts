import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertValuationRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Car valuation endpoint
  app.post("/api/valuation", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertValuationRequestSchema.parse(req.body);
      
      // Create valuation request
      const request = await storage.createValuationRequest(validatedData);
      
      // Get MarketCheck API credentials from environment
      const apiKey = process.env.MARKETCHECK_API_KEY;
      const apiSecret = process.env.MARKETCHECK_API_SECRET;
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "MarketCheck API key is not configured. Please contact support." 
        });
      }

      // Call MarketCheck API for vehicle valuation
      try {
        // Search for similar vehicles to get market pricing
        const marketCheckResponse = await fetch(
          `https://mc-api.marketcheck.com/v2/search/car/active?api_key=${apiKey}&make=${encodeURIComponent(validatedData.make)}&model=${encodeURIComponent(validatedData.model)}&year=${validatedData.year}&zip=${validatedData.zipCode}&miles_max=${validatedData.mileage + 10000}&radius=100&rows=50`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!marketCheckResponse.ok) {
          if (marketCheckResponse.status === 401) {
            return res.status(500).json({ 
              message: "Invalid MarketCheck API credentials. Please contact support." 
            });
          } else if (marketCheckResponse.status === 404) {
            return res.status(400).json({ 
              message: "Vehicle not found in our database. Please check your vehicle details and try again." 
            });
          } else {
            return res.status(500).json({ 
              message: "Unable to retrieve vehicle data at this time. Please try again later." 
            });
          }
        }

        const marketCheckData = await marketCheckResponse.json();
        
        // Process MarketCheck response to calculate valuations
        const listings = marketCheckData.listings || [];
        
        if (listings.length === 0) {
          return res.status(400).json({ 
            message: "Unable to find similar vehicles for valuation. Please verify your vehicle details are correct." 
          });
        }

        // Calculate market values based on similar vehicles
        const prices = listings.map((listing: any) => listing.price).filter((price: number) => price > 0);
        
        if (prices.length === 0) {
          return res.status(400).json({ 
            message: "Unable to determine vehicle value. Please verify your vehicle details are correct." 
          });
        }

        // Calculate different value types based on market data
        prices.sort((a: number, b: number) => a - b);
        const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
        
        // Trade-in value (typically 10-15% below average market price)
        const tradeInValue = Math.round(avgPrice * 0.85);
        
        // Private party value (close to average market price)
        const privatePartyValue = Math.round(avgPrice);
        
        // Retail value (typically 10-15% above average market price)
        const retailValue = Math.round(avgPrice * 1.15);

        // Calculate loan analysis
        const ltvRatio = 0.8; // 80% LTV ratio
        const baseValue = tradeInValue || privatePartyValue || retailValue;
        const loanAmount = baseValue * ltvRatio;
        const estimatedRate = 6.5; // 6.5% APR
        const termMonths = 60;
        
        // Calculate monthly payment
        const monthlyRate = estimatedRate / 100 / 12;
        const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                              (Math.pow(1 + monthlyRate, termMonths) - 1);

        // Create valuation result
        const result = await storage.createValuationResult({
          requestId: request.id,
          tradeInValue: tradeInValue.toString(),
          privatePartyValue: privatePartyValue.toString(),
          retailValue: retailValue.toString(),
          loanAmount: loanAmount.toString(),
          ltvRatio: (ltvRatio * 100).toString(),
          estimatedRate: estimatedRate.toString(),
          monthlyPayment: monthlyPayment.toString(),
        });

        // Get full valuation response
        const valuationResponse = await storage.getValuationWithResult(request.id);
        
        res.json(valuationResponse);
      } catch (apiError) {
        console.error('MarketCheck API Error:', apiError);
        return res.status(500).json({ 
          message: "Unable to connect to vehicle data service. Please try again later." 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid vehicle information provided. Please check all fields and try again.",
          errors: error.errors
        });
      }
      
      console.error('Valuation Error:', error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again later." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

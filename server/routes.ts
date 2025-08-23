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
      
      // Get Edmunds API key from environment
      const apiKey = process.env.EDMUNDS_API_KEY || process.env.NEXT_PUBLIC_EDMUNDS_API_KEY || process.env.VITE_EDMUNDS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "Edmunds API key is not configured. Please contact support." 
        });
      }

      // Call Edmunds API for vehicle valuation
      try {
        const edmundsResponse = await fetch(
          `https://api.edmunds.com/api/vehicle/v2/${validatedData.make.toLowerCase()}/${validatedData.model.toLowerCase()}/${validatedData.year}/calculatetmv?fmt=json&api_key=${apiKey}&zip=${validatedData.zipCode}&mileage=${validatedData.mileage}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!edmundsResponse.ok) {
          if (edmundsResponse.status === 401) {
            return res.status(500).json({ 
              message: "Invalid Edmunds API credentials. Please contact support." 
            });
          } else if (edmundsResponse.status === 404) {
            return res.status(400).json({ 
              message: "Vehicle not found in our database. Please check your vehicle details and try again." 
            });
          } else {
            return res.status(500).json({ 
              message: "Unable to retrieve vehicle data at this time. Please try again later." 
            });
          }
        }

        const edmundsData = await edmundsResponse.json();
        
        // Extract TMV values from Edmunds response
        const tradeInValue = edmundsData.tmv?.tmvRecommendedRating?.tradein?.value || 0;
        const privatePartyValue = edmundsData.tmv?.tmvRecommendedRating?.privateparty?.value || 0;
        const retailValue = edmundsData.tmv?.tmvRecommendedRating?.dealer?.value || 0;
        
        if (!tradeInValue && !privatePartyValue && !retailValue) {
          return res.status(400).json({ 
            message: "Unable to determine vehicle value. Please verify your vehicle details are correct." 
          });
        }

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
        console.error('Edmunds API Error:', apiError);
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

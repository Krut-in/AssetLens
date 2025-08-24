import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertValuationRequestSchema, insertLandAssessmentRequestSchema } from "@shared/schema";
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
        
        // For now, auto-create a user asset (in production, you'd have user authentication)
        // We'll use a default user ID for demo purposes
        const defaultUserId = "demo-user";
        
        // Create user if doesn't exist
        let user = await storage.getUserByEmail("demo@example.com");
        if (!user) {
          user = await storage.createUser({
            email: "demo@example.com",
            name: "Demo User",
            image: null,
            googleId: null
          });
        }
        
        // Create user asset entry
        await storage.createUserAsset({
          userId: user.id,
          assetType: "vehicle",
          assetId: request.id,
          customName: `${validatedData.year} ${validatedData.make} ${validatedData.model}`
        });
        
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

  // Land assessment endpoint
  app.post("/api/land-assessment", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertLandAssessmentRequestSchema.parse(req.body);
      
      // Create land assessment request
      const request = await storage.createLandAssessmentRequest(validatedData);
      
      // Get Regrid API token from environment
      const apiToken = process.env.REGRID_API_TOKEN;
      
      if (!apiToken) {
        return res.status(500).json({ 
          message: "Regrid API token is not configured. Please contact support." 
        });
      }

      // Call Regrid API for land assessment
      try {
        // Format address for Regrid API - handle Google Places formatted addresses
        console.log('Raw streetAddress from frontend:', validatedData.streetAddress);
        console.log('City:', validatedData.city, 'State:', validatedData.state, 'ZipCode:', validatedData.zipCode);
        
        let addressQuery;
        if (validatedData.streetAddress.includes(',')) {
          // Google Places formatted address - extract just the street address portion
          // Expected format: "701 Elm St, Dallas, TX 75202, USA"
          const addressParts = validatedData.streetAddress.split(',');
          const streetAddressOnly = addressParts[0].trim(); // Get just "701 Elm St"
          
          // Reconstruct using the parsed components for better accuracy
          addressQuery = `${streetAddressOnly}, ${validatedData.city}, ${validatedData.state}${validatedData.zipCode ? ' ' + validatedData.zipCode : ''}`;
          console.log('Reconstructed address for Regrid:', addressQuery);
        } else {
          // Manual entry - combine fields
          addressQuery = `${validatedData.streetAddress}, ${validatedData.city}, ${validatedData.state}${validatedData.zipCode ? ' ' + validatedData.zipCode : ''}`;
          console.log('Combined address for Regrid:', addressQuery);
        }

        const apiUrl = `https://app.regrid.com/api/v2/parcels/address?token=${apiToken}&query=${encodeURIComponent(addressQuery)}&limit=1`;
        
        console.log('Regrid API Request:', {
          addressQuery,
          url: apiUrl.replace(apiToken, '[REDACTED]')
        });
        
        const regridResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!regridResponse.ok) {
          const errorText = await regridResponse.text();
          console.error('Regrid API Error Response:', {
            status: regridResponse.status,
            statusText: regridResponse.statusText,
            body: errorText,
            addressQuery
          });
          
          if (regridResponse.status === 401) {
            return res.status(500).json({ 
              message: "Invalid Regrid API credentials. Please contact support." 
            });
          } else if (regridResponse.status === 404) {
            return res.status(400).json({ 
              message: "Property not found in our database. Please check your address and try again." 
            });
          } else {
            return res.status(500).json({ 
              message: "Unable to retrieve property data at this time. Please try again later." 
            });
          }
        }

        const regridData = await regridResponse.json();
        
        console.log('Regrid API Response:', {
          status: regridResponse.status,
          dataKeys: Object.keys(regridData),
          parcels: regridData.parcels ? regridData.parcels.features?.length : 0,
          error: regridData.error || null
        });
        
        // Process Regrid response to extract property data - correct structure access
        const features = regridData.parcels?.features || regridData.features || [];
        
        if (features.length === 0) {
          // Try alternative address format if first attempt fails
          console.log('First attempt failed, trying alternative address format...');
          
          let alternativeQuery;
          if (validatedData.streetAddress.includes(',')) {
            // Try with the full formatted address
            alternativeQuery = validatedData.streetAddress
              .replace(', USA', '')
              .replace(', United States', '')
              .trim();
          } else {
            // Try with just street address and state
            alternativeQuery = `${validatedData.streetAddress}, ${validatedData.state}`;
          }
          
          console.log('Trying alternative query:', alternativeQuery);
          
          const alternativeUrl = `https://app.regrid.com/api/v2/parcels/address?token=${apiToken}&query=${encodeURIComponent(alternativeQuery)}&limit=1`;
          const alternativeResponse = await fetch(alternativeUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (alternativeResponse.ok) {
            const alternativeData = await alternativeResponse.json();
            const alternativeFeatures = alternativeData.parcels?.features || alternativeData.features || [];
            
            if (alternativeFeatures.length > 0) {
              console.log('Alternative query succeeded');
              // Use the alternative result
              regridData.parcels = { features: alternativeFeatures };
            }
          }
          
          // Re-check features after alternative attempt
          const finalFeatures = regridData.parcels?.features || regridData.features || [];
          if (finalFeatures.length === 0) {
            return res.status(400).json({ 
              message: "Unable to find property for the provided address. Please verify your address details are correct." 
            });
          }
        }

        const property = features[0].properties;
        const fields = property.fields || {}; // Property values are in the 'fields' object
        
        // Extract property values from Regrid response - values are in 'fields' object
        const assessedValue = fields.parval || fields.assessval || fields.totval || 0;
        const landValue = fields.landval || 0;
        const improvementValue = fields.improvval || fields.impval || fields.bldgval || 0;
        
        console.log('Property fields found:', {
          parval: fields.parval,
          landval: fields.landval,
          improvval: fields.improvval,
          yearbuilt: fields.yearbuilt,
          owner: fields.owner
        });
        
        console.log('Calculated values:', {
          assessedValue,
          landValue,
          improvementValue,
          marketValue: assessedValue > 0 ? Math.round(assessedValue * 1.1) : landValue + improvementValue
        });
        const marketValue = assessedValue > 0 ? Math.round(assessedValue * 1.1) : landValue + improvementValue; // Estimate market value as 110% of assessed value
        const propertyType = fields.usedesc || fields.usecd || fields.zoning || property.zoning || 'Unknown';
        const lotSize = fields.ll_gisacre || fields.acres || (fields.sqft ? (fields.sqft / 43560) : null); // Convert sqft to acres if available
        const yearBuilt = fields.yearbuilt || fields.yrbuilt || fields.effyr || null;
        
        // Enhanced owner name extraction
        const ownerName = fields.owner || property.owner || fields.ownername || 
                         (property.enhanced_ownership && property.enhanced_ownership[0] ? property.enhanced_ownership[0].eo_owner : null) || 
                         null;
        
        const apn = fields.parcelnumb || fields.account_number || property.parcelnumb || features[0].id || null;

        if (!assessedValue && !landValue && !improvementValue) {
          return res.status(400).json({ 
            message: "Unable to determine property value. Please verify your property details are correct." 
          });
        }

        // Create land assessment result
        const result = await storage.createLandAssessmentResult({
          requestId: request.id,
          assessedValue: assessedValue.toString(),
          marketValue: marketValue.toString(),
          landValue: landValue.toString(),
          improvementValue: improvementValue.toString(),
          propertyType: propertyType,
          lotSize: lotSize ? lotSize.toString() : null,
          yearBuilt: yearBuilt,
          ownerName: ownerName,
          apn: apn,
        });

        // Get full land assessment response
        const assessmentResponse = await storage.getLandAssessmentWithResult(request.id);
        
        // Create user asset entry (using same demo user as vehicle)
        let user = await storage.getUserByEmail("demo@example.com");
        if (!user) {
          user = await storage.createUser({
            email: "demo@example.com",
            name: "Demo User",
            image: null,
            googleId: null
          });
        }
        
        // Create user asset entry
        await storage.createUserAsset({
          userId: user.id,
          assetType: "property",
          assetId: request.id,
          customName: `${validatedData.streetAddress}, ${validatedData.city}`
        });
        
        res.json(assessmentResponse);
      } catch (apiError) {
        console.error('Regrid API Error:', apiError);
        return res.status(500).json({ 
          message: "Unable to connect to property data service. Please try again later." 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid property information provided. Please check all fields and try again.",
          errors: error.errors
        });
      }
      
      console.error('Land Assessment Error:', error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again later." 
      });
    }
  });

  // Maps configuration endpoint
  app.get("/api/maps-config", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "Google Maps API key is not configured." 
        });
      }

      res.json({ apiKey });
    } catch (error) {
      console.error('Maps Config Error:', error);
      res.status(500).json({ 
        message: "Unable to retrieve maps configuration." 
      });
    }
  });

  // Dashboard endpoint to get user's asset portfolio
  app.get("/api/dashboard", async (req, res) => {
    try {
      // For demo, use the same user we've been creating
      const user = await storage.getUserByEmail("demo@example.com");
      if (!user) {
        // Return empty dashboard if no user exists yet
        return res.json({
          user: {
            id: "demo",
            email: "demo@example.com",
            name: "Demo User",
            image: null,
            googleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          assets: [],
          totalValue: "$0",
          vehicleCount: 0,
          propertyCount: 0
        });
      }

      const dashboard = await storage.getUserDashboard(user.id);
      res.json(dashboard);
    } catch (error) {
      console.error('Dashboard API Error:', error);
      res.status(500).json({ message: "Unable to load dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
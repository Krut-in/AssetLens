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
        // Format address for Regrid API - use only the street address if it's already formatted by Google Places
        let addressQuery;
        if (validatedData.streetAddress.includes(',')) {
          // Google Places formatted address - use as is
          addressQuery = validatedData.streetAddress;
        } else {
          // Manual entry - combine fields
          addressQuery = `${validatedData.streetAddress}, ${validatedData.city}, ${validatedData.state}${validatedData.zipCode ? ' ' + validatedData.zipCode : ''}`;
        }

        const searchPath = `/us/`
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
          features: regridData.features ? regridData.features.length : 0,
          parcels: regridData.parcels ? regridData.parcels.length : 0,
          error: regridData.error || null,
          fullResponse: JSON.stringify(regridData, null, 2)
        });
        
        // Process Regrid response to extract property data
        const parcels = regridData.parcels?.features || regridData.features || [];
        
        console.log('Regrid parcels found:', parcels.length);
        console.log('Full parcels data:', JSON.stringify(parcels, null, 2));
        
        if (parcels.length === 0) {
          // Try a simpler address format for Regrid
          const simpleAddress = validatedData.streetAddress.split(',')[0];
          const simpleQuery = `${simpleAddress}, ${validatedData.city}, ${validatedData.state}`;
          
          console.log('Trying simple address format:', simpleQuery);
          
          const simpleApiUrl = `https://app.regrid.com/api/v2/parcels/address?token=${apiToken}&query=${encodeURIComponent(simpleQuery)}&limit=1`;
          
          const simpleResponse = await fetch(simpleApiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (simpleResponse.ok) {
            const simpleData = await simpleResponse.json();
            const simpleParcels = simpleData.parcels?.features || simpleData.features || [];
            
            if (simpleParcels.length > 0) {
              const property = simpleParcels[0].properties || simpleParcels[0];
              return await processPropertyData(property, request, storage, res);
            }
          }
          
          return res.status(400).json({ 
            message: "Unable to find property for the provided address. This may be because the address is not available in our supported counties (Marion County IN, Dallas County TX, Wilson County TN, Durham County NC, Fillmore County NE, Clark County WI, or Gurabo Municipio PR). Please try a different address within these counties." 
          });
        }

        const property = parcels[0].properties || parcels[0];
        return await processPropertyData(property, request, storage, res);
        
        // This is handled by the processPropertyData function now
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

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to process property data
async function processPropertyData(property: any, request: any, storage: any, res: any) {
  try {
    console.log('Processing property data:', JSON.stringify(property, null, 2));
    
    // Extract property values from Regrid response
    const assessedValue = property.assessval || property.totval || 0;
    const landValue = property.landval || 0;
    const improvementValue = property.impval || property.bldgval || 0;
    const marketValue = assessedValue > 0 ? Math.round(assessedValue * 1.1) : landValue + improvementValue; // Estimate market value as 110% of assessed value
    const propertyType = property.usecd || property.zoning || property.landuse || 'Unknown';
    const lotSize = property.acres || property.sqft ? (property.sqft / 43560) : null; // Convert sqft to acres if available
    const yearBuilt = property.yrbuilt || property.effyr || null;
    const ownerName = property.owner || property.ownername || null;
    const apn = property.parcelnumb || property.ll_gisacre || null;

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
    
    res.json(assessmentResponse);
  } catch (error) {
    console.error('Property processing error:', error);
    return res.status(500).json({ 
      message: "Unable to process property data. Please try again later." 
    });
  }
}

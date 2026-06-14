import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTestimonialSchema, insertPortfolioItemSchema, insertConsultationSchema } from "../shared/schema.js";
import { z } from "zod";
import { setupAuth } from "./auth";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError, handleError } from './errors';
import sanitizeHtml from "sanitize-html";

// Admin middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    throw new AuthenticationError();
  }
  if (!req.user?.isAdmin) {
    throw new AuthorizationError();
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Testimonial routes
  app.get("/api/testimonials", async (_req, res) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });

  app.post("/api/testimonials", isAdmin, async (req, res) => {
    try {
      const testimonial = insertTestimonialSchema.parse(req.body);
      const newTestimonial = await storage.createTestimonial(testimonial);
      res.json(newTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid testimonial data');
      }
      throw error;
    }
  });

  app.delete("/api/testimonials/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ValidationError('Invalid ID');
    }
    const success = await storage.deleteTestimonial(id);
    if (!success) {
      throw new NotFoundError('Testimonial not found');
    }
    res.json({ message: "Testimonial deleted" });
  });

  // Portfolio routes
  app.get("/api/portfolio", async (_req, res) => {
    const items = await storage.getPortfolioItems();
    res.json(items);
  });

  app.post("/api/portfolio", isAdmin, async (req, res) => {
    try {
      const item = insertPortfolioItemSchema.parse(req.body);
      const newItem = await storage.createPortfolioItem(item);
      res.json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid portfolio item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.patch("/api/portfolio/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }
      
      // Validate that we have a featured field
      if (req.body.featured === undefined) {
        res.status(400).json({ message: "Featured field is required" });
        return;
      }

      // Ensure featured is a boolean
      const featured = Boolean(req.body.featured);
      
      console.log(`Updating portfolio item ${id} with featured = ${featured}`);
      const success = await storage.updatePortfolioItem(id, { featured });
      
      if (success) {
        console.log(`Successfully updated portfolio item ${id}`);
        res.json({ message: "Portfolio item updated successfully" });
      } else {
        console.log(`Failed to find portfolio item ${id}`);
        res.status(404).json({ message: "Portfolio item not found" });
      }
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      res.status(500).json({ 
        message: "Failed to update portfolio item",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.delete("/api/portfolio/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    const success = await storage.deletePortfolioItem(id);
    if (success) {
      res.json({ message: "Portfolio item deleted" });
    } else {
      res.status(404).json({ message: "Portfolio item not found" });
    }
  });

  // Consultation routes
  app.get("/api/consultations", isAdmin, async (_req, res) => {
    try {
      const consultations = await storage.getConsultations();
      res.json(consultations || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      res.status(500).json({ 
        message: "Error fetching consultations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      console.log('Received consultation data:', req.body);
      
      // Validate the request body
      if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
      }

      // Sanitize fields to prevent stored XSS
      const sanitizedBody = { ...req.body };
      const stringFields = ["name", "email", "phone", "requirements", "address", "budget", "preferredContactTime", "notes"];
      for (const field of stringFields) {
        if (typeof sanitizedBody[field] === "string") {
          sanitizedBody[field] = sanitizeHtml(sanitizedBody[field], {
            allowedTags: [],
            allowedAttributes: {},
          }).trim();
        }
      }

      // Parse and validate the data
      const consultation = insertConsultationSchema.parse(sanitizedBody);
      console.log('Parsed consultation data:', consultation);

      // Create the consultation
      const newConsultation = await storage.createConsultation(consultation);
      console.log('Created consultation:', newConsultation);

      res.json(newConsultation);
    } catch (error) {
      console.error('Consultation creation error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid consultation data", 
          errors: error.errors,
          details: error.format() 
        });
        return;
      }
      
      res.status(500).json({ 
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/consultations/:id/status", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    const { status } = req.body;

    if (!["pending", "confirmed", "completed"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const success = await storage.updateConsultationStatus(id, status);
    if (success) {
      res.json({ message: "Consultation status updated" });
    } else {
      res.status(404).json({ message: "Consultation not found" });
    }
  });

  app.patch("/api/consultations/:id/notes", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    const { notes } = req.body;

    if (!notes) {
      res.status(400).json({ message: "Notes are required" });
      return;
    }

    const success = await storage.updateConsultationNotes(id, notes);
    if (success) {
      res.json({ message: "Notes updated successfully" });
    } else {
      res.status(404).json({ message: "Consultation not found" });
    }
  });

  const SETTINGS_KEYS = [
    "hero_title", "hero_subtitle", "hero_image_url",
    "contact_phone", "contact_email", "contact_address",
    "contact_instagram", "contact_facebook", "contact_pinterest", "contact_whatsapp",
    "about_content", "about_image_url", "about_vision", "about_mission",
    "privacy_policy_content", "terms_of_service_content"
  ];

  app.get("/api/settings", async (_req, res) => {
    try {
      const result: Record<string, string> = {};
      await Promise.all(SETTINGS_KEYS.map(async (key) => {
        const val = await storage.getSetting(key);
        if (val !== undefined) {
          result[key] = val;
        }
      }));
      res.json(result);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", isAdmin, async (req, res) => {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        res.status(400).json({ message: "Invalid updates payload" });
        return;
      }
      
      const success = await Promise.all(Object.entries(updates).map(async ([key, val]) => {
        if (typeof val === 'string' && SETTINGS_KEYS.includes(key)) {
          return await storage.updateSetting(key, val);
        }
        return true;
      }));
      
      if (success.every(Boolean)) {
        res.json({ message: "Settings updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update some settings" });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Add proper error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    if (err instanceof AuthenticationError) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    if (err instanceof AuthorizationError) {
      res.status(403).json({ message: "Admin access required" });
      return;
    }
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
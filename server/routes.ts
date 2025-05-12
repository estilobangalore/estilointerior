import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTestimonialSchema, insertPortfolioItemSchema, insertConsultationSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError, handleError } from './errors';

// Admin middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
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
    const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
      
      // Validate that we have a featured field
      if (req.body.featured === undefined) {
        return res.status(400).json({ message: "Featured field is required" });
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
    const id = parseInt(req.params.id);
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
        return res.status(400).json({ message: "Request body is required" });
      }

      // Parse and validate the data
      const consultation = insertConsultationSchema.parse(req.body);
      console.log('Parsed consultation data:', consultation);

      // Create the consultation
      const newConsultation = await storage.createConsultation(consultation);
      console.log('Created consultation:', newConsultation);

      res.json(newConsultation);
    } catch (error) {
      console.error('Consultation creation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid consultation data", 
          errors: error.errors,
          details: error.format() 
        });
      }
      
      res.status(500).json({ 
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/consultations/:id/status", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!["pending", "confirmed", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const success = await storage.updateConsultationStatus(id, status);
    if (success) {
      res.json({ message: "Consultation status updated" });
    } else {
      res.status(404).json({ message: "Consultation not found" });
    }
  });

  app.patch("/api/consultations/:id/notes", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ message: "Notes are required" });
    }

    const success = await storage.updateConsultationNotes(id, notes);
    if (success) {
      res.json({ message: "Notes updated successfully" });
    } else {
      res.status(404).json({ message: "Consultation not found" });
    }
  });

  // Add proper error handling middleware
  app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error('Error:', err);
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (err instanceof AuthorizationError) {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
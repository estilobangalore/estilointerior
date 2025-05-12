import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Testimonial schemas
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

// Portfolio schemas
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    featured: z.boolean().default(false),
  });

// Add the consultation schema after the existing schemas
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: timestamp("date").notNull(),
  projectType: text("project_type").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  address: text("address"),
  budget: text("budget"),
  preferredContactTime: text("preferred_contact_time"),
  source: text("source").default("website"),
  notes: text("notes"),
});

// Add consultation schemas after existing schemas
export const insertConsultationSchema = createInsertSchema(consultations)
  .omit({
    id: true,
    status: true,
    createdAt: true,
  })
  .extend({
    date: z.string().transform((str) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date;
    }),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(100),
    phone: z.string().min(10, "Please enter a valid phone number").max(20),
    projectType: z.string().min(1, "Please select a project type"),
    requirements: z.string().min(10, "Please provide more details about your project").max(1000),
    address: z.string().min(5, "Please enter your address").max(200).optional(),
    budget: z.string().min(1, "Please select your budget range").optional(),
    preferredContactTime: z.string().min(1, "Please select your preferred contact time").optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
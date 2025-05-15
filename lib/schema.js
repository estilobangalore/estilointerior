import { pgTable, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';

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

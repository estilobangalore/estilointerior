import { 
  users, type User, type InsertUser,
  testimonials, type Testimonial, type InsertTestimonial,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem,
  consultations
} from "@shared/schema";
import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import { hashPassword } from './auth';

// Add Consultation types here (These need to be defined elsewhere and imported)
import { type Consultation, type InsertConsultation } from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Portfolio operations
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  deletePortfolioItem(id: number): Promise<boolean>;
  updatePortfolioItem(id: number, updates: Partial<PortfolioItem>): Promise<boolean>;

  // Consultation operations
  getConsultations(): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: number, status: string): Promise<boolean>;
  updateConsultationNotes(id: number, notes: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private testimonialMap: Map<number, Testimonial>;
  private portfolioMap: Map<number, PortfolioItem>;
  private consultationMap: Map<number, Consultation>;
  private currentId: number;
  private testimonialId: number;
  private portfolioId: number;
  private consultationId: number;

  constructor() {
    // Initialize maps
    this.userMap = new Map<number, User>();
    this.testimonialMap = new Map<number, Testimonial>();
    this.portfolioMap = new Map<number, PortfolioItem>();
    this.consultationMap = new Map<number, Consultation>();
    
    // Initialize counters
    this.currentId = 2; // Start from 2 since admin is 1
    this.testimonialId = 1;
    this.portfolioId = 1;
    this.consultationId = 1;
    
    // Create admin user with a simple password for testing
    // In production, this should be properly hashed
    const adminId = 1;
    this.userMap.set(adminId, {
      id: adminId,
      username: 'admin',
      password: 'admin123', // Simple password for testing
      isAdmin: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Convert Map values to array before iterating
    const users = Array.from(this.userMap.values());
    for (const user of users) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = this.currentId++;
      const user: User = {
        id,
        username: insertUser.username,
        password: insertUser.password,
        isAdmin: false // Only the first user (admin) is admin
      };
      this.userMap.set(id, user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonialMap.values());
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonialMap.get(id);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      createdAt: new Date(),
    };
    this.testimonialMap.set(id, newTestimonial);
    return newTestimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonialMap.delete(id);
  }

  // Portfolio methods
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioMap.values());
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioMap.get(id);
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.portfolioId++;
    const newItem: PortfolioItem = {
      ...item,
      id,
      featured: item.featured === undefined ? false : item.featured,
      createdAt: new Date(),
    };
    this.portfolioMap.set(id, newItem);
    return newItem;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    return this.portfolioMap.delete(id);
  }

  async updatePortfolioItem(id: number, updates: Partial<PortfolioItem>): Promise<boolean> {
    const item = this.portfolioMap.get(id);
    if (!item) return false;

    // Ensure featured is always a boolean
    const updatedItem = { 
      ...item, 
      ...updates,
      featured: updates.featured !== undefined ? updates.featured : (item.featured || false)
    };

    this.portfolioMap.set(id, updatedItem);
    return true;
  }

  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultationMap.values());
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    return this.consultationMap.get(id);
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const id = this.consultationId++;
    const newConsultation: Consultation = {
      ...consultation,
      id,
      status: "pending",
      createdAt: new Date(),
      address: consultation.address ?? null,
      budget: consultation.budget ?? null,
      preferredContactTime: consultation.preferredContactTime ?? null,
      source: consultation.source ?? null,
      notes: consultation.notes ?? null,
    };
    this.consultationMap.set(id, newConsultation);
    return newConsultation;
  }

  async updateConsultationStatus(id: number, status: string): Promise<boolean> {
    const consultation = this.consultationMap.get(id);
    if (!consultation) return false;

    this.consultationMap.set(id, { ...consultation, status });
    return true;
  }

  async updateConsultationNotes(id: number, notes: string): Promise<boolean> {
    const consultation = this.consultationMap.get(id);
    if (!consultation) return false;

    this.consultationMap.set(id, { ...consultation, notes });
    return true;
  }
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if this is the first user to make them admin
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const isAdmin = parseInt(userCount[0].count as string) === 0;
    
    const result = await db.insert(users).values({
      ...insertUser,
      isAdmin
    }).returning();
    
    return result[0];
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials);
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const result = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return result[0];
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await db.insert(testimonials).values(testimonial).returning();
    return result[0];
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }

  // Portfolio methods
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return db.select().from(portfolioItems);
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    const result = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    return result[0];
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const result = await db.insert(portfolioItems).values(item).returning();
    return result[0];
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    const result = await db.delete(portfolioItems).where(eq(portfolioItems.id, id)).returning();
    return result.length > 0;
  }

  async updatePortfolioItem(id: number, updates: Partial<PortfolioItem>): Promise<boolean> {
    try {
      const result = await db.update(portfolioItems)
        .set(updates)
        .where(eq(portfolioItems.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      return false;
    }
  }

  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    return db.select().from(consultations);
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    const result = await db.select().from(consultations).where(eq(consultations.id, id));
    return result[0];
  }

  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    try {
      console.log('Creating consultation with data:', data);
      const result = await db.insert(consultations)
        .values({
          ...data,
          status: "pending",
          createdAt: new Date(),
        })
        .returning();
      
      console.log('Created consultation in database:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw new Error('Failed to create consultation');
    }
  }

  async updateConsultationStatus(id: number, status: string): Promise<boolean> {
    const result = await db.update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();
    return result.length > 0;
  }

  async updateConsultationNotes(id: number, notes: string): Promise<boolean> {
    const result = await db.update(consultations)
      .set({ notes })
      .where(eq(consultations.id, id))
      .returning();
    return result.length > 0;
  }
}

// Export the appropriate storage instance based on environment
let storage: IStorage;

if (process.env.DATABASE_URL) {
  console.log('Using database storage');
  storage = new DbStorage();
} else {
  console.log('Using memory storage');
  storage = new MemStorage();
}

export { storage };
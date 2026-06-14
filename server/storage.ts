import { 
  users, type User, type InsertUser,
  testimonials, type Testimonial, type InsertTestimonial,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem,
  consultations,
  siteSettings, type SiteSetting,
  otps, type Otp
} from "@shared/schema";
import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import { hashPassword } from './crypto';

import { type Consultation, type InsertConsultation } from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<boolean>;

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

  // Site settings
  getSetting(key: string): Promise<string | undefined>;
  updateSetting(key: string, value: string): Promise<boolean>;

  // OTP operations
  createOtp(username: string, otp: string, expiresAt: Date): Promise<Otp>;
  getOtp(username: string, otp: string): Promise<Otp | undefined>;
  deleteOtp(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private testimonialMap: Map<number, Testimonial>;
  private portfolioMap: Map<number, PortfolioItem>;
  private consultationMap: Map<number, Consultation>;
  private settingsMap: Map<string, string>;
  private otpMap: Map<number, Otp>;
  
  private currentId: number;
  private testimonialId: number;
  private portfolioId: number;
  private consultationId: number;
  private otpId: number;

  constructor() {
    // Initialize maps
    this.userMap = new Map<number, User>();
    this.testimonialMap = new Map<number, Testimonial>();
    this.portfolioMap = new Map<number, PortfolioItem>();
    this.consultationMap = new Map<number, Consultation>();
    this.settingsMap = new Map<string, string>();
    this.otpMap = new Map<number, Otp>();
    
    // Initialize counters
    this.currentId = 3; // Start from 3 since admin is 1 and Ramesh_Estilo is 2
    this.testimonialId = 1;
    this.portfolioId = 1;
    this.consultationId = 1;
    this.otpId = 1;
    
    // Create admin user
    // Hashed value of 'admin123'
    const adminId = 1;
    this.userMap.set(adminId, {
      id: adminId,
      username: 'admin',
      password: '777878feeddc2f86236fdfe6b190f4a9af0dea225f2e372c91434511e313be12309aa0ccf9ff02980fdfbbe312317206a6813000bee5b23f47dd9222ce88cd54.2b118cf41970754b08e9a4f97fe54d4e',
      isAdmin: true
    });

    hashPassword("Admin@Estilo#443322").then(hash => {
      const rameshId = 2;
      this.userMap.set(rameshId, {
        id: rameshId,
        username: 'Ramesh_Estilo',
        password: hash,
        isAdmin: true
      });
    });

    // Seed mock settings
    this.settingsMap.set("hero_title", "Estilo Interior");
    this.settingsMap.set("hero_subtitle", "Luxury Interior Design in Bangalore");
    this.settingsMap.set("hero_image_url", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000");
    this.settingsMap.set("contact_phone", "+91 98806 52548");
    this.settingsMap.set("contact_email", "estilo.bangalore@gmail.com");
    this.settingsMap.set("contact_address", "Bangalore, India");
    this.settingsMap.set("contact_instagram", "https://instagram.com/estilobangalore");
    this.settingsMap.set("contact_facebook", "https://facebook.com");
    this.settingsMap.set("contact_pinterest", "https://pinterest.com");
    this.settingsMap.set("contact_whatsapp", "+919880652548");
    this.settingsMap.set("about_content", "Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.");
    this.settingsMap.set("about_image_url", "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000");
    this.settingsMap.set("about_vision", "To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.");
    this.settingsMap.set("about_mission", "To transform our clients' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.");
    this.settingsMap.set("privacy_policy_content", "Privacy Policy Content. We value your privacy and protect your personal information.");
    this.settingsMap.set("terms_of_service_content", "Terms of Service Content. By using our website, you agree to these terms.");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
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
        isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : false
      };
      this.userMap.set(id, user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUserPassword(id: number, password: string): Promise<boolean> {
    const user = this.userMap.get(id);
    if (!user) return false;
    user.password = password;
    this.userMap.set(id, user);
    return true;
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

  // Site settings
  async getSetting(key: string): Promise<string | undefined> {
    return this.settingsMap.get(key);
  }

  async updateSetting(key: string, value: string): Promise<boolean> {
    this.settingsMap.set(key, value);
    return true;
  }

  // OTP operations
  async createOtp(username: string, otp: string, expiresAt: Date): Promise<Otp> {
    const otpsToDelete = Array.from(this.otpMap.values()).filter(o => o.username === username);
    for (const o of otpsToDelete) {
      this.otpMap.delete(o.id);
    }

    const id = this.otpId++;
    const newOtp: Otp = { id, username, otp, expiresAt };
    this.otpMap.set(id, newOtp);
    return newOtp;
  }

  async getOtp(username: string, otp: string): Promise<Otp | undefined> {
    return Array.from(this.otpMap.values()).find(
      o => o.username === username && o.otp === otp
    );
  }

  async deleteOtp(id: number): Promise<boolean> {
    return this.otpMap.delete(id);
  }
}

export class DbStorage implements IStorage {
  constructor() {
    this.seedSettings().catch(err => {
      console.error('Failed to seed site settings in database:', err);
    });
  }

  async seedSettings() {
    try {
      const existing = await db.select().from(siteSettings).limit(1);
      if (existing.length === 0) {
        console.log('🌱 Database site_settings table is empty. Seeding defaults...');
        const defaults = [
          { key: 'hero_title', value: 'Estilo Interior' },
          { key: 'hero_subtitle', value: 'Luxury Interior Design in Bangalore' },
          { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000' },
          { key: 'contact_phone', value: '+91 98806 52548' },
          { key: 'contact_email', value: 'estilo.bangalore@gmail.com' },
          { key: 'contact_address', value: 'Bangalore, India' },
          { key: 'contact_instagram', value: 'https://instagram.com/estilobangalore' },
          { key: 'contact_facebook', value: 'https://facebook.com' },
          { key: 'contact_pinterest', value: 'https://pinterest.com' },
          { key: 'contact_whatsapp', value: '+919880652548' },
          { key: 'about_content', value: 'Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.' },
          { key: 'about_image_url', value: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000' },
          { key: 'about_vision', value: 'To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.' },
          { key: 'about_mission', value: 'To transform our clients\' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.' },
          { key: 'privacy_policy_content', value: 'Privacy Policy Content. We value your privacy and protect your personal information.' },
          { key: 'terms_of_service_content', value: 'Terms of Service Content. By using our website, you agree to these terms.' }
        ];
        
        for (const item of defaults) {
          await db.insert(siteSettings).values(item);
        }
        console.log('✅ Successfully seeded default site settings in database!');
      }
    } catch (e: any) {
      console.warn('⚠️ Could not seed site settings. This is normal if database tables do not exist yet.', e.message);
    }
  }

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
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const isAdmin = parseInt(userCount[0].count as string) === 0;
    
    const result = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : isAdmin
    }).returning();
    
    return result[0];
  }

  async updateUserPassword(id: number, password: string): Promise<boolean> {
    try {
      const result = await db.update(users)
        .set({ password })
        .where(eq(users.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error updating user password:', error);
      return false;
    }
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
      const result = await db.insert(consultations)
        .values({
          ...data,
          status: "pending",
          createdAt: new Date(),
        })
        .returning();
      
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

  // Site settings
  async getSetting(key: string): Promise<string | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result[0]?.value;
  }

  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const existing = await this.getSetting(key);
      if (existing !== undefined) {
        await db.update(siteSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({ key, value });
      }
      return true;
    } catch (error) {
      console.error(`Error updating site setting ${key}:`, error);
      return false;
    }
  }

  // OTP operations
  async createOtp(username: string, otp: string, expiresAt: Date): Promise<Otp> {
    await db.delete(otps).where(eq(otps.username, username));
    const result = await db.insert(otps).values({
      username,
      otp,
      expiresAt
    }).returning();
    return result[0];
  }

  async getOtp(username: string, otp: string): Promise<Otp | undefined> {
    const result = await db.select().from(otps).where(
      sql`${otps.username} = ${username} AND ${otps.otp} = ${otp}`
    );
    return result[0];
  }

  async deleteOtp(id: number): Promise<boolean> {
    const result = await db.delete(otps).where(eq(otps.id, id)).returning();
    return result.length > 0;
  }
}

let storage: IStorage;

if (process.env.DATABASE_URL) {
  console.log('Using database storage');
  storage = new DbStorage();
} else {
  console.log('Using memory storage');
  storage = new MemStorage();
}

export { storage };
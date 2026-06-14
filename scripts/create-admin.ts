import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { hashPassword } from '../server/crypto';
import { eq } from 'drizzle-orm';

async function main() {
  const username = process.env.ADMIN_USERNAME || "Ramesh_Estilo";
  const password = process.env.ADMIN_PASSWORD;
  
  if (!password) {
    console.error("❌ Error: ADMIN_PASSWORD environment variable is not set.");
    console.log("Please run this command with environment variables, e.g.:");
    console.log("  ADMIN_USERNAME=Ramesh_Estilo ADMIN_PASSWORD=your_password npm run script");
    process.exit(1);
  }
  
  console.log(`🔑 Registering admin user: ${username}...`);
  const hashedPassword = await hashPassword(password);
  
  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      console.log(`⚠️ User "${username}" already exists in the database. Updating password and permissions...`);
      await db.update(users)
        .set({ password: hashedPassword, isAdmin: true })
        .where(eq(users.username, username));
      console.log(`✅ Password updated successfully for existing user!`);
    } else {
      await db.insert(users).values({
        username,
        password: hashedPassword,
        isAdmin: true
      });
      console.log(`✅ Admin user "${username}" created successfully!`);
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

main();

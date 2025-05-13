// api/portfolio.js
import { db } from '../lib/db';
import { portfolioItems } from '../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const allPortfolioItems = await db.select().from(portfolioItems);
      res.status(200).json(allPortfolioItems);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const id = req.url.split('/').pop();
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid portfolio item ID' });
      }
      
      const result = await db
        .update(portfolioItems)
        .set(req.body)
        .where(eq(portfolioItems.id, parseInt(id)))
        .returning();
      
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      res.status(500).json({ error: 'Failed to update portfolio item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
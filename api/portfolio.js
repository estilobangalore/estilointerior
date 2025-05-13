// api/portfolio.js
import { db } from '../lib/db';
import { portfolioItems } from '../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
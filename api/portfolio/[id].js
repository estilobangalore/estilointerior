import { db } from '../../lib/db';
import { portfolioItems } from '../../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract the ID from the URL
  const id = req.url.split('/').pop();
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid portfolio item ID' });
  }

  // Handle different HTTP methods
  if (req.method === 'GET') {
    try {
      const item = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.id, parseInt(id)))
        .limit(1);
      
      if (item.length === 0) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      
      res.status(200).json(item[0]);
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio item' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const result = await db
        .update(portfolioItems)
        .set(req.body)
        .where(eq(portfolioItems.id, parseInt(id)))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      res.status(500).json({ error: 'Failed to update portfolio item' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await db
        .delete(portfolioItems)
        .where(eq(portfolioItems.id, parseInt(id)))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      res.status(500).json({ error: 'Failed to delete portfolio item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 
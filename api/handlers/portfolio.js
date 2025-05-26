// Portfolio handler
export default function makePortfolioHandler({ db, portfolioItems }) {
  return async function handlePortfolio(req, res) {
    try {
      if (req.method === 'GET') {
        // Get all portfolio items
        const items = await db.select().from(portfolioItems);
        return res.status(200).json(items);
      } else if (req.method === 'POST') {
        // Create a new portfolio item
        const { title, description, imageUrl, category, featured } = req.body;
        if (!title || !description || !imageUrl || !category) {
          return res.status(400).json({ error: 'Required fields missing' });
        }
        const result = await db.insert(portfolioItems).values({
          title,
          description,
          imageUrl,
          category,
          featured: featured || false
        }).returning();
        return res.status(201).json(result[0]);
      } else if (req.method === 'PUT') {
        // Update portfolio item
        const { id, title, description, imageUrl, category, featured } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Item ID is required' });
        }
        const result = await db.update(portfolioItems)
          .set({
            title,
            description,
            imageUrl,
            category,
            featured
          })
          .where(portfolioItems.id.eq(id))
          .returning();
        return res.status(200).json(result[0]);
      } else if (req.method === 'DELETE') {
        // Delete portfolio item
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Item ID is required' });
        }
        await db.delete(portfolioItems).where(portfolioItems.id.eq(id));
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Portfolio error:', error);
      return res.status(500).json({ 
        error: 'Operation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      });
    }
  }
} 
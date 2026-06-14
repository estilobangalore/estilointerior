// Portfolio handler
const checkAdminAuth = (req, res) => {
  if (req.isAuthenticated) {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return false;
    }
  }
  return true;
};

export default function makePortfolioHandler({ db, portfolioItems }) {
  return async function handlePortfolio(req, res) {
    try {
      if (req.method === 'GET') {
        const items = await db.select().from(portfolioItems);
        return res.status(200).json(items);
      }
      
      // Enforce admin check for mutations
      if (!checkAdminAuth(req, res)) return;

      if (req.method === 'POST') {
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
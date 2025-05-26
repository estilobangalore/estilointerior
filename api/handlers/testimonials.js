// Testimonials handler
export default function makeTestimonialsHandler({ db, testimonials }) {
  return async function handleTestimonials(req, res) {
    try {
      if (req.method === 'GET') {
        // Get all testimonials
        const items = await db.select().from(testimonials);
        return res.status(200).json(items);
      } else if (req.method === 'POST') {
        // Create a new testimonial
        const { name, role, content, imageUrl } = req.body;
        if (!name || !role || !content) {
          return res.status(400).json({ error: 'Required fields missing' });
        }
        const result = await db.insert(testimonials).values({
          name,
          role,
          content,
          imageUrl: imageUrl || '/placeholder.jpg'
        }).returning();
        return res.status(201).json(result[0]);
      } else if (req.method === 'PUT') {
        // Update testimonial
        const { id, name, role, content, imageUrl } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Testimonial ID is required' });
        }
        const result = await db.update(testimonials)
          .set({
            name,
            role,
            content,
            imageUrl
          })
          .where(testimonials.id.eq(id))
          .returning();
        return res.status(200).json(result[0]);
      } else if (req.method === 'DELETE') {
        // Delete testimonial
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Testimonial ID is required' });
        }
        await db.delete(testimonials).where(testimonials.id.eq(id));
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Testimonials error:', error);
      return res.status(500).json({ 
        error: 'Operation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      });
    }
  }
} 
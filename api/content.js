import { db } from '../lib/db';
import { portfolioItems, testimonials, consultations } from '../lib/schema';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the route from the URL path or query param
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.searchParams.get('action');

  // Route the request based on the action and method
  switch (route) {
    case 'portfolio':
      return await handlePortfolio(req, res);
    case 'testimonials':
      return await handleTestimonials(req, res);
    case 'contact':
      if (req.method === 'POST') {
        return await handleContact(req, res);
      }
      break;
    case 'consultations':
      if (req.method === 'POST') {
        return await handleConsultations(req, res);
      }
      break;
    default:
      return res.status(404).json({ error: 'API route not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Portfolio items handler
async function handlePortfolio(req, res) {
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
        .where(eq(portfolioItems.id, id))
        .returning();
      
      return res.status(200).json(result[0]);
    } else if (req.method === 'DELETE') {
      // Delete portfolio item
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }
      
      await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
      
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

// Testimonials handler
async function handleTestimonials(req, res) {
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
        .where(eq(testimonials.id, id))
        .returning();
      
      return res.status(200).json(result[0]);
    } else if (req.method === 'DELETE') {
      // Delete testimonial
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Testimonial ID is required' });
      }
      
      await db.delete(testimonials).where(eq(testimonials.id, id));
      
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

// Contact form handler
async function handleContact(req, res) {
  console.log('Contact form received data:', req.body);
  
  try {
    // Extract data from request body with fallbacks
    const { 
      name = '', 
      email = '', 
      message = '', 
      phone = 'Not provided',
      address = null 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      console.error('Missing required fields in contact form submission');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide name, email, and message' 
      });
    }

    // Log the data we're about to insert
    console.log('Preparing to insert contact form data:', {
      name,
      email,
      phone,
      message,
      address
    });
    
    // Save as a consultation with minimal data
    const result = await db.insert(consultations).values({
      name,
      email,
      phone,
      date: new Date(),
      projectType: 'Contact Form Message',
      requirements: message, // Make sure this matches what the schema expects
      status: 'pending',
      source: 'contact_form',
      address
    }).returning();

    console.log('Contact message saved successfully:', result);
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    console.error('Error details:', error.stack);
    
    // Send a more detailed error response
    res.status(500).json({ 
      error: 'Failed to send message', 
      message: 'A server error has occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Consultations handler
async function handleConsultations(req, res) {
  console.log('Consultation form received data:', req.body);
  
  try {
    // Extract data from request body
    const { 
      name, 
      email, 
      phone, 
      date,
      projectType,
      requirements,
      address = null,
      budget = null,
      preferredContactTime = null
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !requirements) {
      console.error('Missing required fields in consultation form submission');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required information' 
      });
    }

    // Save the consultation
    const result = await db.insert(consultations).values({
      name,
      email,
      phone,
      date: new Date(date),
      projectType,
      requirements,
      status: 'pending',
      source: 'website',
      address,
      budget,
      preferredContactTime
    }).returning();

    console.log('Consultation saved successfully:', result);
    res.status(201).json({ success: true, consultation: result[0] });
  } catch (error) {
    console.error('Error submitting consultation:', error);
    console.error('Error details:', error.stack);
    
    res.status(500).json({ error: 'Failed to submit consultation request' });
  }
} 
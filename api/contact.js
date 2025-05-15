import { db } from '../lib/db';
import { consultations } from '../lib/schema';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

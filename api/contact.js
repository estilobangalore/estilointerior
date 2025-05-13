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
    const { name, email, message, phone } = req.body;

    try {
      // Save as a consultation with minimal data
      const result = await db.insert(consultations).values({
        name,
        email,
        phone: phone || 'Not provided',
        date: new Date(),
        projectType: 'Contact Form Message',
        requirements: message,
        status: 'pending',
        source: 'contact_form'
      }).returning();

      console.log('Contact message saved:', result);
      res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

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
    const { name, email, phone, date, projectType, requirements, address, budget, preferredContactTime } = req.body;

    try {
      const result = await db.insert(consultations).values({
        name,
        email,
        phone,
        date: new Date(date),
        projectType,
        requirements,
        address: address || null,
        budget: budget || null,
        preferredContactTime: preferredContactTime || null,
        status: 'pending'
      }).returning();

      console.log('Consultation created:', result);
      res.status(201).json({ success: true, consultation: result[0] });
    } catch (error) {
      console.error('Error submitting consultation:', error);
      res.status(500).json({ error: 'Failed to submit consultation request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

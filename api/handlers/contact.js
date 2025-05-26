// Contact form handler
export default function makeContactHandler({ db, consultations }) {
  return async function handleContact(req, res) {
    console.log('Contact form received data:', JSON.stringify(req.body, null, 2));
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
          message: 'Please provide name, email, and message',
          missing: [
            !name ? 'name' : null,
            !email ? 'email' : null,
            !message ? 'message' : null
          ].filter(Boolean)
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
      try {
        // Check database connection before attempting insert
        if (!db) {
          throw new Error('Database connection not available');
        }
        // Check if consultations table is accessible
        console.log('Attempting to access consultations table...');
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
        return res.status(201).json({ success: true, message: 'Message sent successfully' });
      } catch (dbError) {
        console.error('Database error when saving contact form:', dbError);
        console.error('Database error details:', dbError.stack);
        // Check for specific database error types
        let errorMessage = 'There was an error saving your message to our database';
        let errorDetails = dbError.message;
        // Check for connection issues
        if (dbError.message?.includes('connect')) {
          errorMessage = 'Unable to connect to the database. Please try again later.';
        } 
        // Check for schema/column issues
        else if (dbError.message?.includes('column') || dbError.message?.includes('schema')) {
          errorMessage = 'There was a data format issue. Our team has been notified.';
        }
        return res.status(500).json({ 
          error: 'Database error', 
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      console.error('Error details:', error.stack);
      // Send a more detailed error response
      return res.status(500).json({ 
        error: 'Failed to send message', 
        message: 'A server error has occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
} 
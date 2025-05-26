// Consultations handler
export default function makeConsultationsHandler({ db, consultations }) {
  return async function handleConsultations(req, res) {
    console.log('Consultation form received data:', JSON.stringify(req.body, null, 2));
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
          message: 'Please provide all required information',
          missing: [
            !name ? 'name' : null,
            !email ? 'email' : null,
            !phone ? 'phone' : null,
            !requirements ? 'requirements' : null
          ].filter(Boolean)
        });
      }
      // Validate date format
      let formattedDate;
      try {
        formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
          console.error('Invalid date format provided:', date);
          return res.status(400).json({
            error: 'Invalid date format',
            message: 'Please provide a valid date',
            providedDate: date
          });
        }
      } catch (dateError) {
        console.error('Error parsing date:', dateError);
        return res.status(400).json({
          error: 'Invalid date',
          message: 'Please provide a valid date format',
          providedDate: date
        });
      }
      try {
        // Check database connection before attempting insert
        if (!db) {
          throw new Error('Database connection not available');
        }
        console.log('Attempting to save consultation with date:', formattedDate.toISOString());
        // Save the consultation
        const result = await db.insert(consultations).values({
          name,
          email,
          phone,
          date: formattedDate,
          projectType,
          requirements,
          status: 'pending',
          source: 'website',
          address,
          budget,
          preferredContactTime
        }).returning();
        console.log('Consultation saved successfully:', result);
        return res.status(201).json({ success: true, consultation: result[0] });
      } catch (dbError) {
        console.error('Database error when saving consultation:', dbError);
        console.error('Database error details:', dbError.stack);
        // Check for specific database error types
        let errorMessage = 'There was an error saving your consultation to our database';
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
      console.error('Error submitting consultation:', error);
      console.error('Error details:', error.stack);
      return res.status(500).json({ 
        error: 'Failed to submit consultation request',
        message: 'A server error has occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
} 
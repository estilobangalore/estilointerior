export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { db } = await import('../lib/db');
    
    // Create a test user if none exists
    try {
      await db.execute(`
        INSERT INTO users (username, password, is_admin)
        VALUES ('admin', 'admin123', true)
        ON CONFLICT (username) DO NOTHING
      `);
    } catch (e) {
      console.error('Error creating test user:', e);
    }
    
    // Get all users with detailed column info
    const users = await db.execute('SELECT * FROM users');
    
    // Get column details
    let columnDetails = [];
    if (users && users.length > 0) {
      columnDetails = Object.keys(users[0]).map(key => ({
        name: key,
        type: typeof users[0][key],
        value: users[0][key]
      }));
    }
    
    res.status(200).json({
      success: true,
      users: users || [],
      userCount: users ? users.length : 0,
      columnDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug DB error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 
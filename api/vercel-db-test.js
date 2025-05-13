import { db } from '../lib/db';
import postgres from 'postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // For preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const results = {
    databaseUrl: process.env.DATABASE_URL ? 'Database URL is set' : 'Database URL is not set',
    environmentInfo: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    },
    connectionTest: { success: false, message: 'Not tested yet' },
    queryTest: { success: false, message: 'Not tested yet' },
    schemaInfo: { success: false, tables: [] }
  };
  
  try {
    // Test 1: Basic connection test
    try {
      // Simple connection test with a custom client to avoid interfering with the app's connection
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      
      const sql = postgres(connectionString, { 
        ssl: { rejectUnauthorized: false },
        max: 1,
        idle_timeout: 10,
        connect_timeout: 10
      });
      
      // Test connection by running a simple query
      await sql`SELECT 1 as connection_test`;
      
      results.connectionTest = { 
        success: true, 
        message: 'Successfully connected to the database' 
      };
      
      // Close this test connection
      await sql.end();
    } catch (connError) {
      results.connectionTest = { 
        success: false, 
        message: `Connection test failed: ${connError.message}`,
        error: connError.toString()
      };
    }
    
    // Test 2: Query test using the app's db instance
    try {
      const result = await db.execute('SELECT current_timestamp as server_time');
      results.queryTest = { 
        success: true, 
        message: 'Successfully executed query',
        data: result
      };
    } catch (queryError) {
      results.queryTest = { 
        success: false, 
        message: `Query execution failed: ${queryError.message}`,
        error: queryError.toString()
      };
    }
    
    // Test 3: Schema information
    try {
      const tables = await db.execute(`
        SELECT 
          table_name, 
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM 
          information_schema.tables t
        WHERE 
          table_schema = 'public'
        ORDER BY 
          table_name
      `);
      
      results.schemaInfo = { 
        success: true, 
        tables
      };
    } catch (schemaError) {
      results.schemaInfo = { 
        success: false, 
        message: `Schema query failed: ${schemaError.message}`,
        error: schemaError.toString()
      };
    }
    
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 'completed',
      results
    });
    
  } catch (error) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      results
    });
  }
}

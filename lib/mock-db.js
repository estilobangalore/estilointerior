/**
 * Mock database implementation for development
 * This will simulate database interactions without requiring an actual Postgres connection
 */

// In-memory data store
const store = {
  users: [],
  testimonials: [],
  portfolio_items: [],
  consultations: []
};

// Table name getter
const getTableName = (table) => {
  return typeof table === 'string' ? table : (table.name || 'unknown');
};

// Mock database implementation
export const db = {
  select: () => ({
    from: (table) => ({
      where: () => Promise.resolve([]),
      orderBy: () => Promise.resolve([]),
      limit: () => Promise.resolve([]),
      execute: () => Promise.resolve([]),
    }),
    execute: () => Promise.resolve([{ test: 1 }])
  }),
  insert: (table) => ({
    values: (data) => ({
      returning: () => {
        // Generate an ID for the new item
        const id = Math.floor(Math.random() * 10000);
        const tableName = getTableName(table);
        const newItem = { id, ...data, created_at: new Date() };
        
        // Log the operation
        console.log(`[MOCK DB] INSERT INTO ${tableName}:`, newItem);
        
        return Promise.resolve([newItem]);
      }
    })
  }),
  update: (table) => ({
    set: (data) => ({
      where: () => ({
        returning: () => {
          const tableName = getTableName(table);
          console.log(`[MOCK DB] UPDATE ${tableName}:`, data);
          return Promise.resolve([{ id: 1, ...data }]);
        }
      })
    })
  }),
  delete: (table) => ({
    where: () => {
      const tableName = getTableName(table);
      console.log(`[MOCK DB] DELETE FROM ${tableName}`);
      return Promise.resolve({ success: true });
    }
  }),
  execute: (query) => {
    console.log(`[MOCK DB] EXECUTE:`, query);
    return Promise.resolve([{ test: 1 }]);
  }
};

// Export test function
export async function testConnection() {
  console.log('Mock database connection test successful');
  return { success: true, result: [{ test: 1 }] };
} 
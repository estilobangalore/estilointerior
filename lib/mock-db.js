/**
 * Mock database implementation for development
 * This will simulate database interactions without requiring an actual Postgres connection
 */

// Helper functions for casing conversion
const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
const toSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// In-memory data store with seeded mock data
const store = {
  users: [
    {
      id: 1,
      username: 'admin',
      // Hashed value of 'admin123'
      password: '777878feeddc2f86236fdfe6b190f4a9af0dea225f2e372c91434511e313be12309aa0ccf9ff02980fdfbbe312317206a6813000bee5b23f47dd9222ce88cd54.2b118cf41970754b08e9a4f97fe54d4e',
      isAdmin: true
    }
  ],
  testimonials: [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'Estilo Interior transformed our living space into a luxurious, functional home. Their attention to detail and professional approach made the entire process seamless.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      createdAt: new Date()
    },
    {
      id: 2,
      name: 'Rajesh Patel',
      role: 'Villa Owner',
      content: 'Superb craftsmanship and design sensibilities! They perfectly captured the modern aesthetic we wanted for our new villa in Bangalore. Highly recommended.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      createdAt: new Date()
    }
  ],
  portfolio_items: [
    {
      id: 1,
      title: 'Modern Minimalist Living Room',
      description: 'A clean, clutter-free living room design focusing on neutral tones, clean lines, and natural lighting.',
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600',
      category: 'Living Room',
      featured: true,
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'Contemporary Luxury Kitchen',
      description: 'An open-concept kitchen featuring premium quartz countertops, state-of-the-art appliances, and custom cabinetry.',
      imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=600',
      category: 'Kitchen',
      featured: true,
      createdAt: new Date()
    },
    {
      id: 3,
      title: 'Serene Bedroom Retreat',
      description: 'A tranquil master bedroom sanctuary with custom wood paneling, ambient lighting, and plush textiles.',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600',
      category: 'Bedroom',
      featured: true,
      createdAt: new Date()
    }
  ],
  consultations: [],
  site_settings: [
    { key: 'hero_title', value: 'Estilo Interior' },
    { key: 'hero_subtitle', value: 'Luxury Interior Design in Bangalore' },
    { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000' },
    { key: 'contact_phone', value: '+91 98806 52548' },
    { key: 'contact_email', value: 'estilo.bangalore@gmail.com' },
    { key: 'contact_address', value: 'Bangalore, India' },
    { key: 'contact_instagram', value: 'https://instagram.com/estilobangalore' },
    { key: 'contact_facebook', value: 'https://facebook.com' },
    { key: 'contact_pinterest', value: 'https://pinterest.com' },
    { key: 'contact_whatsapp', value: '+919880652548' },
    { key: 'about_content', value: 'Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.' },
    { key: 'about_image_url', value: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000' },
    { key: 'about_vision', value: 'To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.' },
    { key: 'about_mission', value: 'To transform our clients\' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.' },
    { key: 'privacy_policy_content', value: 'Privacy Policy Content. We value your privacy and protect your personal information.' },
    { key: 'terms_of_service_content', value: 'Terms of Service Content. By using our website, you agree to these terms.' }
  ],
  otps: []
};

// Table name getter
const getTableName = (table) => {
  if (typeof table === 'string') return table;
  
  // Try standard Drizzle name symbols
  const nameSymbol = Symbol.for('drizzle:Name');
  if (table[nameSymbol]) return table[nameSymbol];
  
  const originalNameSymbol = Symbol.for('drizzle:OriginalName');
  if (table[originalNameSymbol]) return table[originalNameSymbol];
  
  // Try searching symbol keys
  const symbols = Object.getOwnPropertySymbols(table);
  for (const sym of symbols) {
    if (sym.toString().includes('drizzle:Name') || sym.toString().includes('drizzle:OriginalName')) {
      if (table[sym]) return table[sym];
    }
  }
  
  // Try underscore metadata
  if (table._ && table._.name) return table._.name;
  
  // Fallback to table.name or unknown
  return table.name || 'unknown';
};

// Mock database implementation
export const db = {
  select: () => ({
    from: (table) => {
      const tableName = getTableName(table);
      const data = store[tableName] || [];
      
      const p = Promise.resolve(data);
      p.where = (cond) => {
        let filtered = data;
        if (cond && cond.queryChunks) {
          const chunks = cond.queryChunks;
          
          // Simple eq(...) condition (length 5)
          if (chunks.length === 5 && chunks[2].value && chunks[2].value[0] === ' = ') {
            const columnName = chunks[1].name;
            const val = chunks[3].value;
            filtered = data.filter(item => {
              const itemVal = item[columnName] !== undefined ? item[columnName] : item[toCamelCase(columnName)];
              return String(itemVal) === String(val);
            });
          }
          // AND condition (length 9)
          else if (chunks.length === 9 && chunks[4].value && chunks[4].value[0] === ' AND ') {
            const col1 = chunks[1].name;
            const val1 = chunks[3];
            const col2 = chunks[5].name;
            const val2 = chunks[7];
            filtered = data.filter(item => {
              const itemVal1 = item[col1] !== undefined ? item[col1] : item[toCamelCase(col1)];
              const itemVal2 = item[col2] !== undefined ? item[col2] : item[toCamelCase(col2)];
              return String(itemVal1) === String(val1) && String(itemVal2) === String(val2);
            });
          }
        }
        const resolvedPromise = Promise.resolve(filtered);
        resolvedPromise.where = (c) => p.where(c);
        resolvedPromise.orderBy = () => resolvedPromise;
        resolvedPromise.limit = () => resolvedPromise;
        resolvedPromise.execute = () => resolvedPromise;
        return resolvedPromise;
      };
      p.orderBy = () => p;
      p.limit = () => p;
      p.execute = () => p;
      return p;
    },
    execute: () => Promise.resolve([{ test: 1 }])
  }),
  insert: (table) => ({
    values: (data) => ({
      returning: () => {
        const id = Math.floor(Math.random() * 10000);
        const tableName = getTableName(table);
        const newItem = { id, ...data, created_at: new Date() };
        if (!store[tableName]) {
          store[tableName] = [];
        }
        store[tableName].push(newItem);
        console.log(`[MOCK DB] INSERT INTO ${tableName}:`, newItem);
        return Promise.resolve([newItem]);
      }
    })
  }),
  update: (table) => ({
    set: (updates) => ({
      where: (cond) => ({
        returning: () => {
          const tableName = getTableName(table);
          console.log(`[MOCK DB] UPDATE ${tableName}:`, updates);
          
          let filtered = store[tableName] || [];
          if (cond && cond.queryChunks) {
            const chunks = cond.queryChunks;
            if (chunks.length === 5 && chunks[2].value && chunks[2].value[0] === ' = ') {
              const columnName = chunks[1].name;
              const val = chunks[3].value;
              filtered = filtered.filter(item => {
                const itemVal = item[columnName] !== undefined ? item[columnName] : item[toCamelCase(columnName)];
                return String(itemVal) === String(val);
              });
            }
          }
          
          filtered.forEach(item => {
            Object.assign(item, updates, { updatedAt: new Date() });
          });
          
          return Promise.resolve(filtered.length > 0 ? filtered : [updates]);
        }
      })
    })
  }),
  delete: (table) => ({
    where: (cond) => {
      const tableName = getTableName(table);
      console.log(`[MOCK DB] DELETE FROM ${tableName}`);
      
      let filtered = store[tableName] || [];
      if (cond && cond.queryChunks) {
        const chunks = cond.queryChunks;
        if (chunks.length === 5 && chunks[2].value && chunks[2].value[0] === ' = ') {
          const columnName = chunks[1].name;
          const val = chunks[3].value;
          store[tableName] = filtered.filter(item => {
            const itemVal = item[columnName] !== undefined ? item[columnName] : item[toCamelCase(columnName)];
            return String(itemVal) !== String(val);
          });
        }
      }
      return Promise.resolve(filtered);
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
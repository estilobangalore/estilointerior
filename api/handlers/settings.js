import { sql } from 'drizzle-orm';
import { siteSettings } from '../../shared/schema.js';

export default function makeSettingsHandler({ db }) {
  return async function handleSettings(req, res) {
    try {
      if (req.method === 'GET') {
        const settings = await db.select().from(siteSettings);
        const result = {};
        settings.forEach(item => {
          result[item.key] = item.value;
        });
        return res.status(200).json(result);
      } else if (req.method === 'POST') {
        const updates = req.body;
        if (!updates || typeof updates !== 'object') {
          return res.status(400).json({ error: 'Invalid updates' });
        }

        for (const [key, value] of Object.entries(updates)) {
          if (typeof value !== 'string') continue;
          
          const existing = await db.select().from(siteSettings).where(sql`key = ${key}`).limit(1);
          if (existing.length > 0) {
            await db.update(siteSettings)
              .set({ value, updatedAt: new Date() })
              .where(sql`key = ${key}`);
          } else {
            await db.insert(siteSettings).values({ key, value });
          }
        }
        return res.status(200).json({ success: true, message: 'Settings updated successfully' });
      }
    } catch (error) {
      console.error('Settings handler error:', error);
      return res.status(500).json({ error: 'Operation failed', message: error.message });
    }
  };
}

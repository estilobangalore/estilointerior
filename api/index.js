// Import database and schema
import { db as mockDb } from '../server/mock-db.js';
import { db as realDb } from '../server/db.js';
import { portfolioItems, testimonials, consultations, users } from '../shared/schema.js';
// Import handler factories
import makeContactHandler from './handlers/contact.js';
import makeConsultationsHandler from './handlers/consultations.js';
import makePortfolioHandler from './handlers/portfolio.js';
import makeTestimonialsHandler from './handlers/testimonials.js';
import makeAuthHandlers from './handlers/auth.js';

// Choose the appropriate database based on environment
const isProduction = process.env.NODE_ENV === 'production';
const db = isProduction ? realDb : mockDb;
console.log(`Using ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} database`);

// Instantiate handlers
const contactHandler = makeContactHandler({ db, consultations });
const consultationsHandler = makeConsultationsHandler({ db, consultations });
const portfolioHandler = makePortfolioHandler({ db, portfolioItems });
const testimonialsHandler = makeTestimonialsHandler({ db, testimonials });
const authHandlers = makeAuthHandlers({ db, users });

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse route
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathParts = url.pathname.split('/').filter(Boolean);
  // Normalize trailing slash: treat /api/login and /api/login/ the same
  if (pathParts.length > 0 && pathParts[pathParts.length - 1] === '') {
    pathParts = pathParts.slice(0, -1);
  }
  const startIndex = pathParts[0] === 'api' ? 1 : 0;
  const mainRoute = pathParts[startIndex] || '';
  const subRoute = pathParts[startIndex + 1] || '';

  // Debug logging for every request
  console.log('[API DEBUG]', {
    url: req.url,
    method: req.method,
    pathParts,
    mainRoute,
    subRoute,
    body: req.body
  });

  try {
    // Auth routes
    if (mainRoute === 'auth') {
      if (subRoute === 'login' && req.method === 'POST') return await authHandlers.handleLogin(req, res);
      if (subRoute === 'logout' && req.method === 'POST') return await authHandlers.handleLogout(req, res);
      if (subRoute === 'register' && req.method === 'POST') return await authHandlers.handleRegister(req, res);
      if (subRoute === 'user' && req.method === 'GET') return await authHandlers.handleGetUser(req, res);
      return res.status(404).json({ error: 'Auth endpoint not found' });
    }

    // Main resource routes
    switch (mainRoute) {
      case 'contact':
        if (req.method === 'POST') return await contactHandler(req, res);
        break;
      case 'consultations':
        if (req.method === 'POST') return await consultationsHandler(req, res);
        break;
      case 'portfolio':
        return await portfolioHandler(req, res);
      case 'testimonials':
        return await testimonialsHandler(req, res);
      case 'login':
        if (req.method === 'POST') return await authHandlers.handleLogin(req, res);
        break;
      default:
        return res.status(404).json({ error: 'API route not found', path: mainRoute });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
  return res.status(405).json({ error: 'Method not allowed', method: req.method, route: mainRoute });
}

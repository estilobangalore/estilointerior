# Beautiful Interiors Website Deployment

This directory contains guides and configuration files for deploying the Beautiful Interiors website to various hosting platforms.

## Deployment Options

Choose one of the following deployment options based on your needs:

### 1. Render.com (Recommended for Beginners)

Render offers an easy way to deploy Node.js applications with PostgreSQL databases. It has a free tier that's suitable for small projects.

- **Guide**: [render-deploy.md](./render-deploy.md)
- **Configuration**: [render.yaml](./render.yaml)

### 2. Railway.app (Great for Development Teams)

Railway is a modern platform that makes it easy to deploy web applications with databases. It offers a generous free tier and seamless GitHub integration.

- **Guide**: [railway-deploy.md](./railway-deploy.md)

### 3. Traditional VPS (More Control)

For more control over your server environment, you can deploy to a VPS like DigitalOcean, Linode, or AWS EC2.

- **Guide**: [deploy-guide.md](./deploy-guide.md)

## Database Issues

If you're experiencing PostgreSQL connection issues, check out our troubleshooting guide:

- **Guide**: [fix-postgres-issues.md](./fix-postgres-issues.md)

## Deployment Checklist

Before deploying to production, make sure you've completed these steps:

- [ ] Set up a PostgreSQL database
- [ ] Configure environment variables (DATABASE_URL, NODE_ENV, PORT)
- [ ] Build the application (`npm run build`)
- [ ] Run database migrations (`npm run db:push`)
- [ ] Test the application locally
- [ ] Deploy to your chosen platform
- [ ] Set up a custom domain (optional)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and alerts

## Environment Variables

Your production environment should have these variables set:

```
DATABASE_URL=postgres://username:password@host:5432/beautifulinteriors
NODE_ENV=production
PORT=3001
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html) 
import type { Express, Request, Response, NextFunction } from "express";

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Admin access required") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Validation error") {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Error handling middleware
export function setupErrorHandling(app: Express) {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ message: err.message });
    }
    if (err instanceof AuthorizationError) {
      return res.status(403).json({ message: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Internal server error" });
  });
}

// Helper function to handle errors
export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
} 
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request ID already exists in headers
  const existingRequestId = req.get('X-Request-ID') || req.get('x-request-id');
  
  // Generate new ID if none exists
  const reqId = existingRequestId || uuidv4();
  
  // Add to request object
  req.requestId = reqId;
  
  // Add to response headers
  res.set('X-Request-ID', reqId);
  
  next();
};

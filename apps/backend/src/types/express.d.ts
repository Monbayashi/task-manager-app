import 'express';

declare module 'express' {
  interface Request {
    user?: { sub: string } & Record<string, any>;
  }
}

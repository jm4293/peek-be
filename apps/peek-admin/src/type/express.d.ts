import { IJwtToken } from './interface';

declare global {
  namespace Express {
    interface Request {
      user: IJwtToken;
    }
  }
}

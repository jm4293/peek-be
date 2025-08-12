import { IJwtToken } from './interface';

declare global {
  namespace Express {
    interface Request {
      userAccount: IJwtToken;
    }
  }
}

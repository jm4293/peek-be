import { Request } from 'express';

export const ParseReqHandler = {
  parseReq: (req: Request) => {
    const { accountId } = req.userAccount;

    return { accountId };
  },
};

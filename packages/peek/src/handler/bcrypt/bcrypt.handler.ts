import * as bcrypt from 'bcrypt';

export const BcryptHandler = {
  hashPassword: async (password: string) => {
    const hashSalt = await bcrypt.genSalt();
    return await bcrypt.hash(password, hashSalt);
  },

  comparePassword: async (password: string, hashPassword: string) => {
    return await bcrypt.compare(password, hashPassword);
  },
};

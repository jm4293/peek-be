export interface IBaseUser {
  nickname: string;
  name: string;
  policy: boolean;
  birthdate?: string;
  thumbnail?: string;
}

export interface IBaseUserAccount {
  email: string;
  password?: string;
}

export interface IUpdateUser {
  userSeq: number;
  nickname: string;
  name: string;
  birthdate: Date | null;
  thumbnail: string | null;
}

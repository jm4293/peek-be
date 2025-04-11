export interface IBaseAuth {
  nickname: string;
  name: string;
  policy: boolean;
  birthdate?: string;
  thumbnail?: string;
}

export interface IBaseAuthAccount {
  email: string;
  password?: string;
}

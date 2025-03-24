export interface IPostLoginEmailRes {
  email: string;
  accessToken: string;
}

export interface IGetOauthGoogleTokenRes {
  email: string;
  name: string;
  picture: string;
}

export interface IPostCheckEmailRes {
  email: string;
  isExist: boolean;
  message?: string;
}

export interface IPostCreateUserEmailRes {
  email: string;
}

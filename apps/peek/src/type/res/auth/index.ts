export interface IPostLoginEmailRes {
  email: string;
  accessToken: string;
}

export interface IGetOauthGoogleTokenRes {
  email: string;
  name: string;
  picture: string;
}

export * from './check-email.res';
export * from './create-user-email.res';

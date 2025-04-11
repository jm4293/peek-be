export interface IUpdateUser {
  nickname: string;
  name: string;
  birthday: string;
  thumbnailUrl: string;
}

export interface IUpdateUserPassword {
  password: string;
  newPassword: string;
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

import { UserAccountTypeEnum, UserVisitTypeEnum, userAccountTypeDescription } from '@libs/constant/enum';
import { ACCESS_TOKEN_COOKIE_TIME, ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '@libs/constant/jwt';

import { User, UserAccount } from '@libs/database/entities';
import {
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories';

import { ResConfig } from '../../config';
import { BcryptHandler } from '../../handler';
import { CheckEmailDto, CreateUserEmailDto, LoginEmailDto, LoginOauthDto } from '../../type/dto';
import { IJwtToken } from '../../type/interface';
import { IGetOauthGoogleTokenRes, IPostCheckEmailRes, IPostCreateUserEmailRes } from '../../type/res';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    private readonly userVisitRepository: UserVisitRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async registerEmail(dto: CreateUserEmailDto): Promise<IPostCreateUserEmailRes> {
    const { nickname, name, policy, birthdate, email, password } = dto;

    let user: User;

    const userAccount = await this.userAccountRepository.findOne({ where: { email }, relations: ['user'] });

    if (userAccount) {
      user = userAccount.user;
    } else {
      user = await this.userRepository.createUser({ nickname, name, policy, birthdate });
    }

    const hashedPassword = await BcryptHandler.hashPassword(password);

    const newUserAccount = await this.userAccountRepository.createUserAccountByEmail({
      userAccountType: UserAccountTypeEnum.EMAIL,
      email,
      password: hashedPassword,
      user,
    });

    return { email: newUserAccount.email };
  }

  // async checkEmail(dto: CheckEmailDto): Promise<IPostCheckEmailRes> {
  //   const { email } = dto;
  //
  //   const userAccount = await this.userAccountRepository.findOne({
  //     where: { email },
  //     relations: ['user'],
  //   });
  //
  //   if (userAccount) {
  //     const { email, userAccountType } = userAccount;
  //
  //     switch (userAccountType) {
  //       case UserAccountTypeEnum.EMAIL:
  //         throw ResConfig.Fail_400({
  //           message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 가입 회원입니다.`,
  //         });
  //       case UserAccountTypeEnum.GOOGLE:
  //         throw ResConfig.Fail_400({
  //           message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 간편로그인 회원입니다.`,
  //         });
  //       default:
  //         break;
  //     }
  //   }
  //
  //   return { isExist: !!userAccount, email };
  // }
  //
  // async loginEmail(params: { dto: LoginEmailDto; req: Request }) {
  //   const { dto, req } = params;
  //   const { email, password } = dto;
  //
  //   const userAccount = await this.userAccountRepository.findUserAccountByEmail(email);
  //
  //   const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);
  //
  //   if (!isMatch) {
  //     throw ResConfig.Fail_400({ message: '비밀번호가 일치하지 않습니다.' });
  //   }
  //
  //   return await this._login({ req, user: userAccount.user, userAccount, type: UserVisitTypeEnum.SIGN_IN_EMAIL });
  // }
  //
  // async loginOauth(params: { dto: LoginOauthDto; req: Request }) {
  //   const { dto, req } = params;
  //   const { userAccountType, access_token } = dto;
  //
  //   switch (userAccountType) {
  //     case UserAccountTypeEnum.GOOGLE: {
  //       const googleResponse = await firstValueFrom(
  //         this.httpService.get<IGetOauthGoogleTokenRes>(
  //           `${this.configService.get('GOOGLE_OAUTH_URL')}?access_token=${access_token}`,
  //         ),
  //       );
  //
  //       const { email, name, picture } = googleResponse.data;
  //
  //       const imageResponse = await firstValueFrom(this.httpService.get(picture, { responseType: 'arraybuffer' }));
  //
  //       const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
  //
  //       const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
  //
  //       const resizingPicture = await this._resizingImage({ imageFile: file });
  //
  //       const userAccount = await this.userAccountRepository.findOne({
  //         where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
  //         relations: ['user'],
  //       });
  //
  //       if (userAccount) {
  //         // 유저 계정이 있는 경우
  //
  //         await this.userRepository.update(
  //           { userSeq: userAccount.user.userSeq },
  //           { nickname: name, name, thumbnail: resizingPicture },
  //         );
  //
  //         const userAccountGoogle = await this.userAccountRepository.findOne({
  //           where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
  //           relations: ['user'],
  //         });
  //
  //         if (userAccountGoogle) {
  //           // 구글 유저 계정이 있는 경우 로그인으로 진행
  //
  //           return await this._login({
  //             req,
  //             user: userAccountGoogle.user,
  //             userAccount: userAccountGoogle,
  //             type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
  //           });
  //         } else {
  //           // 유저 계정은 있으나 구글 계정이 없는 경우 구글 계정으로 연동
  //
  //           const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
  //             userAccountType: UserAccountTypeEnum.GOOGLE,
  //             email,
  //             user: userAccount.user,
  //           });
  //
  //           return await this._login({
  //             req,
  //             user: newUserAccount.user,
  //             userAccount: newUserAccount,
  //             type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
  //           });
  //         }
  //       } else {
  //         // 유저 계정이 없는 경우 회원가입으로 진행
  //
  //         const newUser = await this.userRepository.createUser({
  //           nickname: name,
  //           name,
  //           policy: true,
  //           birthdate: undefined,
  //           thumbnail: resizingPicture,
  //         });
  //
  //         const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
  //           userAccountType: UserAccountTypeEnum.GOOGLE,
  //           email,
  //           user: newUser,
  //         });
  //
  //         return await this._login({
  //           req,
  //           user: newUser,
  //           userAccount: newUserAccount,
  //           type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
  //         });
  //       }
  //     }
  //     case UserAccountTypeEnum.KAKAO:
  //       break;
  //     case UserAccountTypeEnum.NAVER:
  //       break;
  //     default:
  //       break;
  //   }
  //
  //   return;
  // }
  //
  // async logout(params: { req: Request; res: Response }) {
  //   const { req, res } = params;
  //   const { userSeq } = req.user;
  //
  //   const user = await this.userRepository.findUserByUserSeq(userSeq);
  //
  //   await this.userAccountRepository.update({ user }, { refreshToken: null });
  //
  //   await this.userPushTokenRepository.update({ user }, { pushToken: null });
  //
  //   await this._registerUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL, user });
  //
  //   const cookies = req.cookies;
  //
  //   for (const cookie in cookies) {
  //     if (cookies.hasOwnProperty(cookie)) {
  //       res.clearCookie(cookie);
  //     }
  //   }
  //
  //   return res.status(200).send({ message: '로그아웃 되었습니다.' });
  // }
  //
  // async refreshToken(params: { req: Request; res: Response }) {
  //   const { req, res } = params;
  //
  //   const refreshToken = req.cookies['RT'] as string;
  //
  //   if (!refreshToken) {
  //     throw ResConfig.Fail_403({ message: '리프레시 토큰이 존재하지 않습니다.' });
  //   }
  //
  //   const { userSeq, userAccountType } = this.jwtService.verify<IJwtToken>(
  //     refreshToken,
  //     this.configService.get('JWT_SECRET_KEY'),
  //   );
  //
  //   const savedRefreshToken = await this.userAccountRepository.findOne({
  //     where: { user: { userSeq }, userAccountType },
  //   });
  //
  //   if (!savedRefreshToken) {
  //     throw ResConfig.Fail_403({ message: 'DB 리프레시 토큰이 존재하지 않습니다.' });
  //   }
  //
  //   if (refreshToken !== savedRefreshToken.refreshToken) {
  //     throw ResConfig.Fail_403({ message: '리프레시 토큰이 일치하지 않습니다.' });
  //   }
  //
  //   // const accessToken = await this._generateJwtToken({ userSeq, userAccountType, expiresIn: ACCESS_TOKEN_TIME });
  //
  //   const accessToken = await this._generateJwtToken({ userSeq, userAccountType, expiresIn: ACCESS_TOKEN_TIME });
  //
  //   console.log('accessToken', accessToken);
  //
  //   res.cookie('AT', accessToken, {
  //     httpOnly: true,
  //     sameSite: 'strict',
  //     maxAge: ACCESS_TOKEN_COOKIE_TIME,
  //   });
  //
  //   return res.status(200).send({});
  // }
  //
  // private async _registerUserVisit(params: { req: Request; type: UserVisitTypeEnum; user: User }) {
  //   const { req, type, user } = params;
  //   const { headers, ip = null } = req;
  //   const { 'user-agent': userAgent = null, referer = null } = headers;
  //
  //   const userVisit = this.userVisitRepository.create({ user, type, ip, userAgent, referer });
  //
  //   return await this.userVisitRepository.save(userVisit);
  // }
  //
  // private async _generateJwtToken(params: IJwtToken) {
  //   const { userSeq, userAccountType, expiresIn } = params;
  //
  //   return await this.jwtService.signAsync(
  //     { userSeq, userAccountType },
  //     { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') },
  //   );
  // }
  //
  // private async _login(params: { req: Request; user: User; userAccount: UserAccount; type: UserVisitTypeEnum }) {
  //   const { req, user, userAccount, type } = params;
  //
  //   const accessToken = await this._generateJwtToken({
  //     userSeq: user.userSeq,
  //     userAccountType: userAccount.userAccountType,
  //     expiresIn: ACCESS_TOKEN_TIME,
  //   });
  //
  //   const refreshToken = await this._generateJwtToken({
  //     userSeq: user.userSeq,
  //     userAccountType: userAccount.userAccountType,
  //     expiresIn: REFRESH_TOKEN_TIME,
  //   });
  //
  //   // res.cookie('RT', refreshToken, {
  //   //   httpOnly: true,
  //   //   sameSite: 'strict',
  //   //   maxAge: REFRESH_TOKEN_COOKIE_TIME,
  //   // });
  //
  //   await this.userAccountRepository.manager.transaction(async (manager) => {
  //     await manager.update(UserAccount, { user: { userSeq: user.userSeq } }, { refreshToken: null });
  //     await manager.update(UserAccount, { userAccountSeq: userAccount.userAccountSeq }, { refreshToken });
  //   });
  //
  //   await this._registerUserVisit({ req, type, user });
  //
  //   // return res.status(200).send({ data: { email: userAccount.email, accessToken, refreshToken } });
  //
  //   return { email: userAccount.email, accessToken, refreshToken };
  // }
  //
  // private async _resizingImage(params: { imageFile: File }) {
  //   const { imageFile } = params;
  //
  //   const formData = new FormData();
  //
  //   formData.append('image', imageFile);
  //
  //   const resizingPicture = await firstValueFrom<AxiosResponse<{ resizedImageUrl: string }>>(
  //     this.httpService.post(
  //       `${this.configService.get('IMAGE_RESIZING_URL')}:${this.configService.get('IMAGE_RESIZING_PORT')}/${this.configService.get('IMAGE_RESIZING_PREFIX')}`,
  //       formData,
  //       { headers: { 'Content-Type': 'multipart/form-data' } },
  //     ),
  //   );
  //
  //   return resizingPicture.data.resizedImageUrl;
  // }
}

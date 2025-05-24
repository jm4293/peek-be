import { Request } from 'express';
import { EntityManager } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserAccountTypeEnum, UserVisitTypeEnum, userAccountTypeDescription } from '@libs/constant/enum';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '@libs/constant/jwt';

import { User, UserAccount } from '@libs/database/entities';

import { UserAccountRepository, UserRepository, UserVisitRepository } from '@libs/database/repositories';

import { BcryptHandler } from '../../handler';
import { CheckEmailDto, CreateUserEmailDto, LoginEmailDto, LoginOauthDto } from '../../type/dto';
import { IJwtToken } from '../../type/interface';
import { ICheckEmailRes, ICreateUserEmailRes } from '../../type/res';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userVisitRepository: UserVisitRepository,
    // private readonly userPushTokenRepository: UserPushTokenRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async registerEmail(dto: CreateUserEmailDto): Promise<ICreateUserEmailRes> {
    const { nickname, name, policy, birthday, email, password } = dto;

    return await this.userAccountRepository.manager.transaction(async (manager) => {
      const user = await this._createUser({ nickname, name, policy, birthday }, manager);

      const hashedPassword = await BcryptHandler.hashPassword(password);

      const newUserAccount = manager.create(UserAccount, {
        user,
        userAccountType: UserAccountTypeEnum.EMAIL,
        email,
        password: hashedPassword,
      });

      await manager.save(UserAccount, newUserAccount);

      return { email: newUserAccount.email };
    });
  }

  async checkEmail(dto: CheckEmailDto): Promise<ICheckEmailRes> {
    const { email } = dto;

    const userAccount = await this.userAccountRepository.findOne({ where: { email } });

    if (userAccount) {
      const { email, userAccountType } = userAccount;

      if (userAccountType === UserAccountTypeEnum.EMAIL) {
        return {
          isExist: true,
          email,
          message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 가입 회원입니다.`,
        };
      }

      if (userAccountType === UserAccountTypeEnum.GOOGLE) {
        return {
          isExist: true,
          email,
          message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 간편로그인 회원입니다.`,
        };
      }
    }

    return { isExist: false, email };
  }

  async login(params: { dto: LoginEmailDto; req: Request }) {
    const { dto, req } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findByEmail(email);

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return await this._login({ req, type: UserVisitTypeEnum.SIGN_IN_EMAIL, user: userAccount.user, userAccount });
  }

  async loginOauth(params: { dto: LoginOauthDto; req: Request }) {
    //   const { dto, req } = params;
    //   const { userAccountType, access_token } = dto;
    //   switch (userAccountType) {
    //     case UserAccountTypeEnum.GOOGLE: {
    //       const googleResponse = await firstValueFrom(
    //         this.httpService.get<IGetOauthGoogleTokenRes>(
    //           `${this.configService.get('GOOGLE_OAUTH_URL')}?access_token=${access_token}`,
    //         ),
    //       );
    //       const { email, name, picture } = googleResponse.data;
    //       const imageResponse = await firstValueFrom(this.httpService.get(picture, { responseType: 'arraybuffer' }));
    //       const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
    //       const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
    //       const resizingPicture = await this._resizingImage({ imageFile: file, width: 100, height: 100 });
    //       const userAccount = await this.userAccountRepository.findOne({
    //         where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
    //         relations: ['user'],
    //       });
    //       if (userAccount) {
    //         // 유저 계정이 있는 경우
    //         await this.userRepository.update(
    //           { userSeq: userAccount.user.userSeq },
    //           { nickname: name, name, thumbnail: resizingPicture },
    //         );
    //         const userAccountGoogle = await this.userAccountRepository.findOne({
    //           where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
    //           relations: ['user'],
    //         });
    //         if (userAccountGoogle) {
    //           // 구글 유저 계정이 있는 경우 로그인으로 진행
    //           return await this._login({
    //             req,
    //             user: userAccountGoogle.user,
    //             userAccount: userAccountGoogle,
    //             type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
    //           });
    //         } else {
    //           // 유저 계정은 있으나 구글 계정이 없는 경우 구글 계정으로 연동
    //           const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
    //             userAccountType: UserAccountTypeEnum.GOOGLE,
    //             email,
    //             user: userAccount.user,
    //           });
    //           return await this._login({
    //             req,
    //             user: newUserAccount.user,
    //             userAccount: newUserAccount,
    //             type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
    //           });
    //         }
    //       } else {
    //         // 유저 계정이 없는 경우 회원가입으로 진행
    //         const newUser = await this.userRepository.createUser({
    //           nickname: name,
    //           name,
    //           policy: true,
    //           birthday: undefined,
    //           thumbnail: resizingPicture,
    //         });
    //         const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
    //           userAccountType: UserAccountTypeEnum.GOOGLE,
    //           email,
    //           user: newUser,
    //         });
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
    //   return;
  }

  async logout(params: { req: Request }) {
    const { req } = params;
    const { id } = req.userAccount;

    await this.userAccountRepository.update({ id }, { refreshToken: null });

    await this._registerUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL, userAccountId: id });
  }

  async refreshToken(params: { req: Request }) {
    const { req } = params;

    const refreshToken = req.cookies['refreshToken'] as string;

    if (!refreshToken) {
      throw new ForbiddenException('리프레시 토큰이 존재하지 않습니다.');
    }

    const { id } = this.jwtService.verify<IJwtToken>(refreshToken, this.configService.get('JWT_SECRET_KEY'));

    const userAccount = await this.userAccountRepository.findOne({ where: { id } });

    if (!userAccount) {
      throw new ForbiddenException('사용자 계정이 존재하지 않습니다.');
    }

    if (refreshToken !== userAccount.refreshToken) {
      throw new ForbiddenException('리프레시 토큰이 일치하지 않습니다.');
    }

    const accessToken = await this._generateJwtToken({ id: userAccount.id }, ACCESS_TOKEN_TIME);

    return { accessToken };
  }

  private async _registerUserVisit(params: { req: Request; type: UserVisitTypeEnum; userAccountId: number }) {
    const { req, type, userAccountId } = params;
    const { headers, ip = null } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;

    const userVisit = this.userVisitRepository.create({ userAccountId, type, ip, userAgent, referer });

    return await this.userVisitRepository.save(userVisit);
  }

  private async _generateJwtToken(params: IJwtToken, expiresIn: number) {
    const { id } = params;

    return await this.jwtService.signAsync({ id }, { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') });
  }

  private async _login(params: { req: Request; type: UserVisitTypeEnum; user: User; userAccount: UserAccount }) {
    const { req, type, user, userAccount } = params;

    const accessToken = await this._generateJwtToken({ id: userAccount.id }, ACCESS_TOKEN_TIME);

    const refreshToken = await this._generateJwtToken({ id: userAccount.id }, REFRESH_TOKEN_TIME);

    await this.userAccountRepository.manager.transaction(async (manager) => {
      await manager.update(UserAccount, { userId: user.id }, { refreshToken: null });
      await manager.update(UserAccount, { id: userAccount.id }, { refreshToken });
    });

    await this._registerUserVisit({ req, type, userAccountId: userAccount.id });

    return { accessToken, refreshToken };
  }

  private async _resizingImage(params: { imageFile: File; width: number; height: number }) {
    // const { imageFile, width, height } = params;
    //
    // const formData = new FormData();
    //
    // formData.append('image', imageFile);
    // formData.append('width', width.toString());
    // formData.append('height', height.toString());
    //
    // const resizingPicture = await firstValueFrom<AxiosResponse<{ resizedImageUrl: string }>>(
    //   // this.httpService.post(
    //   //   `${this.configService.get('IMAGE_RESIZING_URL')}:${this.configService.get('IMAGE_RESIZING_PORT')}/${this.configService.get('IMAGE_RESIZING_PREFIX')}`,
    //   //   formData,
    //   //   { headers: { 'Content-Type': 'multipart/form-data' } },
    //   // ),
    //   this.httpService.post(
    //     `${this.configService.get('IMAGE_RESIZING_URL')}/${this.configService.get('IMAGE_RESIZING_PREFIX')}/upload`,
    //     formData,
    //     { headers: { 'Content-Type': 'multipart/form-data' } },
    //   ),
    // );
    //
    // return resizingPicture.data.resizedImageUrl;
  }

  private async _createUser(
    params: {
      nickname: string;
      name: string;
      policy: boolean;
      birthday?: string;
      thumbnail?: string;
    },
    manager: EntityManager,
  ) {
    const { nickname, name, policy, birthday, thumbnail } = params;

    const user = manager.create(User, { nickname, name, policy, birthday, thumbnail });

    return await manager.save(User, user);
  }
}

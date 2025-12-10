import { Request } from 'express';
import { DataSource, EntityManager } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';

import { BcryptHandler } from '@peek/handler/bcrypt';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_NAME, REFRESH_TOKEN_TIME } from '@peek/shared/constants/cookie';
import { IJwtToken } from '@peek/type/interface';

import { User, UserAccount } from '@libs/database/entities/user';
import {
  UserAccountRepository,
  UserOauthTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories/user';

import { EntityName } from '@libs/shared/const/entity';
import {
  UserAccountType,
  UserAccountTypeValue,
  UserVisitType,
  UserVisitTypeValue,
  userAccountTypeDescription,
} from '@libs/shared/const/user';

import { AWSService } from '../aws';
import { EmailVerificationService } from '../email-verification';
import { CheckEmailCodeDto, CheckEmailDto, LoginEmailDto, LoginOauthDto, SignupEmailDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly awsService: AWSService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly emailVerificationService: EmailVerificationService,

    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userVisitRepository: UserVisitRepository,
    private readonly userOauthTokenRepository: UserOauthTokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async checkEmail(dto: CheckEmailDto) {
    const { email } = dto;

    const userAccount = await this.userAccountRepository.findOne({ where: { email } });

    if (userAccount) {
      const { email, userAccountType } = userAccount;

      if (userAccountType === UserAccountType.EMAIL) {
        return {
          isExist: true,
          email,
          message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 가입 회원입니다.`,
        };
      }

      if (userAccountType === UserAccountType.GOOGLE) {
        return {
          isExist: true,
          email,
          message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 간편로그인 회원입니다.`,
        };
      }
    }

    await this.emailVerificationService.sendVerificationCode(email);
  }

  async checkEmailCode(dto: CheckEmailCodeDto) {
    const { email, code } = dto;

    return await this.emailVerificationService.verifyCode(email, code);
  }

  async signup(dto: SignupEmailDto) {
    const { nickname, name, policy, birthday, email, password } = dto;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const user = manager.create(User, { nickname, name, policy, birthday, thumbnail: null });
      const savedUser = await manager.save(User, user);

      const hashedPassword = await BcryptHandler.hashPassword(password);

      const userAccount = manager.create(UserAccount, {
        userId: savedUser.id,
        userAccountType: UserAccountType.EMAIL,
        email,
        password: hashedPassword,
      });

      await manager.save(UserAccount, userAccount);

      return { email };
    });
  }

  async login(params: { dto: LoginEmailDto; req: Request }) {
    const { dto, req } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountType.EMAIL },
      // relations: ['user'],
      relations: [EntityName.User],
    });

    if (!userAccount) {
      throw new BadRequestException('존재하지 않는 이메일계정입니다.');
    }

    if (userAccount.userAccountType !== UserAccountType.EMAIL) {
      throw new BadRequestException(
        `이메일: ${email}은 ${userAccountTypeDescription[userAccount.userAccountType]} 간편로그인 회원입니다.`,
      );
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return await this._login({ req, type: UserVisitType.SIGN_IN_EMAIL, user: userAccount.user, userAccount });
  }

  async loginOauth(params: { dto: LoginOauthDto; req: Request }) {
    const { dto, req } = params;
    const { userAccountType, token, tokenType, expire } = dto;

    switch (userAccountType) {
      case UserAccountType.GOOGLE:
        return await this._googleOauthLogin({ req, token, tokenType, expire });
      case UserAccountType.KAKAO:
        return await this._kakaoOauthLogin({ req, token });
      case UserAccountType.NAVER:
        return await this._naverOauthLogin({ req, token });
      default:
        break;
    }
  }

  async logout(params: { req: Request; accountId: number }) {
    const { req, accountId } = params;

    await this.userAccountRepository.update({ id: accountId }, { refreshToken: null });
    await this.userOauthTokenRepository.delete({ userAccountId: accountId });

    await this._registerUserVisit({ req, type: UserVisitType.SIGN_OUT, userAccountId: accountId });
  }

  async refreshToken(params: { req: Request }) {
    const { req } = params;

    const refreshToken = req.cookies[REFRESH_TOKEN_NAME] as string;

    if (!refreshToken) {
      return null;
    }

    const { accountId } = this.jwtService.verify<IJwtToken>(refreshToken, this.configService.get('JWT_SECRET_KEY'));

    const userAccount = await this.userAccountRepository.findOne({ where: { id: accountId } });

    if (!userAccount) {
      return null;
    }

    if (refreshToken !== userAccount.refreshToken) {
      return null;
    }

    return await this._generateJwtToken({ accountId: userAccount.id }, ACCESS_TOKEN_TIME);
  }

  private async _registerUserVisit(params: { req: Request; type: UserVisitTypeValue; userAccountId: number }) {
    const { req, type, userAccountId } = params;
    const { headers, ip = null } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;

    const userVisit = this.userVisitRepository.create({ userAccountId, type, ip, userAgent, referer });

    return await this.userVisitRepository.save(userVisit);
  }

  private async _generateJwtToken(params: IJwtToken, expiresIn: number) {
    const { accountId } = params;

    const generateUniqueId = () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    return await this.jwtService.signAsync(
      { accountId },
      {
        expiresIn,
        secret: this.configService.get('JWT_SECRET_KEY'),
        algorithm: 'HS256',
        issuer: 'peek.run',
        audience: 'peek.run',
        subject: accountId.toString(),
        jwtid: generateUniqueId(),
      },
    );
  }

  private async _login(params: { req: Request; type: UserVisitTypeValue; user: User; userAccount: UserAccount }) {
    const { req, type, user, userAccount } = params;

    const accessToken = await this._generateJwtToken({ accountId: userAccount.id }, ACCESS_TOKEN_TIME);
    const refreshToken = await this._generateJwtToken({ accountId: userAccount.id }, REFRESH_TOKEN_TIME);

    // await this.dataSource.transaction(async (manager) => {
    //   await manager.update(UserAccount, { userId: user.id }, { refreshToken: null });
    //   await manager.update(UserAccount, { id: userAccount.id }, { refreshToken });
    // });

    await this.userAccountRepository.update({ id: userAccount.id }, { refreshToken });

    await this._registerUserVisit({ req, type, userAccountId: userAccount.id });

    return { accessToken, refreshToken };
  }

  private async _googleOauthLogin(params: { req: Request; token: string; tokenType: string; expire: string }) {
    const { req, token, tokenType, expire } = params;

    const response = await this.httpService.axiosRef.get<{
      email: string;
      name: string;
      picture: string;
    }>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      params: {
        access_token: token,
      },
    });

    const { email, name, picture } = response.data;

    return await this._OAuthLogin({
      type: UserAccountType.GOOGLE,
      imageUrl: picture,
      email,
      name,
      nickname: name,
      tokenType,
      accessToken: token,
      accessTokenExpire: expire,
      refreshToken: null,
      refreshTokenExpire: null,
      req,
    });
  }

  private async _kakaoOauthLogin(params: { req: Request; token: string }) {
    const { req, token } = params;

    const response = await this.httpService.axiosRef.get<{
      token_type: string;
      access_token: string;
      expires_in: string;
      refresh_token: string;
      refresh_token_expires_in: string;
    }>(`https://kauth.kakao.com/oauth/token`, {
      params: {
        grant_type: 'authorization_code',
        client_id: this.configService.get('KAKAO_APP_KEY'),
        redirect_uri: this.configService.get('KAKAO_REDIRECT_URI'),
        code: token,
        client_secret: this.configService.get('KAKAO_CLIENT_SECRET'),
      },
    });

    const { token_type, access_token, expires_in, refresh_token, refresh_token_expires_in } = response.data;

    const userInfo = await this.httpService.axiosRef.get<{
      kakao_account: {
        email: string;
        profile: {
          nickname: string;
        };
      };
    }>('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const { kakao_account } = userInfo.data;
    const { email, profile } = kakao_account;
    const { nickname } = profile;

    return await this._OAuthLogin({
      type: UserAccountType.KAKAO,
      imageUrl: null,
      email,
      name: nickname,
      nickname,
      tokenType: token_type,
      accessToken: access_token,
      accessTokenExpire: expires_in,
      refreshToken: refresh_token,
      refreshTokenExpire: refresh_token_expires_in,
      req,
    });
  }

  private async _naverOauthLogin(params: { req: Request; token: string }) {
    const { req, token } = params;

    const response = await this.httpService.axiosRef.get<{
      token_type: string;
      access_token: string;
      expires_in: string;
      refresh_token: string;
    }>(`https://nid.naver.com/oauth2.0/token`, {
      params: {
        client_id: this.configService.get('NAVER_CLIENT_ID'),
        client_secret: this.configService.get('NAVER_CLIENT_SECRET'),
        grant_type: 'authorization_code',
        state: 'peek',
        code: token,
      },
    });

    const { token_type, access_token, expires_in, refresh_token } = response.data;

    const userInfo = await this.httpService.axiosRef.get<{
      response: {
        email: string;
        name: string;
        nickname: string;
        profile_image: string;
      };
    }>('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const { email, name, nickname, profile_image } = userInfo.data.response;

    return await this._OAuthLogin({
      type: UserAccountType.NAVER,
      imageUrl: profile_image,
      email,
      name,
      nickname,
      tokenType: token_type,
      accessToken: access_token,
      accessTokenExpire: expires_in,
      refreshToken: refresh_token,
      refreshTokenExpire: null,
      req,
    });
  }

  private async _OAuthLogin(params: {
    imageUrl: string;
    type: UserAccountTypeValue;
    email: string;
    name: string;
    nickname: string;
    tokenType: string;
    accessToken: string;
    accessTokenExpire: string;
    refreshToken: string | null;
    refreshTokenExpire: string | null;
    req: Request;
  }) {
    const {
      imageUrl,
      type,
      email,
      name,
      nickname,
      accessToken,
      tokenType,
      accessTokenExpire,
      refreshToken,
      refreshTokenExpire,
      req,
    } = params;

    let thumbnail = null;

    const oauthAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: type },
      // relations: ['user'],
      relations: [EntityName.User],
    });

    // 계정이 있는 경우 로그인으로 진행
    if (oauthAccount) {
      await this._oauthTokenSave({
        accountId: oauthAccount.id,
        accountType: type,
        tokenType,
        accessToken,
        accessTokenExpire,
        refreshToken,
        refreshTokenExpire,
      });

      return await this._login({
        req,
        type: UserVisitType.SIGN_IN_OAUTH,
        user: oauthAccount.user,
        userAccount: oauthAccount,
      });
    }

    // if (imageUrl) {
    //   const imageResponse = await firstValueFrom(this.httpService.get(imageUrl, { responseType: 'arraybuffer' }));

    //   const imageBuffer = Buffer.from(imageResponse.data);

    //   const mockFile: Express.Multer.File = {
    //     buffer: imageBuffer,
    //     originalname: `${name}.jpg`,
    //     mimetype: 'image/jpeg',
    //     size: imageBuffer.length,
    //     fieldname: 'file',
    //     encoding: '7bit',
    //     filename: `${name}.jpg`,
    //     destination: '',
    //     path: '',
    //     stream: null as any,
    //   };

    //   thumbnail = await this.awsService.uploadImage({
    //     file: mockFile,
    //     type: IMAGE_TYPE.THUMBNAIL,
    //   });
    // }

    const emailAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountType.EMAIL },
      // relations: ['user'],
      relations: [EntityName.User],
    });

    // 계정이 이메일 타입으로 있는 경우, OAuth 계정 연동 후 로그인으로 진행
    if (emailAccount) {
      await this.userRepository.update({ id: emailAccount.user.id }, { nickname, name, thumbnail });

      const savedGoogleAccount = this.userAccountRepository.create({
        userId: emailAccount.user.id,
        userAccountType: type,
        email,
      });

      await this.userAccountRepository.save(savedGoogleAccount);

      await this._oauthTokenSave({
        accountId: emailAccount.id,
        accountType: type,
        tokenType,
        accessToken,
        accessTokenExpire,
        refreshToken,
        refreshTokenExpire,
      });

      return await this._login({
        req,
        type: UserVisitType.SIGN_IN_OAUTH,
        user: emailAccount.user,
        userAccount: emailAccount,
      });
    }

    // OAuth 회원가입
    const savedUser = this.userRepository.create({
      nickname,
      name,
      policy: true,
      birthday: null,
      thumbnail,
    });

    const newUser = await this.userRepository.save(savedUser);

    const savedAccount = this.userAccountRepository.create({
      userAccountType: type,
      email,
      userId: newUser.id,
    });

    const newAccount = await this.userAccountRepository.save(savedAccount);

    await this._oauthTokenSave({
      accountId: newAccount.id,
      accountType: type,
      tokenType,
      accessToken,
      accessTokenExpire,
      refreshToken,
      refreshTokenExpire,
    });

    return await this._login({
      req,
      type: UserVisitType.SIGN_IN_OAUTH,
      user: newUser,
      userAccount: newAccount,
    });
  }

  private async _oauthTokenSave(params: {
    accountId: number;
    accountType: UserAccountTypeValue;
    tokenType: string;
    accessToken: string;
    accessTokenExpire: string | null;
    refreshToken: string | null;
    refreshTokenExpire: string | null;
  }) {
    const { accountId, accountType, tokenType, accessToken, accessTokenExpire, refreshToken, refreshTokenExpire } =
      params;

    const newOauthToken = this.userOauthTokenRepository.create({
      userAccountId: accountId,
      userAccountType: accountType,
      tokenType,
      accessToken,
      accessTokenExpire,
      refreshToken,
      refreshTokenExpire,
    });

    await this.userOauthTokenRepository.save(newOauthToken);
  }

  // private async _resizingImage(params: { imageFile: File }) {
  //   const { imageFile } = params;

  //   const formData = new FormData();

  //   formData.append('image', imageFile);

  //   const resizingPicture = await firstValueFrom<AxiosResponse<{ name: string }>>(
  //     this.httpService.post(`http://localhost:${this.configService.get('IMAGE_SERVER_PORT')}`, formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     }),
  //   );

  //   return resizingPicture.data.name;
  // }
}

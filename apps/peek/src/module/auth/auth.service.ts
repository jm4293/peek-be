import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { DataSource, EntityManager } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';

import { REFRESH_TOKEN_NAME } from '@peek/constant/cookie';
import { IMAGE_TYPE } from '@peek/constant/image-type';
import { BcryptHandler } from '@peek/handler/bcrypt';
import { IJwtToken } from '@peek/type/interface';

import { UserAccountTypeEnum, UserVisitTypeEnum, userAccountTypeDescription } from '@constant/enum/user';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '@constant/jwt/index';

import { User, UserAccount } from '@database/entities/user';
import { UserAccountRepository, UserRepository, UserVisitRepository } from '@database/repositories/user';

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

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async checkEmail(dto: CheckEmailDto) {
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
        userAccountType: UserAccountTypeEnum.EMAIL,
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

    const userAccount = await this.userAccountRepository.findByEmail(email);

    if (userAccount.userAccountType !== UserAccountTypeEnum.EMAIL) {
      throw new BadRequestException(
        `이메일: ${email}은 ${userAccountTypeDescription[userAccount.userAccountType]} 간편로그인 회원입니다.`,
      );
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return await this._login({ req, type: UserVisitTypeEnum.SIGN_IN_EMAIL, user: userAccount.user, userAccount });
  }

  async loginOauth(params: { dto: LoginOauthDto; req: Request }) {
    const { dto, req } = params;
    const { userAccountType, token } = dto;

    switch (userAccountType) {
      case UserAccountTypeEnum.GOOGLE:
        return await this._googleOauthLogin({ req, token });
      case UserAccountTypeEnum.KAKAO:
        return await this._kakaoOauthLogin({ req, token });
      case UserAccountTypeEnum.NAVER:
        return await this._naverOauthLogin({ req, token });
      default:
        break;
    }
  }

  async logout(params: { req: Request; accountId: number }) {
    const { req, accountId } = params;

    await this.userAccountRepository.update({ id: accountId }, { refreshToken: null });

    await this._registerUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT, userAccountId: accountId });
  }

  async refreshToken(params: { req: Request }) {
    const { req } = params;

    const refreshToken = req.cookies[REFRESH_TOKEN_NAME] as string;

    if (!refreshToken) {
      throw new ForbiddenException();
    }

    const { accountId } = this.jwtService.verify<IJwtToken>(refreshToken, this.configService.get('JWT_SECRET_KEY'));

    const userAccount = await this.userAccountRepository.findOne({ where: { id: accountId } });

    if (!userAccount) {
      throw new ForbiddenException();
    }

    if (refreshToken !== userAccount.refreshToken) {
      throw new ForbiddenException();
    }

    const accessToken = await this._generateJwtToken({ accountId: userAccount.id }, ACCESS_TOKEN_TIME);

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
    const { accountId } = params;

    return await this.jwtService.signAsync(
      { accountId },
      { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') },
    );
  }

  private async _login(params: { req: Request; type: UserVisitTypeEnum; user: User; userAccount: UserAccount }) {
    const { req, type, user, userAccount } = params;

    const accessToken = await this._generateJwtToken({ accountId: userAccount.id }, ACCESS_TOKEN_TIME);
    const refreshToken = await this._generateJwtToken({ accountId: userAccount.id }, REFRESH_TOKEN_TIME);

    await this.dataSource.transaction(async (manager) => {
      await manager.update(UserAccount, { userId: user.id }, { refreshToken: null });
      await manager.update(UserAccount, { id: userAccount.id }, { refreshToken });
    });

    await this._registerUserVisit({ req, type, userAccountId: userAccount.id });

    return { accessToken, refreshToken };
  }

  private async _googleOauthLogin(params: { req: Request; token: string }) {
    const { req, token } = params;

    const response = await firstValueFrom(
      this.httpService
        .get<{
          email: string;
          name: string;
          picture: string;
        }>(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`구글 OAuth 인증에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { email, name, picture } = response.data;

    return await this._OAuthLogin({
      type: UserAccountTypeEnum.GOOGLE,
      imageUrl: picture,
      email,
      name,
      nickname: name,
      req,
    });
  }

  private async _kakaoOauthLogin(params: { req: Request; token: string }) {
    const { req, token } = params;

    const response = await firstValueFrom(
      this.httpService
        .get<{
          access_token: string;
        }>(
          `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${this.configService.get('KAKAO_APP_KEY')}&redirect_uri=${this.configService.get('KAKAO_REDIRECT_URI')}&code=${token}&client_secret=${this.configService.get('KAKAO_CLIENT_SECRET')}`,
        )
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`카카오 OAuth 인증에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { access_token } = response.data;

    const userInfo = await firstValueFrom(
      this.httpService
        .get<{
          kakao_account: {
            email: string;
            profile: {
              nickname: string;
            };
          };
        }>(
          `https://kapi.kakao.com/v2/user/me?secure_resource=${this.configService.get('NODE_ENV') ? 'true' : 'false'}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          },
        )
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`카카오 유저 정보 조회에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { kakao_account } = userInfo.data;
    const { email, profile } = kakao_account;
    const { nickname } = profile;

    return await this._OAuthLogin({
      type: UserAccountTypeEnum.KAKAO,
      imageUrl: null,
      email,
      name: nickname,
      nickname,
      req,
    });
  }

  private async _naverOauthLogin(params: { req: Request; token: string }) {
    const { req, token } = params;

    const response = await firstValueFrom(
      this.httpService
        .get<{
          access_token: string;
          token_type: string;
        }>(
          `https://nid.naver.com/oauth2.0/token?client_id=${this.configService.get('NAVER_CLIENT_ID')}&client_secret=${this.configService.get('NAVER_CLIENT_SECRET')}&grant_type=authorization_code&state=peek&code=${token}`,
        )
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`네이버 OAuth 인증에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { access_token, token_type } = response.data;

    const userInfo = await firstValueFrom(
      this.httpService
        .get<{
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
        })
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`카카오 유저 정보 조회에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { email, name, nickname, profile_image } = userInfo.data.response;

    return await this._OAuthLogin({
      type: UserAccountTypeEnum.NAVER,
      imageUrl: profile_image,
      email,
      name,
      nickname,
      req,
    });
  }

  private async _OAuthLogin(params: {
    imageUrl: string;
    type: UserAccountTypeEnum;
    email: string;
    name: string;
    nickname: string;
    req: Request;
  }) {
    const { imageUrl, type, email, name, nickname, req } = params;

    let thumbnail = null;

    const oauthAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: type },
      relations: ['user'],
    });

    // 계정이 있는 경우 로그인으로 진행
    if (oauthAccount) {
      await this.userRepository.update({ id: oauthAccount.user.id }, { nickname, name });

      return await this._login({
        req,
        type: UserVisitTypeEnum.SIGN_IN_OAUTH,
        user: oauthAccount.user,
        userAccount: oauthAccount,
      });
    }

    if (imageUrl) {
      const imageResponse = await firstValueFrom(this.httpService.get(imageUrl, { responseType: 'arraybuffer' }));

      const imageBuffer = Buffer.from(imageResponse.data);

      const mockFile: Express.Multer.File = {
        buffer: imageBuffer,
        originalname: `${name}.jpg`,
        mimetype: 'image/jpeg',
        size: imageBuffer.length,
        fieldname: 'file',
        encoding: '7bit',
        filename: `${name}.jpg`,
        destination: '',
        path: '',
        stream: null as any,
      };

      thumbnail = await this.awsService.uploadImage({
        file: mockFile,
        type: IMAGE_TYPE.THUMBNAIL,
      });
    }

    const emailAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountTypeEnum.EMAIL },
      relations: ['user'],
    });

    // 존재하는 계정이 이메일 타입 계정이면
    if (emailAccount) {
      await this.userRepository.update({ id: emailAccount.user.id }, { nickname, name, thumbnail });

      const savedGoogleAccount = this.userAccountRepository.create({
        userId: emailAccount.user.id,
        userAccountType: type,
        email,
      });

      await this.userAccountRepository.save(savedGoogleAccount);

      return await this._login({
        req,
        type: UserVisitTypeEnum.SIGN_IN_OAUTH,
        user: emailAccount.user,
        userAccount: emailAccount,
      });
    }

    // OAuth 회원가입
    const savedUser = this.userRepository.create({
      nickname,
      name,
      policy: true,
      birthday: undefined,
      thumbnail,
    });

    const newUser = await this.userRepository.save(savedUser);

    const savedAccount = this.userAccountRepository.create({
      userAccountType: type,
      email,
      user: newUser,
    });

    const newAccount = await this.userAccountRepository.save(savedAccount);

    return await this._login({
      req,
      type: UserVisitTypeEnum.SIGN_IN_OAUTH,
      user: newUser,
      userAccount: newAccount,
    });
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

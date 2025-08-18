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
    const { userAccountType, access_token } = dto;

    switch (userAccountType) {
      case UserAccountTypeEnum.GOOGLE:
        return await this._googleOauthLogin({ req, access_token });
      default:
        break;
    }
  }

  async logout(params: { req: Request }) {
    const { req } = params;
    const { accountId } = req.userAccount;

    await this.userAccountRepository.update({ id: accountId }, { refreshToken: null });

    await this._registerUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL, userAccountId: accountId });
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

  private async _googleOauthLogin(params: { req: Request; access_token: string }) {
    const { req, access_token } = params;

    const googleResponse = await firstValueFrom(
      this.httpService
        .get<{
          email: string;
          name: string;
          picture: string;
        }>(`${this.configService.get('GOOGLE_OAUTH_URL')}?access_token=${access_token}`)
        .pipe(
          catchError((error) => {
            throw new BadRequestException(`구글 OAuth 인증에 실패했습니다: ${error.message}`);
          }),
        ),
    );

    const { email, name, picture } = googleResponse.data;
    let thumbnail = null;

    // if (picture) {
    //   const imageResponse = await firstValueFrom(this.httpService.get(picture, { responseType: 'arraybuffer' }));
    //   const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
    //   const image = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

    //   const ret = await this.awsService.uploadImage({
    //     file: image,
    //     type: IMAGE_TYPE.THUMBNAIL,
    //   });
    // }

    if (picture) {
      const imageResponse = await firstValueFrom(this.httpService.get(picture, { responseType: 'arraybuffer' }));

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

    const googleAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
      relations: ['user'],
    });

    // 구글 계정이 있는 경우 로그인으로 진행
    if (googleAccount) {
      await this.userRepository.update({ id: googleAccount.user.id }, { nickname: name, name, thumbnail });

      return await this._login({
        req,
        type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
        user: googleAccount.user,
        userAccount: googleAccount,
      });
    }

    const account = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountTypeEnum.EMAIL },
      relations: ['user'],
    });

    // 이메일 계정이 있으나 구글 계정이 없는 경우
    if (account) {
      await this.userRepository.update({ id: account.user.id }, { nickname: name, name, thumbnail });

      const savedGoogleAccount = this.userAccountRepository.create({
        userId: account.user.id,
        userAccountType: UserAccountTypeEnum.GOOGLE,
        email,
      });

      await this.userAccountRepository.save(savedGoogleAccount);

      return await this._login({
        req,
        type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
        user: account.user,
        userAccount: account,
      });
    }

    // 구글 회원가입
    const savedUser = this.userRepository.create({
      nickname: name,
      name,
      policy: true,
      birthday: undefined,
      thumbnail,
    });

    const newUser = await this.userRepository.save(savedUser);

    const savedGoogleAccount = this.userAccountRepository.create({
      userAccountType: UserAccountTypeEnum.GOOGLE,
      email,
      user: newUser,
    });

    const newUserAccount = await this.userAccountRepository.save(savedGoogleAccount);

    return await this._login({
      req,
      type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
      user: newUser,
      userAccount: newUserAccount,
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

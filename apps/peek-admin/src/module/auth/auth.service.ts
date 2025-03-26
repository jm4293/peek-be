import { Request, Response } from 'express';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '@libs/constant';
import { UserTypeEnum } from '@libs/constant/enum';

import { UserAccountRepository } from '@libs/database/repositories';

import { BcryptHandler } from '../../handler';
import { LoginDto } from '../../type/dto/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAccountRepository: UserAccountRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(params: { dto: LoginDto; res: Response }) {
    const { dto, res } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findByEmail(email);

    const adminAccount = await this.userAccountRepository.findOne({
      where: { email, user: { type: UserTypeEnum.ADMIN } },
    });

    if (!adminAccount) {
      throw new BadRequestException('어드민 계정이 아닙니다.');
    }

    const isMatch = await BcryptHandler.comparePassword(password, adminAccount.password as string);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    const accessToken = await this.jwtService.signAsync(
      { userSeq: userAccount.user, userAccountType: userAccount.userAccountType },
      { expiresIn: ACCESS_TOKEN_TIME, secret: this.configService.get('JWT_SECRET_KEY') },
    );

    const refreshToken = await this.jwtService.signAsync(
      { userSeq: userAccount.user, userAccountType: userAccount.userAccountType },
      { expiresIn: REFRESH_TOKEN_TIME, secret: this.configService.get('JWT_SECRET_KEY') },
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

    return res.status(200).json({ data: { email, accessToken } });
  }

  async logout(params: { req: Request; res: Response }) {
    const { req, res } = params;

    const cookies = req.cookies;

    for (const cookie in cookies) {
      if (cookies.hasOwnProperty(cookie)) {
        res.clearCookie(cookie);
      }
    }

    return res.status(200).send({ message: '로그아웃 되었습니다.' });
  }
}

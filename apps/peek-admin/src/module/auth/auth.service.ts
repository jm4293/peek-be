import { Request } from 'express';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { BcryptHandler } from '@peek-admin/handler/bcrypt';
import { ADMIN_ACCESS_TOKEN_TIME, ADMIN_REFRESH_TOKEN_TIME } from '@peek-admin/shared/cookie';
import { LoginDto } from '@peek-admin/type/dto';

import { UserAccountRepository, UserVisitRepository } from '@libs/database/repositories/user';

import { EntityName } from '@libs/shared/const/entity';
import { UserAccountType, UserType, UserVisitType, UserVisitTypeValue } from '@libs/shared/const/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userVisitRepository: UserVisitRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(params: { dto: LoginDto; req: Request }) {
    const { dto, req } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findOne({
      where: { email, userAccountType: UserAccountType.EMAIL },
      // relations: ['user'],
      relations: [EntityName.User],
    });

    if (!userAccount) {
      throw new BadRequestException('어드민 계정이 아닙니다.');
    }

    const adminAccount = await this.userAccountRepository.findOne({
      where: { email, user: { type: UserType.ADMIN } },
    });

    if (!adminAccount) {
      throw new BadRequestException('어드민 계정이 아닙니다.');
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    await this._registerUserVisit({ req, type: UserVisitType.SIGN_IN_EMAIL, userAccountId: userAccount.id });

    const accessToken = await this.jwtService.signAsync(
      { userSeq: userAccount.user, userAccountType: userAccount.userAccountType },
      { expiresIn: ADMIN_ACCESS_TOKEN_TIME, secret: this.configService.get('JWT_SECRET_KEY') },
    );

    const refreshToken = await this.jwtService.signAsync(
      { userSeq: userAccount.user, userAccountType: userAccount.userAccountType },
      { expiresIn: ADMIN_REFRESH_TOKEN_TIME, secret: this.configService.get('JWT_SECRET_KEY') },
    );

    return { accessToken, refreshToken };
  }

  async logout(params: { req: Request; accountId: number }) {
    const { req, accountId } = params;

    await this._registerUserVisit({ req, type: UserVisitType.SIGN_IN_EMAIL, userAccountId: accountId });
  }

  private async _registerUserVisit(params: { req: Request; type: UserVisitTypeValue; userAccountId: number }) {
    const { req, type, userAccountId } = params;
    const { headers, ip = null } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;

    const userVisit = this.userVisitRepository.create({ userAccountId, type, ip, userAgent, referer });

    return await this.userVisitRepository.save(userVisit);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { UserTypeEnum } from '@libs/constant/enum';

import { UserAccountRepository } from '@libs/database/repositories';

import { BcryptHandler } from '../../handler';
import { LoginDto } from '../../type/dto/auth';

@Injectable()
export class AuthService {
  constructor(private readonly userAccountRepository: UserAccountRepository) {}

  async login(params: { dto: LoginDto; res: Response }) {
    const { dto, res } = params;
    const { email, password } = dto;

    await this.userAccountRepository.findByEmail(email);

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

    return res.status(200).json({ email });
  }
}

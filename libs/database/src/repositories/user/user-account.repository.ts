import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { UserAccountTypeEnum } from '@libs/constant';

import { User, UserAccount } from '@libs/database/entities';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

  // async createUserAccountByEmail(dto: {
  //   userAccountType: UserAccountTypeEnum;
  //   email: string;
  //   password: string;
  //   user: User;
  // }) {
  //   const { user, userAccountType, email, password } = dto;
  //
  //   const userAccount = this.create({ user, userAccountType, email, password });
  //
  //   return await this.save(userAccount);
  // }

  // async createUserAccountByOauth(dto: { email: string; user: User; userAccountType: UserAccountTypeEnum }) {
  //   const { user, userAccountType, email } = dto;

  //   const userAccount = this.create({ user, userAccountType, email });

  //   return await this.save(userAccount);
  // }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id }, relations: ['user'] });

    if (!ret) {
      throw new BadRequestException('사용자 계정이 존재하지 않습니다.');
    }

    return ret;
  }

  async findByEmail(email: string) {
    const ret = await this.findOne({ where: { email }, relations: ['user'] });

    if (!ret) {
      throw new BadRequestException('사용자 계정이 존재하지 않습니다.');
    }

    return ret;
  }
}

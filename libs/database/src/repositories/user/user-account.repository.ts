import { UserAccountTypeEnum } from '@libs/constant';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

import { User, UserAccount } from '@libs/database/entities';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

  async createUserAccountByEmail(dto: {
    userAccountType: UserAccountTypeEnum;
    email: string;
    password: string;
    user: User;
  }) {
    const { user, userAccountType, email, password } = dto;

    const userAccount = this.create({ user, userAccountType, email, password });

    return await this.save(userAccount);
  }

  // async createUserAccountByOauth(
  //   dto: Pick<CreateUserEmailDto, 'email'> & { user: User; userAccountType: UserAccountTypeEnum },
  // ) {
  //   const { user, userAccountType, email } = dto;
  //
  //   const userAccount = this.create({ user, userAccountType, email });
  //
  //   return await this.save(userAccount);
  // }
  //
  // async findUserAccountByEmail(email: string) {
  //   const userAccount = await this.findOne({ where: { email }, relations: ['user'] });
  //
  //   if (!userAccount) {
  //     throw ResConfig.Fail_400({ message: '사용자 계정이 존재하지 않습니다.' });
  //   }
  //
  //   return userAccount;
  // }
}

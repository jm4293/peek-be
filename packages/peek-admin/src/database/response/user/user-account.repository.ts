import { Injectable } from '@nestjs/common';
import { UserAccount } from '../../entities';
import { EntityManager, Repository } from 'typeorm';
import { ResConfig } from '../../../config';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

  async findUserAccountByEmail(email: string) {
    const userAccount = await this.findOne({ where: { email }, relations: ['user'] });

    if (!userAccount) {
      throw ResConfig.Fail_400({ message: '사용자 계정이 존재하지 않습니다.' });
    }

    return userAccount;
  }
}

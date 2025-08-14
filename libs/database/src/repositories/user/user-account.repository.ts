import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { UserAccount } from '@database/entities/user';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

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

import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from '@libs/database/entities/user';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(manager: EntityManager) {
    super(User, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
    }

    return ret;
  }
}

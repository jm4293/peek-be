import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../../entities';
import { ResConfig } from '../../../config';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(manager: EntityManager) {
    super(User, manager);
  }

  async findUserByUserSeq(userSeq: number) {
    const user = await this.findOne({ where: { userSeq } });

    if (!user) {
      throw ResConfig.Fail_400({ message: '사용자 정보가 없습니다.' });
    }

    return user;
  }
}

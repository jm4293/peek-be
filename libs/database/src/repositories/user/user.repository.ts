import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

import { User } from '@libs/database/entities';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(manager: EntityManager) {
    super(User, manager);
  }

  // async createUser(dto: Pick<CreateUserEmailDto, 'nickname' | 'name' | 'policy' | 'birthdate' | 'thumbnail'>) {
  //   const { nickname, name, policy, birthdate, thumbnail } = dto;
  //
  //   const user = this.create({ nickname, name, policy, birthdate, thumbnail });
  //
  //   return await this.save(user);
  // }
  //
  // async findUserByUserSeq(userSeq: number) {
  //   const user = await this.findOne({ where: { userSeq } });
  //
  //   if (!user) {
  //     throw ResConfig.Fail_400({ message: '사용자 정보가 존재하지 않습니다.' });
  //   }
  //
  //   return user;
  // }
}

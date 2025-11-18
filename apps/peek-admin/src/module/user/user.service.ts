import { Injectable } from '@nestjs/common';

import { ADMIN_LIST_LIMIT } from '@peek-admin/shared/list';
import { GetUserListDto } from '@peek-admin/type/dto';

import { UserRepository } from '@libs/database/repositories/user';

import { EntityName } from '@libs/shared/const/entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(userId: number) {
    return await this.userRepository.findById(userId);
  }

  async getUserList(query: GetUserListDto) {
    const { page } = query;

    return await this.userRepository.findAndCount({
      take: ADMIN_LIST_LIMIT,
      skip: (page - 1) * ADMIN_LIST_LIMIT,
      // relations: ['userAccounts'],
      relations: [EntityName.UserAccount],
    });
  }

  async updateUser(userSeq: number) {}

  async pauseUser(userSeq: number) {
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // user.status = UserStatusEnum.PAUSED;
    // await this.userRepository.save(user);
    //
    // return user;
  }

  async deleteUser(userSeq: number) {
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // user.status = UserStatusEnum.DELETE;
    // await this.userRepository.save(user);
    //
    // return user;
  }
}

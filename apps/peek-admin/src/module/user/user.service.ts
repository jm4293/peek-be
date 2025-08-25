import { Injectable } from '@nestjs/common';

import { LIST_LIMIT } from '@peek-admin/constant/list';
import { GetUserListDto } from '@peek-admin/type/dto';

import { UserRepository } from '@database/repositories/user';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(userId: number) {
    return await this.userRepository.findById(userId);
  }

  async getUserList(query: GetUserListDto) {
    const { page } = query;

    return await this.userRepository.findAndCount({
      take: LIST_LIMIT,
      skip: (page - 1) * LIST_LIMIT,
      relations: ['userAccounts'],
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

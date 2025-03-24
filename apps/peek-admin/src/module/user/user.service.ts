import { Injectable } from '@nestjs/common';

import { UserStatusEnum } from '@libs/constant/enum';

import { UserRepository } from '@libs/database/repositories';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // async getUsers(params: { pageParam: number }) {
  //   const { pageParam } = params;
  //
  //   const limit = 10;
  //   const offset = (pageParam - 1) * limit;
  //
  //   const [users, total] = await this.userRepository.findAndCount({ skip: offset, take: limit });
  //
  //   return { users, total };
  // }
  //
  // async getUser(userSeq: number) {
  //   return await this.userRepository.findUserByUserSeq(userSeq);
  // }
  //
  // async updateUser(userSeq: number) {}
  //
  // async pauseUser(userSeq: number) {
  //   const user = await this.userRepository.findUserByUserSeq(userSeq);
  //
  //   user.status = UserStatusEnum.PAUSED;
  //   await this.userRepository.save(user);
  //
  //   return user;
  // }
  //
  // async deleteUser(userSeq: number) {
  //   const user = await this.userRepository.findUserByUserSeq(userSeq);
  //
  //   user.status = UserStatusEnum.DELETE;
  //   await this.userRepository.save(user);
  //
  //   return user;
  // }
}

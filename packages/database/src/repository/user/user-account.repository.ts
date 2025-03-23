import { Injectable } from '@nestjs/common';
import { User, UserAccount } from '../../entities';
import { EntityManager, Repository } from 'typeorm';
import { UserAccountTypeEnum } from '../../constant/enum';
import { CreateUserEmailDto } from '../../type/dto';
import { ResConfig } from '../../config';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

  async createUserAccountByEmail(
    dto: Pick<CreateUserEmailDto, 'email' | 'password'> & { user: User; userAccountType: UserAccountTypeEnum },
  ) {
    const { user, userAccountType, email, password } = dto;

    const userAccount = this.create({ user, userAccountType, email, password });

    return await this.save(userAccount);
  }

  async createUserAccountByOauth(
    dto: Pick<CreateUserEmailDto, 'email'> & { user: User; userAccountType: UserAccountTypeEnum },
  ) {
    const { user, userAccountType, email } = dto;

    const userAccount = this.create({ user, userAccountType, email });

    return await this.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    const userAccount = await this.findOne({ where: { email }, relations: ['user'] });

    if (!userAccount) {
      throw ResConfig.Fail_400({ message: '사용자 계정이 존재하지 않습니다.' });
    }

    return userAccount;
  }
}

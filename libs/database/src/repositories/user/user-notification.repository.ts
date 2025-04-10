import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserNotification } from '@libs/database/entities';

@Injectable()
export class UserNotificationRepository extends Repository<UserNotification> {
  constructor(manager: EntityManager) {
    super(UserNotification, manager);
  }
}

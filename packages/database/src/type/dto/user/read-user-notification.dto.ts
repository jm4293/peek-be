import { IsNumber } from 'class-validator';

export class ReadUserNotificationDto {
  @IsNumber()
  userNotificationSeq: number;
}

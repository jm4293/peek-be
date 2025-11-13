// export enum UserNotificationTypeEnum {
//   BOARD_COMMENT = 1,
//   BOARD_COMMENT_REPLY = 2,
// }

export const UserNotificationType = {
  BOARD_COMMENT: 1,
  BOARD_COMMENT_REPLY: 2,
} as const;

export type UserNotificationTypeKey = keyof typeof UserNotificationType;
export type UserNotificationTypeValue = (typeof UserNotificationType)[keyof typeof UserNotificationType];

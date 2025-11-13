// export enum NoticeTypeEnum {
//   GENERAL = 1,
//   EMERGENCY = 2,
// }

export const NoticeType = {
  GENERAL: 1,
  EMERGENCY: 2,
} as const;

export type NoticeTypeKey = keyof typeof NoticeType;
export type NoticeTypeValue = (typeof NoticeType)[keyof typeof NoticeType];

export const BoardType = {
  GENERAL: 1,
  NOTICE: 2,
  EMERGENCY: 3,
} as const;

export type BoardTypeKey = keyof typeof BoardType;
export type BoardTypeValue = (typeof BoardType)[keyof typeof BoardType];

import { StockKindEnum } from '@libs/constant';

export interface IBaseBoard {
  marketType: StockKindEnum;
  title: string;
  content: string;
}

export interface IBaseBoardComment {
  content: string;
}

export interface IBaseBoardCommentReply {
  content: string;
}

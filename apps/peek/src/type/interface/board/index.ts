import { StockCategoryEnum } from '@libs/constant';

export interface IBaseBoard {
  category: StockCategoryEnum;
  title: string;
  content: string;
}

export interface IBaseBoardComment {
  content: string;
}

export interface IBaseBoardCommentReply {
  content: string;
}

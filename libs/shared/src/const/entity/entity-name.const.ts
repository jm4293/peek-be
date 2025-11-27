export const EntityName = {
  Board: 'board',
  BoardArticle: 'boardArticle',
  BoardComment: 'boardComment',
  BoardLike: 'boardLike',

  Currency: 'currency',

  Inquiry: 'inquiry',
  InquiryImage: 'inquiryImage',
  InquiryReply: 'inquiryReply',

  Notice: 'notice',
  NoticeImage: 'noticeImages',

  SecuritiesToken: 'securitiesToken',

  StockCategory: 'stockCategory',
  StockKoreanCompany: 'stockKoreanCompany',
  StockKoreanIndexHistory: 'stockKoreanIndexHistory',

  User: 'user',
  UserAccount: 'userAccount',
  UserNotification: 'userNotification',
  USerOAuthToken: 'userOAuthToken',
  UserPushToken: 'userPushToken',
  UserStockFavorite: 'userStockFavorite',
  UserVisit: 'userVisit',
} as const;

export const EntityRelation = {
  UserAccountUser: 'userAccount.user',
  BoardStockCategory: 'board.stockCategory',
  BoardUserAccount: 'board.userAccount',
  BoardCommentUserAccount: 'boardComment.userAccount',
  NoticeImageNotice: 'notice.noticeImages',
} as const;

import { Request } from 'express';

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';

import { Public } from '@peek/decorator/public';
import { ParseReqHandler } from '@peek/handler/parseReq';

import { Board, BoardComment } from '@libs/database/entities/board';

import { BoardService } from './board.service';
import {
  CreateBoardCommentDto,
  CreateBoardDto,
  DeleteBoardCommentDto,
  DeleteBoardDto,
  GetBoardCommentDto,
  GetBoardCommentListDto,
  GetBoardDto,
  GetBoardListDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from './dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 게시판
  @Get('mine')
  async getMyBoardList(@Query() query: GetBoardListDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const { boards, nextPage, total } = await this.boardService.getMyBoardList({ query, accountId });

    return {
      boardList: boards.map((item) => new Board(item)),
      total,
      nextPage,
    };
  }

  @Public()
  @Get()
  async getBoardList(@Query() query: GetBoardListDto) {
    const { boards, total, nextPage } = await this.boardService.getBoardList(query);

    return {
      boardList: boards.map((item) => new Board(item)),
      total,
      nextPage,
    };
  }

  @Public()
  @Get(':boardId')
  async getBoardDetail(@Param() param: GetBoardDto) {
    const { boardId } = param;

    const ret = await this.boardService.getBoardDetail(boardId);

    return {
      board: new Board(ret),
    };
  }

  @Post()
  async createBoard(@Body() dto: CreateBoardDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.createBoard({ dto, accountId });
  }

  @Put(':boardId')
  async updateBoard(@Param() param: GetBoardDto, @Body() dto: UpdateBoardDto, @Req() req: Request) {
    const { boardId } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.updateBoard({ boardId, dto, accountId });
  }

  @Delete(':boardId')
  async deleteBoard(@Param() param: DeleteBoardDto, @Req() req: Request) {
    const { boardId } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.deleteBoard({ boardId, accountId });
  }

  // 게시판 댓글
  @Get('mine/comment')
  async getMyBoardCommentList(@Query() query: GetBoardCommentListDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const { boardComments, nextPage, total } = await this.boardService.getMyBoardCommentList({ query, accountId });

    return {
      boardCommentList: boardComments.map((item) => new BoardComment(item)),
      total,
      nextPage,
    };
  }

  @Public()
  @Get(':boardId/comments')
  async getBoardCommentList(@Param() param: GetBoardDto, @Query() query: GetBoardCommentListDto, @Req() req: Request) {
    const { boardId } = param;

    const { boardComments, nextPage, total } = await this.boardService.getBoardCommentList({ boardId, query });

    return {
      boardCommentList: boardComments.map((item) => new BoardComment(item)),
      total,
      nextPage,
    };
  }

  @Post(':boardId/comment')
  async createBoardComment(@Param() param: GetBoardDto, @Body() dto: CreateBoardCommentDto, @Req() req: Request) {
    const { boardId } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.createBoardComment({ boardId, accountId, dto });
  }

  @Put(':boardId/comment/:boardCommentId')
  async updateBoardComment(
    @Param() boardParam: GetBoardDto,
    @Param() boardCommentParam: GetBoardCommentDto,
    @Body() dto: UpdateBoardCommentDto,
    @Req() req: Request,
  ) {
    const { boardId } = boardParam;
    const { boardCommentId } = boardCommentParam;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.updateBoardComment({ boardId, boardCommentId, accountId, dto });
  }

  @Delete(':boardId/comment/:boardCommentId')
  async deleteBoardComment(@Param() param: DeleteBoardCommentDto, @Req() req: Request) {
    const { boardId, boardCommentId } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.deleteBoardComment({ boardId, boardCommentId, accountId });
  }

  // 게시판 좋아요(찜)
  @Public()
  @Post(':boardSeq/like')
  async createBoardLike(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Req() req: Request) {
    // await this.boardService.boardLike({ boardSeq, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }
}

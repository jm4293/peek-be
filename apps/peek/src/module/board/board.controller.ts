import { Board, BoardCategory, BoardComment } from '@libs/database';
import { Request, Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import { Public } from '../../decorator';
import { ParseReqHandler } from '../../handler';
import {
  CreateBoardCommentDto,
  CreateBoardCommentReplyDto,
  CreateBoardDto,
  GetBoardCommentListDto,
  GetBoardDto,
  GetBoardListDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from '../../type/dto';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 게시판 카테고리
  @Public()
  @Get('category')
  async getBoardCategoryList() {
    const ret = await this.boardService.getBoardCategoryList();

    return ret.map((item) => new BoardCategory(item));
  }

  // 게시판
  @Public()
  @Get(':boardId')
  async getBoardDetail(@Param() param: GetBoardDto) {
    const { boardId } = param;

    const ret = await this.boardService.getBoardDetail(boardId);

    return new Board(ret);
  }

  @Public()
  @Get()
  async getBoardList(@Query() query: GetBoardListDto) {
    const { boards, total, nextPage } = await this.boardService.getBoardList({ query });

    return {
      boards: boards.map((item) => new Board(item)),
      total,
      nextPage,
    };
  }

  @Get('mine')
  async getMyBoardList(@Query('pageParam', ParseIntPipe) pageParam: number, @Req() req: Request) {
    // const ret = await this.boardService.getMyBoardList({ pageParam, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
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
  async deleteBoard(@Param() param: GetBoardDto, @Req() req: Request) {
    const { boardId } = param;

    await this.boardService.deleteBoard({ boardId, req });
  }

  // 게시판 댓글
  @Public()
  @Get(':boardId/comments')
  async getBoardCommentList(@Param() param: GetBoardDto, @Query() query: GetBoardCommentListDto, @Req() req: Request) {
    const { boardId } = param;

    const ret = await this.boardService.getBoardCommentList({ boardId, query });

    return {
      boardComments: ret.boardComments.map((item) => new BoardComment(item)),
      total: ret.total,
      nextPage: ret.nextPage,
    };
  }

  @Get('comment/mine')
  async getMyBoardCommentList(@Query('pageParam', ParseIntPipe) pageParam: number, @Req() req: Request) {
    // const ret = await this.boardService.getMyBoardCommentList({ pageParam, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post(':boardId/comment')
  async createBoardComment(@Param() param: GetBoardDto, @Body() dto: CreateBoardCommentDto, @Req() req: Request) {
    const { boardId } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.boardService.createBoardComment({ boardId, dto, accountId });
  }

  @Put(':boardSeq/comment/:boardCommentSeq')
  async updateBoardComment(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Body() dto: UpdateBoardCommentDto,
    @Req() req: Request,
  ) {
    // await this.boardService.updateBoardComment({ boardSeq, boardCommentSeq, dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete(':boardSeq/comment/:boardCommentSeq')
  async deleteBoardComment(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Req() req: Request,
  ) {
    // await this.boardService.deleteBoardComment({ boardSeq, boardCommentSeq, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
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

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

import { StockKindEnum } from '@libs/constant';

import { ResConfig } from '../../config';
import { Public } from '../../decorator';
import {
  CreateBoardCommentDto,
  CreateBoardCommentReplyDto,
  CreateBoardDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from '../../type/dto';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 게시판
  @Public()
  @Get()
  async getBoardList(
    @Query('pageParam', ParseIntPipe) pageParam: number,
    @Query('marketType', new ParseEnumPipe(StockKindEnum, { optional: true })) marketType: StockKindEnum,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ret = await this.boardService.getBoardList({ pageParam, marketType });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get('mine')
  async getMyBoardList(@Query('pageParam', ParseIntPipe) pageParam: number, @Req() req: Request, @Res() res: Response) {
    const ret = await this.boardService.getMyBoardList({ pageParam, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Get(':boardSeq')
  async getBoardDetail(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Req() req: Request, @Res() res: Response) {
    const ret = await this.boardService.getBoardDetail({ boardSeq, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post()
  async createBoard(@Body() dto: CreateBoardDto, @Req() req: Request, @Res() res: Response) {
    await this.boardService.createBoard({ dto, req });

    return ResConfig.Success({ res, statusCode: 'CREATED' });
  }

  @Put(':boardSeq')
  async updateBoard(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Body() dto: UpdateBoardDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.updateBoard({ boardSeq, dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete(':boardSeq')
  async deleteBoard(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Req() req: Request, @Res() res: Response) {
    await this.boardService.deleteBoard({ boardSeq, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  // 게시판 댓글
  @Public()
  @Get(':boardSeq/comments')
  async getBoardCommentList(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Query('pageParam', ParseIntPipe) pageParam: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ret = await this.boardService.getBoardCommentList({ boardSeq, pageParam, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get('comment/mine')
  async getMyBoardCommentList(
    @Query('pageParam', ParseIntPipe) pageParam: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ret = await this.boardService.getMyBoardCommentList({ pageParam, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post(':boardSeq/comment')
  async createBoardComment(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Body() dto: CreateBoardCommentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.createBoardComment({ boardSeq, dto, req });

    return ResConfig.Success({ res, statusCode: 'CREATED' });
  }

  @Put(':boardSeq/comment/:boardCommentSeq')
  async updateBoardComment(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Body() dto: UpdateBoardCommentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.updateBoardComment({ boardSeq, boardCommentSeq, dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete(':boardSeq/comment/:boardCommentSeq')
  async deleteBoardComment(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.deleteBoardComment({ boardSeq, boardCommentSeq, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  // 게시판 댓글 답장
  @Post(':boardCommentSeq/reply')
  async createBoardCommentReply(
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Body() dto: CreateBoardCommentReplyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.createBoardCommentReply({ boardCommentSeq, dto, req });

    return ResConfig.Success({ res, statusCode: 'CREATED' });
  }

  @Delete(':boardCommentSeq/reply/:boardCommentReplySeq')
  async deleteBoardCommentReply(
    @Param('boardCommentSeq', ParseIntPipe) boardCommentSeq: number,
    @Param('boardCommentReplySeq', ParseIntPipe) boardCommentReplySeq: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.deleteBoardCommentReply({ boardCommentSeq, boardCommentReplySeq, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  // 게시판 좋아요(찜)
  @Public()
  @Post(':boardSeq/like')
  async createBoardLike(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Req() req: Request, @Res() res: Response) {
    await this.boardService.boardLike({ boardSeq, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }
}

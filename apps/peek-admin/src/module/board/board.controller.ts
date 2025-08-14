import { Response } from 'express';

import { Controller, Delete, Get, Param, Query, Res } from '@nestjs/common';

import { ResConfig } from '@peek-admin/config/_res.config';
import { GetBoardDto, GetBoardListDto } from '@peek-admin/type/dto';

import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(':boardId')
  async getBoard(@Param() param: GetBoardDto, @Res() res: Response) {
    const { boardId } = param;

    const ret = await this.boardService.getBoard(boardId);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get()
  async getBoardList(@Query() query: GetBoardListDto, @Res() res: Response) {
    const [users, total] = await this.boardService.getBoardList(query);

    return ResConfig.Success({ res, statusCode: 'OK', data: { users, total } });
  }

  @Delete(':boardSeq')
  async deleteBoard(@Param() param: GetBoardDto, @Res() res: Response) {
    const { boardId } = param;

    await this.boardService.deleteBoard(boardId);

    return ResConfig.Success({ res, statusCode: 'OK' });
  }
}

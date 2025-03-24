import { Controller, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { BoardService } from './board.service';
import { Response } from 'express';
import { ResConfig } from '../../config';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // @Get()
  // async getBoards(@Query('pageParam', ParseIntPipe) pageParam: number, @Res() res: Response) {
  //   const ret = await this.boardService.getBoards({ pageParam });
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }
  //
  // @Get(':boardSeq')
  // async getBoard(@Query('boardSeq', ParseIntPipe) boardSeq: number, @Res() res: Response) {
  //   const ret = await this.boardService.getBoard(boardSeq);
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }
}

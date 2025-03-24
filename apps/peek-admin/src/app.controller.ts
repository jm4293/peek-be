import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ResConfig } from './config';

@Controller()
export class AppController {}

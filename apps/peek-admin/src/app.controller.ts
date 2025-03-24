import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';
import { ResConfig } from './config';

@Controller()
export class AppController {}

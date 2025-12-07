import { Controller, Get, Injectable, Res } from '@nestjs/common';
import { AppService } from './app.service';
import express from 'express';

@Controller()
@Injectable()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: express.Response): void {
    res.sendFile('index.html', { root: 'public' });
  }

  @Get('hello')
  hello() {
    return 'hello';
  }
}

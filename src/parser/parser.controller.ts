import { Controller, Get } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get('/parse-csv')
  fileName(){
    this.parserService.parseCsvFile();
  }

  @Get('/sort-json')
  sortJson(){
    this.parserService.sortJsonFile();
  }

  @Get('/process-messages')
  processMessages(){
    this.parserService.processMessages();
  }
}

import { Controller, Get, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from 'src/common/guards/cognito-access.guard';
import { SummaryService } from './summary.service';
import { ReqQuerySummaryCountsDto } from './summary.dto';
import { ResQuerySummaryCountsType } from '@repo/api-models/summary';
import { PrettyZodValidationPipe } from 'src/common/pipe/pretty-zod-validation.pipe';

@Controller('api/summary')
@UsePipes(PrettyZodValidationPipe)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  /** チームのタスク件数を取得 */
  @Get('counts')
  @UseGuards(CognitoAccessGuard)
  async getTasksCounter(@Req() req: Request, @Query() query: ReqQuerySummaryCountsDto): Promise<ResQuerySummaryCountsType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.summaryService.getCounts(userId, query);
  }
}

import { ReqQuerySummaryCountschema } from '@repo/api-models/summary';
import { createZodDto } from 'nestjs-zod';

/** [Requset-Query-DTO] チームのタスク件数を取得 */
export class ReqQuerySummaryCountsDto extends createZodDto(ReqQuerySummaryCountschema) {}

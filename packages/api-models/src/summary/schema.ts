import { z } from 'zod';
import { commonTeamId } from '../common/index.ts';

/**
 * [Requset-Query-Schema] チームのタスク件数を取得
 */
export const ReqQuerySummaryCountschema = z.object({ teamId: commonTeamId });

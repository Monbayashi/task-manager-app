import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResQuerySummaryCountsType } from '@repo/api-models/summary';

export const fetcherSummaryCounts = async (url: string): Promise<ResQuerySummaryCountsType> => {
  const result = await api.get<ResQuerySummaryCountsType>(url);
  return result.data;
};

/**
 * チームのタスク件数を取得
 */
export const useSummaryCounts = (teamId: string | null) => {
  return useSWR<ResQuerySummaryCountsType>(teamId ? `/api/summary/counts?teamId=${teamId}` : null, fetcherSummaryCounts);
};

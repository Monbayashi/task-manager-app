'use client';

import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResBodyInvitationsType } from '@repo/api-models/invitations';

export const fetcherTag = async (url: string): Promise<ResBodyInvitationsType> => {
  const result = await api.get<ResBodyInvitationsType>(url);
  return result.data;
};

/**
 * チーム招待一覧取得
 */
export const useInvitations = (teamId: string | null) => {
  return useSWR<ResBodyInvitationsType>(teamId ? `/api/teams/${teamId}/invitation` : null, fetcherTag);
};

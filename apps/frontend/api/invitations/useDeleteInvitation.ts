'use client';

import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ResBodyInvitationsDeleteType } from '@repo/api-models/invitations';

export const deleteInvitation = async (url: string): Promise<ResBodyInvitationsDeleteType> => {
  const response = await api.delete(url);
  return response.data;
};

/**
 * チーム招待削除API
 */
export const useDeleteInvitation = (teamId: string | null, inviteId: string | null) => {
  const url = teamId && inviteId ? `/api/teams/${teamId}/invitation/${inviteId}` : null;
  return useSWRMutation<ResBodyInvitationsDeleteType>(url, deleteInvitation);
};

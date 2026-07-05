import { apiClient } from './client';
import type { MembersResponse, TeamsResponse } from './types';

export async function fetchTeams(): Promise<TeamsResponse> {
  const { data } = await apiClient.get<TeamsResponse>('/api/teams');
  return data;
}

export async function fetchTeamMembers(team: string): Promise<MembersResponse> {
  const { data } = await apiClient.get<MembersResponse>(
    `/api/teams/${encodeURIComponent(team)}/members`,
  );
  return data;
}

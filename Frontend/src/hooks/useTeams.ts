import { useQuery } from '@tanstack/react-query';
import { fetchTeamMembers, fetchTeams } from '../api/teams';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamMembers(team: string | null) {
  return useQuery({
    queryKey: ['team-members', team],
    queryFn: () => fetchTeamMembers(team as string),
    enabled: Boolean(team),
    staleTime: 5 * 60 * 1000,
  });
}

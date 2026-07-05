import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { useTeams } from '../hooks/useTeams';

interface TeamSelectProps {
  value: string;
  onChange: (team: string) => void;
}

export default function TeamSelect({ value, onChange }: TeamSelectProps) {
  const { data, isLoading, isError } = useTeams();
  const teams = data?.teams ?? [];

  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value);

  return (
    <FormControl fullWidth size="small" disabled={isLoading || isError}>
      <InputLabel id="team-select-label">Team</InputLabel>
      <Select
        labelId="team-select-label"
        label="Team"
        value={value}
        onChange={handleChange}
      >
        {teams.map((team) => (
          <MenuItem key={team.name} value={team.name}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { useTeamMembers } from '../hooks/useTeams';

interface MemberSelectProps {
  team: string | null;
  value: string;
  onChange: (member: string) => void;
}

export default function MemberSelect({ team, value, onChange }: MemberSelectProps) {
  const { data, isLoading } = useTeamMembers(team);
  const members = data?.members ?? [];

  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value);

  return (
    <FormControl fullWidth size="small" disabled={!team || isLoading}>
      <InputLabel id="member-select-label">Team member</InputLabel>
      <Select
        labelId="member-select-label"
        label="Team member"
        value={value}
        onChange={handleChange}
      >
        {members.map((member) => (
          <MenuItem key={member} value={member}>
            {member}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

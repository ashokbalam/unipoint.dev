import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { teamBox, teamCard, teamTitle } from './TeamSelectionPage.styles';

interface Tenant {
  id: string;
  name: string;
}

export default function TeamSelectionPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4000/tenants').then(res => setTenants(res.data));
  }, []);

  const handleSelect = (id: string) => {
    setSelectedTenant(id);
    navigate(`/questionnaire/${id}`);
  };

  return (
    <Box sx={teamBox}>
      <Card sx={teamCard}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={teamTitle}>
            Pick your squad!
          </Typography>
          <Autocomplete
            fullWidth
            options={tenants}
            getOptionLabel={(option: Tenant) => option.name || ''}
            value={tenants.find((t) => t.id === selectedTenant) || null}
            onChange={(_event: React.SyntheticEvent, newValue: Tenant | null) => {
              if (newValue) handleSelect(newValue.id);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team"
                variant="outlined"
                sx={{
                  color: 'secondary.main',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'secondary.main',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'secondary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'secondary.main',
                  },
                }}
              />
            )}
            isOptionEqualToValue={(option: Tenant, value: Tenant) => option.id === value.id}
          />
        </CardContent>
      </Card>
    </Box>
  );
} 
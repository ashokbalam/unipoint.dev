import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TeamSelectionPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4000/tenants').then(res => setTenants(res.data));
  }, []);

  const handleSelect = (id: string) => {
    setSelectedTenant(id);
    navigate(`/questionnaire/${id}`);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 12 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Select Team
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="tenant-select-label" sx={{ color: 'secondary.main', '&.Mui-focused': { color: 'secondary.main' } }}>Team</InputLabel>
            <Select
              labelId="tenant-select-label"
              value={selectedTenant}
              label="Team"
              onChange={e => handleSelect(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'secondary.main',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'secondary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'secondary.main',
                },
                color: 'secondary.main',
              }}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
} 
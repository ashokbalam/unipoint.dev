import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Card, CardContent } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { actionButtonStyle } from '../styles';
import { onboardBox, onboardCard, onboardTitle } from './OnboardTenant.styles';

const TenantSchema = Yup.object().shape({
  name: Yup.string().required('Team name is required'),
});

interface OnboardTenantProps {
  godMode: boolean;
}

export default function OnboardTenant({ godMode }: OnboardTenantProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!godMode) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Alert severity="warning">God Mode required to onboard a new team.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={onboardBox}>
      <Typography variant="h4" gutterBottom sx={onboardTitle}>
        Onboard New Team
      </Typography>
      
      <Card sx={onboardCard}>
        <CardContent>
          <Formik
            initialValues={{ name: '' }}
            validationSchema={TenantSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setSuccess(null);
              setError(null);
              try {
                const res = await axios.post('http://localhost:4000/tenants', values);
                setSuccess(`Team created: ${res.data.name}`);
                resetForm();
              } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to create team');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Team Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={actionButtonStyle}
                >
                  Onboard
                </Button>
                {success && <Alert severity="success" icon={false} sx={{ mt: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
} 
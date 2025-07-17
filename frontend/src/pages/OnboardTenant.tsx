import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Card, CardContent } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

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
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Onboard New Team
      </Typography>
      
      <Card sx={{ p: 4 }}>
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
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ mt: 3 }}
                >
                  Onboard
                </Button>
                {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
} 
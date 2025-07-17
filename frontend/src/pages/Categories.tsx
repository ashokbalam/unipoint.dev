import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Alert, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Paper } from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const CategorySchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
  rubric: Yup.array()
    .of(
      Yup.object().shape({
        min: Yup.number().required('Min is required'),
        max: Yup.number().required('Max is required'),
        storyPoints: Yup.number().required('Story Points are required'),
        note: Yup.string().optional(),
      })
    )
    .min(1, 'At least one rubric range is required')
    .test('no-overlap', 'Rubric ranges must not overlap and must have unique story points.', (rubric) => {
      if (!rubric || rubric.length < 1) return true;
      // Check for overlap and unique storyPoints
      for (let i = 0; i < rubric.length; i++) {
        for (let j = i + 1; j < rubric.length; j++) {
          // Overlap: (minA <= maxB && maxA >= minB)
          if (
            rubric[i].min <= rubric[j].max &&
            rubric[i].max >= rubric[j].min
          ) {
            return false;
          }
          // Unique storyPoints
          if (rubric[i].storyPoints === rubric[j].storyPoints) {
            return false;
          }
        }
      }
      return true;
    }),
});

interface CategoriesProps {
  godMode: boolean;
}

export default function Categories({ godMode }: CategoriesProps) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:4000/tenants').then(res => setTenants(res.data));
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      axios.get(`http://localhost:4000/categories?tenantId=${selectedTenant}`)
        .then(res => setCategories(res.data));
    } else {
      setCategories([]);
    }
  }, [selectedTenant]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Categories
      </Typography>
      
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="tenant-select-label">Select Team</InputLabel>
            <Select
              labelId="tenant-select-label"
              value={selectedTenant}
              label="Select Team"
              onChange={e => setSelectedTenant(e.target.value)}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedTenant && (
        <>
          {godMode ? (
            <Card sx={{ mb:4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Create New Category
                </Typography>
                <Formik
                  initialValues={{ name: '', rubric: [
                    { min: 0, max: 0, storyPoints: 0, note: '' },
                  ] }}
                  validationSchema={CategorySchema}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    setSuccess(null);
                    setError(null);
                    try {
                      const res = await axios.post('http://localhost:4000/categories', { ...values, tenantId: selectedTenant });
                      setSuccess(`Category created: ${res.data.name}`);
                      setCategories((prev) => [...prev, res.data]);
                      resetForm();
                    } catch (err: any) {
                      if (err.response?.status === 400 && err.response?.data?.error) {
                        setError(err.response.data.error);
                      } else {
                        setError(err.response?.data?.error || 'Failed to create category');
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, errors, touched, values }) => (
                    <Form>
                      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                      <Field
                        as={TextField}
                        name="name"
                        label="Category Name"
                        fullWidth
                        margin="normal"
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                      <FieldArray name="rubric">
                        {({ push, remove }) => (
                          <>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                              Scoring Rubric
                            </Typography>
                            {values.rubric.map((_: any, idx: number) => (
                              <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                  <Field
                                    as={TextField}
                                    name={`rubric[${idx}].min`}
                                    label="Min"
                                    type="number"
                                    sx={{ width: 90 }}
                                    margin="normal"
                                    error={Boolean((touched.rubric as any)?.[idx]?.min && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).min))}
                                    helperText={(touched.rubric as any)?.[idx]?.min && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).min}
                                  />
                                  <Field
                                    as={TextField}
                                    name={`rubric[${idx}].max`}
                                    label="Max"
                                    type="number"
                                    sx={{ width: 90 }}
                                    margin="normal"
                                    error={Boolean((touched.rubric as any)?.[idx]?.max && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).max))}
                                    helperText={(touched.rubric as any)?.[idx]?.max && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).max}
                                  />
                                  <Field
                                    as={TextField}
                                    name={`rubric[${idx}].storyPoints`}
                                    label="Story Points"
                                    type="number"
                                    sx={{ width: 120 }}
                                    margin="normal"
                                    error={Boolean((touched.rubric as any)?.[idx]?.storyPoints && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).storyPoints))}
                                    helperText={(touched.rubric as any)?.[idx]?.storyPoints && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).storyPoints}
                                  />
                                  <Field
                                    as={TextField}
                                    name={`rubric[${idx}].note`}
                                    label="Note"
                                    sx={{ width: 180 }}
                                    margin="normal"
                                    error={Boolean((touched.rubric as any)?.[idx]?.note && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).note))}
                                    helperText={(touched.rubric as any)?.[idx]?.note && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).note}
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => remove(idx)}
                                    disabled={values.rubric.length <= 1}
                                    sx={{ minWidth: 40 }}
                                  >-</Button>
                                </Box>
                              </Paper>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => push({ min: 0, max: 0, storyPoints: 0, note: '' })}
                              sx={{ mt: 1 }}
                            >Add Range</Button>
                          </>
                        )}
                      </FieldArray>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{ mt: 3 }}
                      >
                        Add Category
                      </Button>
                      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning" sx={{ mb: 4 }}>God Mode required to create or edit categories.</Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Existing Categories for this Team
              </Typography>
              <List>
                {categories.map((cat) => (
                  <ListItem key={cat.id} sx={{ 
                    mb: 1, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }} secondaryAction={
                    <Button variant="outlined" size="small" onClick={() => { setEditCategory(cat); setEditError(null); }}>Edit</Button>
                  }>
                    <ListItemText primary={cat.name} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Edit Category Dialog */}
          <Dialog open={!!editCategory} onClose={() => setEditCategory(null)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
              {editCategory && (
                <Formik
                  initialValues={{ name: editCategory.name, rubric: editCategory.rubric || [{ min: 0, max: 0, storyPoints: 0, note: '' }] }}
                  validationSchema={CategorySchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setEditError(null);
                    try {
                      const res = await axios.patch(`http://localhost:4000/categories/${editCategory.id}`, values);
                      setCategories((prev) => prev.map((c) => c.id === editCategory.id ? res.data : c));
                      setEditCategory(null);
                    } catch (err: any) {
                      if (err.response?.status === 400 && err.response?.data?.error) {
                        setEditError(err.response.data.error);
                      } else {
                        setEditError(err.response?.data?.error || 'Failed to update category');
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, errors, touched, values }) => (
                    <Form>
                      {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
                      <Field
                        as={TextField}
                        name="name"
                        label="Category Name"
                        fullWidth
                        margin="normal"
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                      <FieldArray name="rubric">
                        {({ push, remove }) => (
                          <>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Scoring Rubric</Typography>
                            {values.rubric.map((_: any, idx: number) => (
                              <Box key={idx} display="flex" gap={2} alignItems="center" mb={2}>
                                <Field
                                  as={TextField}
                                  name={`rubric[${idx}].min`}
                                  label="Min"
                                  type="number"
                                  sx={{ width: 90 }}
                                  margin="normal"
                                  error={Boolean((touched.rubric as any)?.[idx]?.min && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).min))}
                                  helperText={(touched.rubric as any)?.[idx]?.min && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).min}
                                />
                                <Field
                                  as={TextField}
                                  name={`rubric[${idx}].max`}
                                  label="Max"
                                  type="number"
                                  sx={{ width: 90 }}
                                  margin="normal"
                                  error={Boolean((touched.rubric as any)?.[idx]?.max && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).max))}
                                  helperText={(touched.rubric as any)?.[idx]?.max && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).max}
                                />
                                <Field
                                  as={TextField}
                                  name={`rubric[${idx}].storyPoints`}
                                  label="Story Points"
                                  type="number"
                                  sx={{ width: 120 }}
                                  margin="normal"
                                  error={Boolean((touched.rubric as any)?.[idx]?.storyPoints && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).storyPoints))}
                                  helperText={(touched.rubric as any)?.[idx]?.storyPoints && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).storyPoints}
                                />
                                <Field
                                  as={TextField}
                                  name={`rubric[${idx}].note`}
                                  label="Note"
                                  sx={{ width: 180 }}
                                  margin="normal"
                                  error={Boolean((touched.rubric as any)?.[idx]?.note && (errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).note))}
                                  helperText={(touched.rubric as any)?.[idx]?.note && errors.rubric && Array.isArray(errors.rubric) && errors.rubric[idx] && (errors.rubric[idx] as any).note}
                                />
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => remove(idx)}
                                  disabled={values.rubric.length <= 1}
                                  sx={{ minWidth: 40, height: 40 }}
                                >-</Button>
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => push({ min: 0, max: 0, storyPoints: 0, note: '' })}
                              sx={{ mt: 1 }}
                            >Add Range</Button>
                          </>
                        )}
                      </FieldArray>
                      <DialogActions>
                        <Button onClick={() => setEditCategory(null)} color="secondary">Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Save</Button>
                      </DialogActions>
                    </Form>
                  )}
                </Formik>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
} 
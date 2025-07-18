import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Alert, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Paper } from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { cardStyle, actionButtonStyle, smallButtonStyle } from '../styles';
import { listItem } from './Questions.styles';

const QuestionSchema = Yup.object().shape({
  text: Yup.string().required('Question text is required'),
  options: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required('Option label is required'),
        points: Yup.number().required('Points are required'),
      })
    )
    .min(2, 'At least 2 options are required'),
});

interface QuestionsProps {
  godMode: boolean;
}

export default function Questions({ godMode }: QuestionsProps) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
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
    setSelectedCategory('');
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedCategory) {
      axios.get(`http://localhost:4000/questions?categoryId=${selectedCategory}`)
        .then(res => setQuestions(res.data));
    } else {
      setQuestions([]);
    }
  }, [selectedCategory]);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Questions
      </Typography>
      
      <Card sx={cardStyle}>
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
        <Card sx={cardStyle}>
          <CardContent>
            <FormControl fullWidth margin="normal">            <InputLabel id="category-select-label">Select Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                label="Select Category"
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {selectedCategory && (
        <>
          {godMode ? (
            <Card sx={{ mb:4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Create New Question
                </Typography>
                <Formik
                  initialValues={{ text: '', options: [
                    { label: '', points: 0 },
                    { label: '', points: 0 },
                  ] }}
                  validationSchema={QuestionSchema}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    setSuccess(null);
                    setError(null);
                    try {
                      const res = await axios.post('http://localhost:4000/questions', { ...values, categoryId: selectedCategory });
                      setSuccess(`Question created: ${res.data.text}`);
                      setQuestions((prev) => [...prev, res.data]);
                      resetForm();
                    } catch (err: any) {
                      setError(err.response?.data?.error || 'Failed to create question');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, errors, touched, values }) => (
                    <Form>
                      <Field
                        as={TextField}
                        name="text"
                        label="Question Text"
                        fullWidth
                        margin="normal"
                        error={touched.text && !!errors.text}
                        helperText={touched.text && errors.text}
                      />
                      <FieldArray name="options">
                        {({ push, remove }) => (
                          <>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                              Options
                            </Typography>
                            {values.options.map((_: any, idx: number) => (
                              <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                  <Field
                                    as={TextField}
                                    name={`options[${idx}].label`}
                                    label={`Option ${idx + 1} Label`}
                                    fullWidth
                                    margin="normal"
                                    error={Boolean((touched.options as any)?.[idx]?.label && (errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).label))}
                                    helperText={(touched.options as any)?.[idx]?.label && errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).label}
                                  />
                                  <Field
                                    as={TextField}
                                    name={`options[${idx}].points`}
                                    label="Points"
                                    type="number"
                                    sx={{ width: 120 }}
                                    margin="normal"
                                    error={Boolean((touched.options as any)?.[idx]?.points && (errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).points))}
                                    helperText={(touched.options as any)?.[idx]?.points && errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).points}
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => remove(idx)}
                                    disabled={values.options.length <= 2}
                                    sx={smallButtonStyle}
                                  >-</Button>
                                </Box>
                              </Paper>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => push({ label: '', points: 0 })}
                              sx={{ mt: 1 }}
                            >Add Option</Button>
                          </>
                        )}
                      </FieldArray>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        disabled={isSubmitting}
                        sx={actionButtonStyle}
                      >
                        Add Question
                      </Button>
                      {success && <Alert severity="success" icon={false} sx={{ mt: 2 }}>{success}</Alert>}
                      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning" sx={{ mb: 4 }}>God Mode required to create or edit questions.</Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Questions for this Category
              </Typography>
              <List>
                {questions.map((q) => (
                  <ListItem key={q.id} sx={listItem} alignItems="flex-start" secondaryAction={
                    <Button variant="contained" size="small" color="secondary" onClick={() => { setEditQuestion(q); setEditError(null); }}>Edit</Button>
                  }>
                    <ListItemText
                      primary={q.text}
                      secondary={q.options.map((opt: any, _: any) => `${opt.label} (${opt.points})`).join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Edit Question Dialog */}
          <Dialog open={!!editQuestion} onClose={() => setEditQuestion(null)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogContent>
              {editQuestion && (
                <Formik
                  initialValues={{ text: editQuestion.text, options: editQuestion.options || [{ label: '', points: 0 }, { label: '', points: 0 }] }}
                  validationSchema={QuestionSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setEditError(null);
                    try {
                      const res = await axios.patch(`http://localhost:4000/questions/${editQuestion.id}`, values);
                      setQuestions((prev) => prev.map((q) => q.id === editQuestion.id ? res.data : q));
                      setEditQuestion(null);
                    } catch (err: any) {
                      setEditError(err.response?.data?.error || 'Failed to update question');
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
                        name="text"
                        label="Question Text"
                        fullWidth
                        margin="normal"
                        error={touched.text && !!errors.text}
                        helperText={touched.text && errors.text}
                      />
                      <FieldArray name="options">
                        {({ push, remove }) => (
                          <>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Options:</Typography>
                            {values.options.map((_: any, idx: number) => (
                              <Box key={idx} display="flex" gap={2} alignItems="center" mb={2}>
                                <Field
                                  as={TextField}
                                  name={`options[${idx}].label`}
                                  label={`Option ${idx + 1} Label`}
                                  fullWidth
                                  margin="normal"
                                  error={Boolean((touched.options as any)?.[idx]?.label && (errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).label))}
                                  helperText={(touched.options as any)?.[idx]?.label && errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).label}
                                />
                                <Field
                                  as={TextField}
                                  name={`options[${idx}].points`}
                                  label="Points"
                                  type="number"
                                  sx={{ width: 120 }}
                                  margin="normal"
                                  error={Boolean((touched.options as any)?.[idx]?.points && (errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).points))}
                                  helperText={(touched.options as any)?.[idx]?.points && errors.options && Array.isArray(errors.options) && errors.options[idx] && (errors.options[idx] as any).points}
                                />
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => remove(idx)}
                                  disabled={values.options.length <= 2}
                                  sx={smallButtonStyle}
                                >-</Button>
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => push({ label: '', points: 0 })}
                              sx={{ mt: 1 }}
                            >Add Option</Button>
                          </>
                        )}
                      </FieldArray>
                      <DialogActions>
                        <Button onClick={() => setEditQuestion(null)} color="secondary" variant="contained">Cancel</Button>
                        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting}>Save</Button>
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
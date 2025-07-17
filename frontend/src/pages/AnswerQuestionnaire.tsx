import { useEffect, useState } from 'react';
import { Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio, Alert, Paper, Card, CardContent, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Formik, Form } from 'formik';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function AnswerQuestionnaire() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryRubric, setCategoryRubric] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [result, setResult] = useState<{ total: number; storyPoints: number | string } | null>(null);

  useEffect(() => {
    if (teamId) {
      axios.get(`http://localhost:4000/categories?tenantId=${teamId}`)
        .then(res => setCategories(res.data));
    } else {
      setCategories([]);
    }
    setSelectedCategory('');
    setQuestions([]);
    setCategoryRubric([]);
  }, [teamId]);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c: any) => c.id === selectedCategory);
      setCategoryRubric(cat?.rubric || []);
      axios.get(`http://localhost:4000/questions?categoryId=${selectedCategory}`)
        .then(res => setQuestions(res.data));
    } else {
      setQuestions([]);
      setCategoryRubric([]);
    }
  }, [selectedCategory, categories]);

  function getStoryPoints(total: number) {
    const found = categoryRubric.find(r => total >= r.min && total <= r.max);
    return found ? found.storyPoints : '?';
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Select Category & Answer Questions</Typography>
      </Box>
      <Card sx={{ mb: 2, p: 3 }}>
        <CardContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label" sx={{ color: 'secondary.main', '&.Mui-focused': { color: 'secondary.main' } }}>Select Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="Select Category"
              onChange={e => {
                setSelectedCategory(e.target.value);
                setResult(null);
              }}
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
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
      {selectedCategory && questions.length > 0 && (
        <Card sx={{ mb:2}}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Answer Questions
            </Typography>
            <Formik
              initialValues={{ answers: Array(questions.length).fill('') }}
              enableReinitialize
              onSubmit={(values, { setSubmitting }) => {
                const total = questions.reduce((sum, q, idx) => {
                  const selected = q.options.find((opt: any) => opt.label === values.answers[idx]);
                  return sum + (selected ? Number(selected.points) : 0);
                }, 0);
                setResult({ total, storyPoints: getStoryPoints(total) });
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <Box sx={{ mb: 3 }}>
                    {questions.map((q: any, idx: number) => (
                      <Paper key={q.id} sx={{ p: 1, mb: 1, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                          {q.text}
                        </Typography>
                        <RadioGroup
                          value={values.answers[idx]}
                          onChange={e => setFieldValue(`answers[${idx}]`, e.target.value)}
                        >
                          {q.options.map((opt: any, i: number) => (
                            <FormControlLabel
                              key={i}
                              value={opt.label}
                              control={<Radio color="secondary" />}
                              label={`${opt.label} (${opt.points})`}
                              sx={{ 
                                mb: 0.5,
                                p: 1,
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'rgba(99, 102, 241, 0.1)'
                                }
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </Paper>
                    ))}
                  </Box>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="secondary" 
                    fullWidth 
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                  >
                    Submit
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}
      {selectedCategory && questions.length === 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Alert severity="info" sx={{ mt:3}}>No questions found for this category.</Alert>
          </CardContent>
        </Card>
      )}
      {result && (
        <Card sx={{ mt:2}}>
          <CardContent>
            <Alert severity="success" sx={{ fontSize: 18 }}>
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
                <strong>Total Score:</strong> {result.total}
                <strong>Story Points:</strong> {result.storyPoints}
              </Box>
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 
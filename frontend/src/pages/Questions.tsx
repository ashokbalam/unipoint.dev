import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  questionsPageWrapper,
  backButton,
  backButtonHover,
  pageContainer,
  heading,
  loadingText,
  form,
  questionBlock,
  questionText,
  optionLabel,
  radioInput,
  submitButton,
  submitButtonDisabled,
  addForm,
  addLabel,
  addInput,
  addInputFocus,
  addError,
  addSuccess,
  addButton,
  addButtonHover,
  questionsScrollArea,
  thankYou,
  storyPoints,
  boldText
} from './Questions.styles';

interface Option {
  id: string;
  label: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Answer {
  [questionId: string]: number;
}

interface RubricRange {
  min: number;
  max: number;
  storyPoints: number;
}

interface QuestionsProps {
  tenantId: string;
  categoryId: string;
  godMode: boolean;
}

const Questions: React.FC<QuestionsProps> = ({ tenantId, categoryId, godMode }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rubric, setRubric] = useState<RubricRange[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [answers, setAnswers] = useState<Answer>({});
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [storyPoint, setStoryPoint] = useState<number | string | null>(null);

  useEffect(() => {
    if (!tenantId || !categoryId) {
      setError('Missing tenant or category ID.');
      return;
    }

    axios.get(`http://localhost:4000/questions?categoryId=${categoryId}`)
      .then(res => {
        setQuestions(res.data);
      })
      .catch(err => {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions.');
      });

    // You might also want to fetch the rubric here if needed
    axios.get(`http://localhost:4000/categories/${categoryId}`)
      .then(res => setRubric(res.data.rubric || []));

  }, [tenantId, categoryId]);

  const handleOptionChange = (questionId: string, points: number) => {
    setAnswers({ ...answers, [questionId]: points });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newQuestion.trim()) {
      setError('Question cannot be empty.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:4000/questions', {
        text: newQuestion.trim(),
        options: [
          { label: 'Option 1', points: 1 },
          { label: 'Option 2', points: 2 },
          { label: 'Option 3', points: 3 }
        ],
        tenantId,
        categoryId,
      });
      setQuestions([...questions, res.data]);
      setSuccess('Question added!');
      setNewQuestion('');
    } catch {
      setError('Failed to add question.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Object.values(answers).reduce((sum, points) => sum + points, 0);
    setTotalScore(total);

    console.log('--- Debugging Story Point Calculation ---');
    console.log('Calculated Total Score:', total);
    console.log('Rubric available for calculation:', rubric);

    let sp: number | string = '?';
    if (rubric && rubric.length > 0) {
      const found = rubric.find(r => total >= r.min && total <= r.max);
      console.log('Found matching rubric range:', found);
      if (found) {
        sp = found.storyPoints;
      }
    }
    setStoryPoint(sp);
    setSubmitted(true);
  };

  const isFormValid = () => {
    return questions.length > 0 && Object.keys(answers).length === questions.length;
  };

  const allAnswered = isFormValid();
  // const totalPoints = Object.values(answers).reduce((sum, points) => sum + points, 0);

  return (
    <div style={questionsPageWrapper}>
      <button
        onClick={() => navigate(-1)}
        style={backBtnHover ? { ...backButton, ...backButtonHover } : backButton}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
      >
        &larr; Back to Categories
      </button>
      <div style={pageContainer}>
        <h1 style={heading}>Questionnaire</h1>

        {godMode && (
          <form onSubmit={handleAddQuestion} style={addForm}>
            <label style={addLabel}>Add a New Question</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  style={newQuestion.trim() ? addInput : addInputFocus}
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Question text"
                />
                {error && <div style={addError}>{error}</div>}
                {success && <div style={addSuccess}>{success}</div>}
              </div>
              <button
                type="submit"
                style={addBtnHover ? { ...addButton, ...addButtonHover } : addButton}
                onMouseEnter={() => setAddBtnHover(true)}
                onMouseLeave={() => setAddBtnHover(false)}
              >
                Add
              </button>
            </div>
          </form>
        )}

        {submitted ? (
          <div style={thankYou}>
            <div>Thank you for submitting your answers!</div>
            <div style={storyPoints}>Total Score: <span style={boldText}>{totalScore}</span></div>
            <div style={storyPoints}>Story Points: <span style={boldText}>{storyPoint}</span></div>
          </div>
        ) : questions.length > 0 ? (
          <form onSubmit={handleSubmit} style={form}>
            <div style={questionsScrollArea}>
              {questions.map((q, i) => (
                <div key={q.id} style={questionBlock}>
                  <p style={questionText}>{i + 1}. {q.text}</p>
                  {q.options.map(opt => (
                    <label key={opt.id} style={optionLabel}>
                      <input
                        type="radio"
                        name={q.id}
                        style={radioInput}
                        onChange={() => handleOptionChange(q.id, opt.points)}
                      />
                      {opt.label} ({opt.points} pts)
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <button
              type="submit"
              style={!allAnswered ? submitButtonDisabled : submitButton}
              disabled={!allAnswered}
            >
              Submit Answers
            </button>
          </form>
        ) : (
          <p style={loadingText}>Loading questions...</p>
        )}
      </div>
    </div>
  );
};

export default Questions; 
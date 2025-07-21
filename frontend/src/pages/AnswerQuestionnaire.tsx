import React, { useState } from 'react';
import {
  container,
  title,
  thankYou,
  form as formStyle,
  label as labelStyle,
  input as inputStyle,
  inputFocus,
  submitButton,
  submitButtonHover
} from './AnswerQuestionnaire.styles';

const mockQuestions = [
  { id: 1, text: 'What is your team’s main goal?' },
  { id: 2, text: 'How do you measure success?' },
  { id: 3, text: 'What challenges are you facing?' },
];

const AnswerQuestionnaire: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  const [inputFocusId, setInputFocusId] = useState<number | null>(null);

  const handleChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call or further processing
  };

  return (
    <div style={container}>
      <h2 style={title}>Team Questionnaire</h2>
      {submitted ? (
        <div style={thankYou}>Thank you for submitting your answers!</div>
      ) : (
        <form onSubmit={handleSubmit} style={formStyle}>
          {mockQuestions.map((q) => (
            <div key={q.id}>
              <label style={labelStyle}>{q.text}</label>
              <input
                type="text"
                style={inputFocusId === q.id ? { ...inputStyle, ...inputFocus } : inputStyle}
                value={answers[q.id] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
                onFocus={() => setInputFocusId(q.id)}
                onBlur={() => setInputFocusId(null)}
                placeholder="Your answer"
              />
            </div>
          ))}
          <button
            type="submit"
            style={submitBtnHover ? { ...submitButton, ...submitButtonHover } : submitButton}
            onMouseEnter={() => setSubmitBtnHover(true)}
            onMouseLeave={() => setSubmitBtnHover(false)}
          >
            Submit Answers
          </button>
        </form>
      )}
    </div>
  );
};

export default AnswerQuestionnaire; 
import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';

const router = Router();

router.post('/questions', QuestionController.createQuestion);
router.get('/questions', QuestionController.getQuestions);
router.patch('/questions/:id', QuestionController.updateQuestion);

export default router; 
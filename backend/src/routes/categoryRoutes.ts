import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();

router.post('/categories', CategoryController.createCategory);
router.get('/categories', CategoryController.getCategories);
router.patch('/categories/:id', CategoryController.updateCategory);

export default router; 
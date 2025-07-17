import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';

const router = Router();

router.post('/tenants', TenantController.createTenant);
router.get('/tenants', TenantController.getTenants);

export default router; 
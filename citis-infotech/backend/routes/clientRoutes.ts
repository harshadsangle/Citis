import { Router } from 'express';
import { body, param } from 'express-validator';
import * as items from '../controllers/clientController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = [protect, authorize('super_admin', 'admin', 'content_editor')];
router.get('/', items.getClients);
router.get('/:id', param('id').isMongoId(), validate, items.getClient);
router.post('/', editors, [body('name').trim().notEmpty(), body('logo').isURL(), body('website').optional().isURL()], validate, items.createClient);
router.patch('/:id', editors, param('id').isMongoId(), validate, items.updateClient);
router.delete('/:id', editors, param('id').isMongoId(), validate, items.deleteClient);
export default router;

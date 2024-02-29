import { Router } from 'express';
import { authentication } from '../../middleware/index.js';
import SseController from '../../controller/sse/sse.controller.js';

const router: Router = Router();
const sseController = new SseController();

router.get('/events', authentication, sseController.onEvent);

router.post('/response/v1/on_issue', sseController.onIssue);
router.post('/response/v1/on_issue_status', sseController.onStatus);

export default router;

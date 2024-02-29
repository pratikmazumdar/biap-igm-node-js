import { Router } from 'express';
import { authentication } from '../../middleware/index.js';
import IssueStatusController from '../../controller/issue_status/issue_status.controller.js';

const router: Router = Router();

const issueStatusController = new IssueStatusController();

router.use(authentication);
router.post('/v1/issue_status', issueStatusController.issueStatus);
router.get('/v1/on_issue_status', issueStatusController.onIssue_status);

export default router;

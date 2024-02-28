import express from "express";
import { authentication } from "../../middleware";
import IssueStatusController from "../../controller/issue_status/issue_status.controller";

const router: express.Router = express.Router();

const issueStatusController = new IssueStatusController();

router.use(authentication);
router.post("/v1/issue_status", issueStatusController.issueStatus);
router.get("/v1/on_issue_status", issueStatusController.onIssue_status);

export default router;

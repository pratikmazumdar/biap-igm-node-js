import express from "express";
import { authentication } from "../../middleware";
import IssueStatusController from "../../controller/issue_status/issue_status.controller";

const router = express.Router();

const issueStatusController = new IssueStatusController();

router.post(
  "/v1/issue_status",
  authentication(),
  issueStatusController.issueStatus
);
router.get(
  "/v1/on_issue_status",
  authentication(),
  issueStatusController.onIssue_status
);

export default router;

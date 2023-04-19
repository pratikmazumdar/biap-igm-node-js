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

export default router;

import express from "express";
import { authentication } from "../../middleware";
import IssueController from "../../controller/issue/issue.controller";

const router = express.Router();

const issueController = new IssueController();
router.post("/v1/issue", authentication(), issueController.createIssue);

export default router;

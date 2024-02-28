import express from 'express';
// import { authentication } from "../../middleware";
import IssueController from '../../controller/issue/issue.controller';
import { UserDetails } from '../../interfaces/issue';
import wrap from '../../shared/async-handler';

const router: express.Router = express.Router();

const issueController = new IssueController();

// router.use(authentication);

const dummmyUser = (req: any, _res: any, next: any) => {
  const userDetails: UserDetails = {
    token: 'test',
    decodedToken: {
      uid: 'hello',
      name: '',
      picture: '',
      iss: '',
      aud: '',
      auth_time: 0,
      user_id: '',
      sub: '',
      iat: 0,
      exp: 0,
      email: '',
      email_verified: false,
      firebase: {
        identities: {
          'google.com': ['test'],
          email: ['this is emauk'],
        },
        sign_in_provider: 'test',
      },
    },
  };
  req.user = userDetails;
  next();
};

router.post('/v1/issue', dummmyUser, wrap(issueController.createIssue));
router.get('/v1/issue', wrap(issueController.getIssueByTransactionId));
router.get('/v1/on_issue', wrap(issueController.onIssue));
router.get('/v1/getIssues', wrap(issueController.getIssuesList));

export default router;

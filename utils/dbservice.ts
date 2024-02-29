import IssueModel from '../database/issue.model.js';

const addOrUpdateIssueWithtransactionId = async (
  transactionId: string | undefined,
  issueSchema: Record<any, any> = {},
) => {
  return await IssueModel.updateOne({ transaction_id: transactionId }, issueSchema, { upsert: true });
};

const getIssueByTransactionId = async (transactionId: string) => {
  const issue: any = await IssueModel.find({
    transaction_id: transactionId,
  });

  if (!(issue || issue.length)) {
    return {
      status: 404,
      name: 'NO_RECORD_FOUND_ERROR',
      message: 'Record not found',
    };
  } else return issue?.[0];
};

export { addOrUpdateIssueWithtransactionId, getIssueByTransactionId };

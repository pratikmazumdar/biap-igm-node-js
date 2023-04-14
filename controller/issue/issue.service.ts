class IssueService {
  /**
   * select multiple orders
   * @param {Array} requests
   */
  async selectMultipleOrder(requests: any) {
    const selectOrderResponse = await Promise.all(
      requests.map(async (request: any) => {
        try {
          const response = request;
          return response;
        } catch (err) {
          throw err;
        }
      })
    );

    return selectOrderResponse;
  }
}

export default IssueService;

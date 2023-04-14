import { protocolIssue } from "../../utils/protocolApis";

class BppIssueService {
  /**
   * bpp select order
   * @param {Object} context
   * @param {Object} order
   */
  async select(context: object, order: any = {}) {
    try {
      const { cart = {}, fulfillments = [] } = order || {};

      const provider = cart?.items?.[0]?.provider || {};

      const selectRequest = {
        context: context,
        message: {
          order: {
            items:
              cart.items.map((cartItem: any) => {
                return {
                  id: cartItem?.id?.toString(),
                  quantity: cartItem?.quantity,
                };
              }) || [],
            provider: {
              id: provider?.id,
              locations: provider.locations.map((location: any) => {
                return { id: location };
              }),
            },
            fulfillments:
              fulfillments && fulfillments.length ? [...fulfillments] : [],
          },
        },
      };

      const response = await protocolIssue(selectRequest);

      return { context: context, message: response.message };
    } catch (err) {
      throw err;
    }
  }
}

export default BppIssueService;

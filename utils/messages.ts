import moment from "moment";

const MESSAGES = {
  NOTIFICAION_NOT_FOUND: "Notification does not exist",
  ORDER_NOT_EXIST: "Order not exist",
  PAYMENT_FAILED: "Refund Payment Failed",
  LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID: "Token is not valid",
};

function formatMessage(username: string, text: string) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

export { MESSAGES, formatMessage };

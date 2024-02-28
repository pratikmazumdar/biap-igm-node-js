export enum SYSTEM_ROLES {
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum RESOURCE_POSSESSION {
  OWN = "OWN",
  ANY = "ANY",
  SUB = "SUB",
}

export enum HEADERS {
  ACCESS_TOKEN = "access-token",
  AUTH_TOKEN = "Authorization",
}

export enum PAYMENT_TYPES {
  "ON-ORDER" = "ON-ORDER",
  "PRE-FULFILLMENT" = "PRE-FULFILLMENT",
  "ON-FULFILLMENT" = "ON-FULFILLMENT",
  "POST-FULFILLMENT" = "POST-FULFILLMENT",
}

export enum PROTOCOL_CONTEXT {
  ISSUE = "issue",
  ON_ISSUE = "on_issue",
  ISSUE_STATUS = "issue_status",
  ON_ISSUE_STATUS = "on_issue_status",
}

export enum PROTOCOL_PAYMENT {
  PAID = "PAID",
  "NOT-PAID" = "NOT-PAID",
}

export enum PROTOCOL_VERSION {
  v_0_9_1 = "0.9.1",
  v_0_9_3 = "0.9.3",
  v_1_0_0 = "1.0.0",
}

export enum SUBSCRIBER_TYPE {
  BAP = "BAP",
  BPP = "BPP",
  BG = "BG",
  LREG = "LREG",
  CREG = "CREG",
  RREG = "RREG",
}

export enum ORDER_STATUS {
  COMPLETED = "completed",
  "IN-PROGRESS" = "in-progress",
}

export enum PAYMENT_COLLECTED_BY {
  BAP = "BAP",
  BPP = "BPP",
}

export enum Methods {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
}

export enum IssueCRM {
  BUGZILLA = "BUGZILLA",
  TRUDESK = "TRUEDESK",
}

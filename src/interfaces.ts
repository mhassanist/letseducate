import { AccountView } from "near-api-js/lib/providers/provider";

export interface LearningRequest {
  title: string;
  description: string;
  requestedAmount: string;
  collectedAmount: string;
}

export type Account = AccountView & {
  account_id: string;
};

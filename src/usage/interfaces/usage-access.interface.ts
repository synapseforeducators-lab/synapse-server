import { BillingPlan } from "src/billing/enum/billing-plan.enum";
export interface UsageAccess {
  allowed: boolean;

  current: number;

  limit: number;

  remaining: number;

  plan: BillingPlan;
}
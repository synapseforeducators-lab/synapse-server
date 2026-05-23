import { BillingPlan } from '../enum/billing-plan.enum';
export const BILLING_PLANS = {
  [BillingPlan.FREE]: {
    price: 0,
    aiNotes: 0,
    schemes: 2,
    curriculum: 2,
    maxUsers: 1,
  },

  [BillingPlan.STANDARD_MONTHLY]: {
    price: 5000,
    aiNotes: 100,
    schemes: Infinity,
    curriculum: Infinity,
    maxUsers: 1,
  },

  [BillingPlan.STANDARD_YEARLY]: {
    price: 50000,
    aiNotes: 1500,
    schemes: Infinity,
    curriculum: Infinity,
    maxUsers: 1,
  },

  [BillingPlan.SCHOOL_MONTHLY]: {
    price: 25000,
    aiNotes: Infinity,
    schemes: Infinity,
    curriculum: Infinity,
    maxUsers: 50,
  },

  [BillingPlan.SCHOOL_YEARLY]: {
    price: 250000,
    aiNotes: Infinity,
    schemes: Infinity,
    curriculum: Infinity,
    maxUsers: 500,
  },
};

import { BillingPlan } from 'src/billing/enum/billing-plan.enum';
import { UsageType } from '../enums/usage-type.enum';

export const USAGE_LIMITS = {
  [BillingPlan.FREE]: {
    [UsageType.SCHEME]: 2,
    [UsageType.NOTE]: 2,
    [UsageType.CURRICULUM]: 2,
    [UsageType.AI_NOTE_GENERATION]: 0,
  },

  [BillingPlan.STANDARD_MONTHLY]: {
    [UsageType.SCHEME]: Infinity,
    [UsageType.NOTE]: Infinity,
    [UsageType.CURRICULUM]: Infinity,
    [UsageType.AI_NOTE_GENERATION]: 100,
  },

  [BillingPlan.STANDARD_YEARLY]: {
    [UsageType.SCHEME]: Infinity,
    [UsageType.NOTE]: Infinity,
    [UsageType.CURRICULUM]: Infinity,
    [UsageType.AI_NOTE_GENERATION]: 1500,
  },

  [BillingPlan.SCHOOL_MONTHLY]: {
    [UsageType.SCHEME]: Infinity,
    [UsageType.NOTE]: Infinity,
    [UsageType.CURRICULUM]: Infinity,
    [UsageType.AI_NOTE_GENERATION]: Infinity,
  },

  [BillingPlan.SCHOOL_YEARLY]: {
    [UsageType.SCHEME]: Infinity,
    [UsageType.NOTE]: Infinity,
    [UsageType.CURRICULUM]: Infinity,
    [UsageType.AI_NOTE_GENERATION]: Infinity,
  },
};

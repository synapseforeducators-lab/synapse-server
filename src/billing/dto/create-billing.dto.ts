import { ApiProperty } from '@nestjs/swagger';
import { BillingPlan } from '../enum/billing-plan.enum';

export class CreateBillingDto {
  @ApiProperty({ enum: BillingPlan, enumName: 'BillingPlan' })
  plan: BillingPlan;
}

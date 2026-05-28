import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingPlan } from '../enum/billing-plan.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BillingStatus } from '../enum/billing-status.enum';

export class CreateBillingDto {
  @ApiProperty({ enum: BillingPlan, enumName: 'BillingPlan' })
  @IsString()
  plan: BillingPlan;
}

export class BillingQueryParamsDto {
  @ApiPropertyOptional({ enum: BillingPlan, enumName: 'BillingPlan' })
  @IsString()
  @IsOptional()
  @IsEnum(BillingPlan)
  plan?: BillingPlan;

  @ApiPropertyOptional({ enum: BillingStatus, enumName: 'BillingStatus' })
  @IsString()
  @IsOptional()
  @IsEnum(BillingStatus)
  status?: BillingStatus;
}

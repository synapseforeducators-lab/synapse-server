import { IsEnum } from 'class-validator';

import { UsageType } from '../enums/usage-type.enum';
export class IncrementUsageDto {
  @IsEnum(UsageType)
  type: UsageType;
}

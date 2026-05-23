import { SetMetadata } from '@nestjs/common';

import { UsageType } from '../enums/usage-type.enum';
export const UsageLimit = (type: UsageType) => SetMetadata('usage_type', type);

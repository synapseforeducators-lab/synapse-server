import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { PaystackWebhookService } from './paystack/paystack-webhook.service';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { CreateBillingDto } from './dto/create-billing.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly webhookService: PaystackWebhookService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @CurrentUser() user: User,
    @Body() createBillingDto: CreateBillingDto,
  ) {
    return this.billingService.initializeCheckout(user, createBillingDto.plan);
  }

  @Get('verify')
  async verify(
    @Query('reference')
    reference: string,
  ) {
    return this.billingService.verifyTransaction(reference);
  }

  @Post('webhook/paystack')
  async webhook(
    @Req() req,
    @Headers('x-paystack-signature')
    signature: string,
  ) {
    return this.webhookService.handle(req.body, signature);
  }
}

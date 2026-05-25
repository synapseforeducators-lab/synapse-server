import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Headers,
} from '@nestjs/common';

import { BillingService } from './billing.service';

import { PaystackWebhookService } from './paystack/paystack-webhook.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,

    private readonly webhookService: PaystackWebhookService,
  ) {}

  @Post('checkout')
  async checkout(@Req() req, @Body('plan') plan) {
    return this.billingService.initializeCheckout(req.user, plan);
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

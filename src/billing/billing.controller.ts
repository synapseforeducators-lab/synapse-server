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
import {
  BillingQueryParamsDto,
  CreateBillingDto,
} from './dto/create-billing.dto';
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
    return await this.billingService.initializeCheckout(user, createBillingDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('active-subscription')
  async getActiveSubscription(@CurrentUser() user: User) {
    return await this.billingService.getUserCurrentSubscription(user.id);
  }

  @Get('verify')
  async verify(
    @Query('reference')
    reference: string,
  ) {
    return await this.billingService.verifyTransaction(reference);
  }

  @Get('subscriptions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getSubscriptions() {
    return await this.billingService.getSubscriptionList();
  }

  @Get('invoice')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getInvoiceList(
    @CurrentUser() user: User,
    @Query() dto: BillingQueryParamsDto,
  ) {
    return await this.billingService.getInvoiceList(user, dto);
  }

  @Post('webhook/paystack')
  async webhook(
    @Req() req,
    @Headers('x-paystack-signature')
    signature: string,
  ) {
    return await this.webhookService.handle(req.body, signature);
  }
}

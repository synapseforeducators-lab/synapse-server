import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import * as crypto from 'crypto';

@Injectable()
export class PaystackWebhookService {
  verifySignature(
    payload: any,
    signature: string,
  ) {
    const hash = crypto
      .createHmac(
        'sha512',
        process.env.PAYSTACK_SECRET_KEY!,
      )
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  async handle(
    payload: any,
    signature: string,
  ) {
    const valid =
      this.verifySignature(
        payload,
        signature,
      );

    if (!valid) {
      throw new ForbiddenException(
        'Invalid webhook signature',
      );
    }

    switch (payload.event) {
      case 'charge.success':
        return this.handleChargeSuccess(
          payload,
        );

      case 'invoice.payment_failed':
        return this.handleFailedInvoice(
          payload,
        );

      case 'subscription.disable':
        return this.handleSubscriptionDisable(
          payload,
        );
    }
  }

  async handleChargeSuccess(
    payload: any,
  ) {
    console.log(
      'Charge success:',
      payload.data.reference,
    );
  }

  async handleFailedInvoice(
    payload: any,
  ) {
    console.log(
      'Invoice failed:',
      payload.data.reference,
    );
  }

  async handleSubscriptionDisable(
    payload: any,
  ) {
    console.log(
      'Subscription disabled:',
      payload.data.subscription_code,
    );
  }
}
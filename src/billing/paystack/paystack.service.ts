import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly config: ConfigService) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.config.get('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    callback_url?: string;
    metadata?: Record<string, any>;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      data,
      {
        headers: this.headers(),
      },
    );

    return response.data.data;
  }

  async verifyTransaction(reference: string) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: this.headers(),
      },
    );

    return response.data.data;
  }

  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
  }) {
    const response = await axios.post(`${this.baseUrl}/customer`, data, {
      headers: this.headers(),
    });

    return response.data.data;
  }

  async disableSubscription(subscriptionCode: string, emailToken: string) {
    const response = await axios.post(
      `${this.baseUrl}/subscription/disable`,
      {
        code: subscriptionCode,
        token: emailToken,
      },
      {
        headers: this.headers(),
      },
    );

    return response.data.data;
  }
}

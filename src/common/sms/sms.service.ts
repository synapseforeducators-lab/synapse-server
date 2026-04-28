import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { phoneNumberFormatter } from '../util';
import { SmsTemplates } from './templates';

@Injectable()
export class SmsService {
  private instance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    // const proxyUrl = 'http://username:password@proxy-server.com:port';
    // const agent = new HttpsProxyAgent(proxyUrl);
    this.instance = axios.create({
      //   httpAgent: agent,
      // proxy: false,
      headers: {
        Authorization: `Bearer ${this.configService.get('SENDCHAMP_ACCESS_KEY')}`,
      },
      baseURL: this.configService.get('SENDCHAMP_BASE_URL'),
    });
  }

  private async sendSms(message: string, phoneNumber: string) {
    phoneNumber = phoneNumberFormatter(phoneNumber);

    const payload = {
      message,
      to: phoneNumber,
      sender_name: this.configService.get('SMS_SENDER_NAME'),
      route: 'dnd',
      phone_number: phoneNumber,
      route_id: 'dnd',
    };
    try {
      const { data } = await this.instance.post('/sms/send', payload);

      console.log({ data });

      return data;
    } catch (error) {
      console.log({ error });
    }
  }
  private async sendEmail(message: string, email: string) {
    const payload = {
      message_body: message,
      to: [email],
      sender_name: this.configService.get('SMS_SENDER_NAME'),
      route: 'dnd',
    };
    try {
      const { data } = await this.instance.post('/email/send', payload);

      console.log({ data });

      return data;
    } catch (error) {
      console.log({ error });
    }
  }

  async phoneNumberVerification(phoneNumber: string, code: string) {
    await this.sendSms(SmsTemplates.phoneNumberVerification(code), phoneNumber);
  }
  async emailVerification(email: string, code: string) {
    await this.sendEmail(SmsTemplates.phoneNumberVerification(code), email);
  }
}

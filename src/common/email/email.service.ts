import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

interface EmailVariables {
  [key: string]: string | number;
}

interface EmailTemplate {
  id: string;
  variables: EmailVariables;
}

interface EmailSendOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
}

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async send(createEmailDto: EmailSendOptions) {
    const { to, subject, template } = createEmailDto;

    return await this.resend.emails.send({
      from: 'synapseforeducators@gmail.com',
      to,
      subject,
      template: template,
    });
  }
}

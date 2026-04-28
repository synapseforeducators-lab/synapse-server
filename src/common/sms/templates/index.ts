export class SmsTemplates {
  static phoneNumberVerification(code: string) {
    return `Your unique verification code is ${code}, valid for 10 minutes.`;
  }
}

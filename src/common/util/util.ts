import { v4 as uuidV4 } from 'uuid';
export function otpGenerator(length: number): string {
  const characters = '1234567890';
  let result = '';

  while (result.length < length) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function generateNonRecurringString() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const timestamp = Date.now().toString();
  for (let i = 0; i < 5; i++) {
    // Adjust the length of the random string as needed
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return randomString + timestamp;
}

export function maskLastSixDigits(inputString: string | null): string {
  if (typeof inputString === 'string' && inputString.length > 6) {
    const prefix: string = inputString.slice(0, -6);
    const maskedDigits: string = '*'.repeat(6);
    return prefix + maskedDigits;
  } else {
    return inputString;
  }
}

export function phoneNumberFormatter(phoneNumber: string) {
  if (phoneNumber.charAt(0) === '+') {
    return phoneNumber.slice(1);
  } else if (phoneNumber.startsWith('234')) {
    return `234${phoneNumber.slice(3)}`;
  } else {
    return `234${phoneNumber.slice(1)}`;
  }
}

export function createSlug(word: string) {
  return word.toLowerCase().replace(/[^\w-]+/g, '-');
}

export function generatePaystackReference() {
  return uuidV4();
}

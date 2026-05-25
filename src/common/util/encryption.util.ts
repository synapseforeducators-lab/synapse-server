import * as crypto from 'crypto';

const signature = (secret_key: string, genKey = false) => {
  const shasum = crypto.createHash('sha256');
  shasum.update(secret_key);
  if (genKey) {
    return shasum.digest('hex').slice(0, 24);
  } else {
    return shasum.digest('hex').slice(0, 16);
  }
};

export function encryptPayload(
  payload: string,
  parsedKey: string,
  parsedVector: string,
) {
  const key = signature(parsedKey, true);
  const iv = signature(parsedVector, false);
  const algorithm = 'aes-192-cbc';
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(payload, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

export function decryptPayload(
  encryptedPayload: string,
  parsedKey: string,
  parsedVector: string,
) {
  const key = signature(parsedKey, true);
  const iv = signature(parsedVector, false);
  const algorithm = 'aes-192-cbc';
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedData = decipher.update(encryptedPayload, 'hex', 'utf-8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

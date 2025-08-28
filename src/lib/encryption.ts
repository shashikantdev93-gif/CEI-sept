
import CryptoJS from 'crypto-js';

class EncryptionService {
  private readonly secretKey: string = import.meta.env.VITE_ENCRYPTION_KEY || 'CEI_SECRET_KEY_2025';

encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }

generateRandomKey(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }
}

const encryptionService = new EncryptionService();

export default encryptionService;


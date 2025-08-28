import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';

class EncryptionService {
  private publicKeyPem: string;
  private ki: string;
  private iv: string;

  constructor() {
    this.publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwjsOR/w7ExDCRyZyrGVW
xkiJDBaIoNHYABOnpctmmcKA+G0oEWsBhOsmI98Tsx6w47Bwokc43aulzyw2phiV
h0+lU+kno9mnrxzfRCJWwknK7tfkY2ZfkizyLJZQljqX4o7r14y5BAEMgUWiN3Xt
Vrs0fgyw954To+G/803gsaaodbr4CVUDOaLnWAn3mjSKLfU3cK9Bug59AObhcwsM
lVKA72JF2wC4IERMGgCbRjgISSjpLmaEmF8IOLfFneQY+8QDlu80ob7mA/JV74dD
vr7UlGZ+bwKx6rz7Mg7nWRUvgR5RKsZh/muyeVi4pBwuAlehblQ9FnjR6YM/4eB1
+QIDAQAB
-----END PUBLIC KEY-----`;

    this.ki = 'ruX(aPP4X1sL9LnvA2M^a$K17mKZS6LC';
    this.iv = 'VcHa4Mn*gUvDujnN';
  }

setForm(data: string): { encryptedData1: string, encryptedData2: string, encryptedData3: string } {
    const aesKey = forge.random.getBytesSync(32);
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(data, 'utf8'));
    cipher.finish();
    const encryptedData1 = forge.util.encode64(cipher.output.getBytes());
    const rsa = forge.pki.publicKeyFromPem(this.publicKeyPem);
    const encryptedData2 = forge.util.encode64(rsa.encrypt(aesKey, 'RSA-OAEP', { md: forge.md.sha256.create() }));
    const encryptedData3 = forge.util.encode64(iv);
    const result = { encryptedData1, encryptedData2, encryptedData3 };
    return result;
  }

set(value: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.ki);
    const iv = CryptoJS.enc.Utf8.parse(this.iv);
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value.toString()),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    
    const result = encrypted.toString();
    return result;
  }

get(value: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.ki);
    const iv = CryptoJS.enc.Utf8.parse(this.iv);
    const decrypted = CryptoJS.AES.decrypt(value, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result;
  }

decrypt(value: string): string {
    return this.get(value);
  }

encrypt(value: string): string {
    return this.set(value);
  }

debugEncryption = (value: string) => {
const encrypted = this.set(value);
console.log('🔐 [ENCRYPTION-DEBUG] Input:', value);
console.log('🔐 [ENCRYPTION-DEBUG] Output:', encrypted);
console.log('🔐 [ENCRYPTION-DEBUG] Output length:', encrypted.length);
console.log('🔐 [ENCRYPTION-DEBUG] Contains Base64 chars:', /[+/=]/.test(encrypted));
return encrypted;
};

}


const encryptionService = new EncryptionService();

export default encryptionService;

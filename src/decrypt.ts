import os from "os";
import crypto from "crypto";
import keytar from "keytar";

function decryptCookieWindows(encryptedValue: any) {
  const dpapi = require("node-dpapi");
  const encryptedBuffer = Buffer.from(encryptedValue, "base64");
  const decryptedBuffer = dpapi.decrypt(encryptedBuffer, "user");
  return decryptedBuffer.toString("utf-8");
}

async function decryptCookieMac(encryptedValue: any) {
  const service = "Chrome Safe Storage";
  const account = "Chrome";
  const password = await keytar.getPassword(service, account);
  if (!password) throw new Error("Failed to retrieve password from keychain");

  const iterations = 1003;
  const keyLength = 16;
  const salt = "saltysalt";
  const iv = Buffer.from("20".repeat(16), "hex");
  const key = crypto.pbkdf2Sync(password, salt, iterations, keyLength, "sha1");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(encryptedValue.slice(3), "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted.trimEnd();
}

async function decryptCookieLinux(encryptedValue: any) {
  const service = "Chrome Safe Storage";
  const account = "Chrome";
  const password = await keytar.getPassword(service, account);
  if (!password) throw new Error("Failed to retrieve password from keyring");

  const iterations = 1;
  const keyLength = 16;
  const salt = "saltysalt";
  const iv = Buffer.from("20".repeat(16), "hex");
  const key = crypto.pbkdf2Sync(password, salt, iterations, keyLength, "sha1");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(encryptedValue.slice(3), "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted.trimEnd();
}

export async function decryptCookie(encryptedValue: any) {
  switch (os.platform()) {
    case "win32":
      return decryptCookieWindows(encryptedValue);
    case "darwin":
      return await decryptCookieMac(encryptedValue);
    case "linux":
      return await decryptCookieLinux(encryptedValue);
    default:
      throw new Error("Unsupported platform");
  }
}

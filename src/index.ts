import { readAllCookies } from "./cookies";
import { decryptCookie } from "./decrypt";
import { convertSameSite } from "./utils";

async function main() {
  let count = 1;
  const cookies = readAllCookies();
  for (const cookie of cookies) {
    const decrypted = await decryptCookie(cookie.encrypted_value);
    const samesite = convertSameSite(cookie.samesite);
    console.log(`${count++}. ${cookie.name} (${samesite}):\n${decrypted}\n`);
  }
}

main();

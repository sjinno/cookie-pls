import { readAllCookies } from "./cookies";
import { decryptCookie } from "./decrypt";
import { readChromeLocalStorage } from "./local-storage";
import { convertSameSite } from "./utils";

async function main() {
  // // cookies
  // {
  //   let count = 1;
  //   const cookies = readAllCookies();
  //   for (const cookie of cookies) {
  //     const decrypted = await decryptCookie(cookie.encrypted_value);
  //     const samesite = convertSameSite(cookie.samesite);
  //     console.log(`${count++}. ${cookie.name} (${samesite}):\n${decrypted}\n`);
  //   }
  // }

  // console.log("========================================");

  // localStorage
  let count = 1;
  const localStorage = await readChromeLocalStorage();
  for (const key in localStorage) {
    console.log(`${count++}. ${key}:\n${localStorage[key]}\n`);
  }
}

main();

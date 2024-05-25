import fs from "fs";
import path from "path";
import os from "os";
import Database from "better-sqlite3";
import { getChromeProfilesPath, getProfileDirectories } from "./utils";

type Cookie = {
  host_key: string;
  name: string;
  value: string;
  encrypted_value: string;
  path: string;
  expires_utc: number;
  is_secure: number;
  is_httponly: number;
  last_access_utc: number;
  has_expires: number;
  is_persistent: number;
  priority: number;
  profile: string;
  samesite: number;
};

// Function to read cookies from a profile
function readCookiesFromProfile(profilePath: string): Cookie[] {
  const unix = os.platform() !== "win32";
  const cookiesPath_ = unix ? "Cookies" : path.join("Network", "Cookies");
  const cookiesPath = path.join(profilePath, cookiesPath_);

  if (!fs.existsSync(cookiesPath)) {
    return [];
  }

  const db = new Database(cookiesPath, { readonly: true });
  const cookies = db
    .prepare(
      "SELECT host_key, name, value, encrypted_value, path, expires_utc, is_secure, is_httponly, last_access_utc, has_expires, is_persistent, priority, samesite FROM cookies"
    )
    .all();
  db.close();

  return cookies as Cookie[];
}

// Function to read cookies from all profiles
export function readAllCookies(): Cookie[] {
  const profilesPath = getChromeProfilesPath();
  const profiles = getProfileDirectories(profilesPath);

  let allCookies: Cookie[] = [];

  profiles.forEach((profile: string) => {
    const profilePath = path.join(profilesPath, profile);
    const cookies = readCookiesFromProfile(profilePath);

    allCookies = allCookies.concat(
      cookies
        .filter(
          (cookie) =>
            cookie.host_key.includes("github.com") && profile !== "Default"
        )
        .map((cookie) => ({ ...cookie, profile }))
    );
  });

  return allCookies;
}

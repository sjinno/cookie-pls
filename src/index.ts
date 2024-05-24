import fs from "fs";
import path from "path";
import os from "os";
import Database from "better-sqlite3";
import { decryptCookie } from "./decrypt";

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

type SameSite = "no_restriction" | "lax" | "strict" | "unspecified";

// Function to get Chrome profiles directory
function getChromeProfilesPath(): string {
  const homedir = os.homedir();
  switch (os.platform()) {
    case "win32":
      return path.join(
        homedir,
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data"
      );
    case "darwin":
      return path.join(
        homedir,
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
    case "linux":
      return path.join(homedir, ".config", "google-chrome");
    default:
      throw new Error("Unsupported platform");
  }
}

// Function to get all profile directories (this includes Default)
function getProfileDirectories(profilesPath: string): string[] {
  return fs.readdirSync(profilesPath).filter((file: string) => {
    if (file === "Default" || file.startsWith("Profile")) {
      return fs.statSync(path.join(profilesPath, file)).isDirectory();
    }
    return false;
  });
}

// Function to read cookies from a profile
function readCookiesFromProfile(profilePath: string): Cookie[] {
  const unix = os.platform() !== "win32";
  const pathToCookies = unix ? "Cookies" : path.join("Network", "Cookies");

  const cookiesPath = path.join(profilePath, pathToCookies);
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
function readAllCookies(): Cookie[] {
  const profilesPath = getChromeProfilesPath();
  const profiles = getProfileDirectories(profilesPath);

  let allCookies: Cookie[] = [];
  profiles.forEach((profile: string) => {
    const profilePath = path.join(profilesPath, profile);
    // console.log("shohei - profilePath", profilePath);
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

function convertSameSite(samesite: number): SameSite {
  switch (samesite) {
    case 0:
      return "no_restriction";
    case 1:
      return "lax";
    case 2:
      return "strict";
    default:
      return "unspecified";
  }
}

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

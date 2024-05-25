import fs from "fs";
import path from "path";
import os from "os";

type SameSite = "no_restriction" | "lax" | "strict" | "unspecified";

export function convertSameSite(samesite: number): SameSite {
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

// Function to get Chrome profiles directory
export function getChromeProfilesPath(): string {
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
export function getProfileDirectories(profilesPath: string): string[] {
  return fs.readdirSync(profilesPath).filter((file: string) => {
    if (file === "Default" || file.startsWith("Profile")) {
      return fs.statSync(path.join(profilesPath, file)).isDirectory();
    }
    return false;
  });
}

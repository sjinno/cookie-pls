import path from "path";
import os from "os";
import levelup from "levelup";
import leveldown from "leveldown";

type LocalStorageData = {
  [key: string]: string;
};

function getChromeLocalStoragePath() {
  const homeDir = os.homedir();
  switch (os.platform()) {
    case "win32":
      return path.join(
        homeDir,
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data",
        "Default",
        "Local Storage",
        "leveldb"
      );
    case "darwin":
      return path.join(
        homeDir,
        "Library",
        "Application Support",
        "Google",
        "Chrome",
        "Default",
        "Local Storage",
        "leveldb"
      );
    case "linux":
      return path.join(
        homeDir,
        ".config",
        "google-chrome",
        "Default",
        "Local Storage",
        "leveldb"
      );
    default:
      throw new Error("Unsupported platform");
  }
}

export function readChromeLocalStorage(): Promise<LocalStorageData> {
  const localStoragePath = getChromeLocalStoragePath();
  const db = levelup(leveldown(localStoragePath));

  return new Promise((resolve, reject) => {
    const localStorageData: LocalStorageData = {};
    db.createReadStream()
      .on("data", function (data) {
        // Assuming keys and values are stored as UTF-8 strings
        const key = data.key.toString("utf-8");
        const value = data.value.toString("utf-8");
        // Filter out non-localStorage keys (based on your needs)
        if (key.startsWith("_")) {
          localStorageData[key] = value;
        }
      })
      .on("error", function (err) {
        reject(err);
      })
      .on("close", function () {
        resolve(localStorageData);
      });
  });
}

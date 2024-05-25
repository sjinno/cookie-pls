import path from "path";
import levelup from "levelup";
import leveldown from "leveldown";
import { getChromeProfilesPath, getProfileDirectories } from "./utils";

type LocalStorageData = {
  [key: string]: string;
};

function readLocalStorageData(profilePath: string): Promise<LocalStorageData> {
  return new Promise((resolve, reject) => {
    const localStoragePath = path.join(profilePath, "Local Storage", "leveldb");
    const db = levelup(leveldown(localStoragePath));

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
      .on("end", function () {
        resolve(localStorageData);
      });
  });
}

export async function readChromeLocalStorage() {
  const profilesPath = getChromeProfilesPath();
  const profilePaths = getProfileDirectories(profilesPath);

  const allLocalStorageData: LocalStorageData[] = [];

  for (const profilePath of profilePaths) {
    const storagePath = path.join(profilesPath, profilePath);

    try {
      const localStorageData = await readLocalStorageData(storagePath);
      // allLocalStorageData[profileName] = localStorageData;
      allLocalStorageData.push(localStorageData);
    } catch (error) {
      console.error(
        `Failed to read local storage data for profile ${storagePath}:`,
        error
      );
    }
  }

  return allLocalStorageData;
}

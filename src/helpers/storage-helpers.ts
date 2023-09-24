import fetch from "node-fetch";
import firebaseAdmin from "./firebase-admin";

export const getCloudLinkForImage: (
  url: string,
  syncToCloud?: boolean
) => Promise<string> = async (url, syncToCloud = false) => {
  const uniqueLink = url
    .replace(/^.+\/wp-content\/uploads/, "")
    .replaceAll("/", "-");
  const file = firebaseAdmin.storage().bucket().file(`img${uniqueLink}`);
  if (syncToCloud) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    await file.save(buffer);
  }

  return file.publicUrl();
};

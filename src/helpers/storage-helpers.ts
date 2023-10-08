import tinify from "tinify";
import firebaseAdmin from "./firebase-admin";

tinify.key = process.env.TINIFY_KEY as string;

export const getCloudLinkForImage: (
  url: string,
  syncToCloud?: boolean
) => Promise<string> = async (url, syncToCloud = false) => {
  const uniqueLink = url
    .replace(/^.+\/wp-content\/uploads/, "")
    .replaceAll("/", "-");
  const file = firebaseAdmin.storage().bucket().file(`img${uniqueLink}`);
  if (syncToCloud) {
    const source = tinify.fromUrl(url);
    const buffer = await source.toBuffer();
    await file.save(Buffer.from(buffer), {
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    });
  }

  return file.publicUrl();
};

import tinify from "tinify";
import firebaseAdmin from "./firebase-admin";
// import ProductWPRepo from "../database/repository/ProductWPRepo";
// import { waitOut } from "./search-helpers";

tinify.key = process.env.TINIFY_KEY as string;

export const getCloudLinkForImage: (
  url: string,
  syncToCloud?: boolean
) => Promise<string> = async (url, syncToCloud) => {
  const isGif = url.endsWith(".gif");
  if (isGif) {
    return "";
  }
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

// export const reuploadAllImages = async () => {
//   const performUpload = async (url: string, index?: number) => {
//     try {
//       const isGif = url.endsWith(".gif");
//       const path = url.split("/").pop();

//       if (!path) {
//         return;
//       }
//       const uniqueLink = path
//         .split(".")
//         .slice(0, -1)
//         .concat(["webp"])
//         .join(".");
//       const file = firebaseAdmin
//         .storage()
//         .bucket()
//         .file(`mobile-${uniqueLink}`);
//       if (!isGif) {
//         const source = tinify.fromUrl(url);
//         const resizedSource = source.resize({
//           method: "scale",
//           width: 1000
//         });
//         const converted = resizedSource.convert({ type: ["image/webp"] });
//         const buffer = await converted.toBuffer();
//         await file.save(Buffer.from(buffer), {
//           metadata: {
//             cacheControl: "public, max-age=31536000"
//           }
//         });
//       }
//       if (index && index % 10 === 0) {
//         console.log(`done with ${index}: ${uniqueLink}`);
//       }
//     } catch (err) {
//       console.error(`Unable to upload ${url}: ${err}`);
//     }
//   };

//   const allProducts = await ProductWPRepo.getAllProducts();
//   const allImageUrls = allProducts.data.reduce((arr: string[], product) => {
//     return [...arr, ...product.images.map(img => img.src)];
//   }, []);
//   let i = 0;
//   const promiseArr = [];
//   // eslint-disable-next-line no-restricted-syntax
//   for (const url of allImageUrls) {
//     promiseArr.push(performUpload(url, i));
//     // eslint-disable-next-line no-await-in-loop
//     await waitOut(1000);
//     i += 1;
//   }
//   await Promise.all(promiseArr);
//   console.log("Done with all");
// };

// reuploadAllImages();

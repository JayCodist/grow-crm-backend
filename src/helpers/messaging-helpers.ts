import Mailjet from "node-mailjet";
import { InternalError } from "../core/ApiError";

const mailjet = Mailjet.connect(
  process.env.MAILJET_API_KEY as string,
  process.env.MAILJET_SECRET_KEY as string
);

export const sendEmailToAddress: (
  emailAddresses: string[],
  message: string,
  emailSubject: string
) => Promise<void> = async (emailAddresses, message, emailSubject) => {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "info@regalflowers.com.ng",
            Name: "Regal Flowers"
          },
          To: emailAddresses.map((addr, i) => ({
            Email: addr,
            Name: `user ${i + 1}`
          })),
          TemplateID: 1378967,
          TemplateLanguage: true,
          Subject: emailSubject,
          Variables: {
            body: message
          }
        }
      ]
    });
  } catch (err) {
    throw new InternalError(
      (err as any).ErrorMessage || (err as Error).message
    );
  }
};

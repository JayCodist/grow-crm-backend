import {
  OrderActor,
  OrderActorCategory
} from "../../../../database/model/Order";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { formatPhoneNumber } from "../../../../helpers/formatters";

const { firestore } = firebaseAdmin;

export const handleContactHooks: (
  user: {
    name?: string;
    email?: string;
    phone?: string;
    phoneAlt?: string;
    address?: string;
    phoneCountryCode?: string;
    altPhoneCountryCode?: string;
  },
  contactType: OrderActorCategory
) => Promise<OrderActor> = async (user, contactType) => {
  let contact: OrderActor = {};
  const phone = formatPhoneNumber(user.phone);
  const phoneAlt = formatPhoneNumber(user.phoneAlt);
  if (phone) {
    const { docs } = await firestore()
      .collection("contacts")
      .where("phones", "array-contains", phone)
      .limit(1)
      .get();
    contact = docs[0]?.exists ? { id: docs[0].id, ...docs[0].data() } : {};
  }
  if (contact.id) {
    // Update contact if changed
    if (
      (user.name && contact.name !== user.name) ||
      (user.email && contact.email !== user.email) ||
      (user.address && !contact.address?.includes(user.address)) ||
      !contact.category?.includes(contactType)
    ) {
      await firestore()
        .collection("contacts")
        .doc(contact.id)
        .update({
          ...contact,
          name: user.name || contact.name,
          email: user.email || contact.email,
          category: Array.from(
            new Set([...(contact.category || []), contactType])
          ),
          address: Array.from(
            new Set([...(contact.address || []), user.address || ""])
          ).filter(Boolean)
        });
    }
  } else {
    // Create new contact
    const contactData = {
      firstname: (user.name || "").split(" ")[0],
      lastname: (user.name || "").split(" ")[1] || "",
      address: [user.address || ""].filter(Boolean),
      name: user.name || "",
      category: [contactType],
      phone: phone || "",
      phoneCountryCode: user.phoneCountryCode || "",
      altPhoneCountryCode: user.altPhoneCountryCode || "",
      phoneAlt: phoneAlt || "",
      phoneAlt2: "",
      phones: [phone, phoneAlt].filter(Boolean),
      email: user.email || "",
      timestamp: firestore.FieldValue.serverTimestamp()
    } as OrderActor;
    const doc = await firestore().collection("contacts").add(contactData);
    contact = { id: doc.id, ...contactData };
  }
  return contact;
};

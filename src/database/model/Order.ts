interface OrderItem {
  SKU?: string;
  name: string;
  quantity: number;
  price: number;
}

type PaymentStatus =
  | "PAID - GO AHEAD (but not seen yet)"
  | "Not Paid (finalized discussion)"
  | "PAID - GO AHEAD (Bank Transfer)"
  | "PART- PAYMENT PAID - GO AHEAD (but not seen yet)"
  | "PAID - GO AHEAD (Paypal)"
  | "Not Paid (still discussing)"
  | "PAID - GO AHEAD (cash - Ikoyi)"
  | "PAID - GO AHEAD (cash - VI)"
  | "PAID - GO AHEAD (cash - ABUJA)"
  | "PAID - GO AHEAD (POS - Ikoyi)"
  | "PAID - GO AHEAD (POS - VI)"
  | "PAID - GO AHEAD (POS - ABUJA)"
  | "NOT PAID - BUT GO AHEAD"
  | "PAID - GO AHEAD (Website - Card)"
  | "Not Paid (cancelled)"
  | "Not Paid (Website - Bank Transfer)"
  | "PART PAYMENT RECEIVED (GO AHEAD)"
  | "Not Paid (Website - card)"
  | "PAID - GO AHEAD (Transferwise)"
  | "PAID - GO AHEAD (UK Bank Transfer)"
  | "PAID - GO AHEAD (cash - on delivery)"
  | "GO AHEAD (Bad Flowers)"
  | "Not Paid (Website - Paypal)"
  | "PAID - GO AHEAD (Western Union)"
  | "PAID - GO AHEAD (POS - Lekki)"
  | "PAID - GO AHEAD (WorldRemit)"
  | "Refunded"
  | "PAID - GO AHEAD (Bitcoins)"
  | "PAID - GO AHEAD (cash - Lekki)"
  | "PAID - GO AHEAD (Payoneer)"
  | "PAID - GO AHEAD (CashApp and other alternatives)"
  | "PAID - GO AHEAD (POS - on delivery)";

type Channel =
  | "Phone"
  | "Whatsapp"
  | "Instagram"
  | "Walk-in Ikeja Airport"
  | "Walk-in Ikoyi"
  | "Walk-in VI"
  | "Walk-in Abuja"
  | "3rd Party - Jumia"
  | "3rd Party - SureGifts"
  | "Regal Website"
  | "FloralHub Website"
  | "3rd Party - SME Markethub"
  | "Walk-in Lekki"
  | "3rd Party - Arab Flowers Network"
  | "Email"
  | "Facebook"
  | "Other";

type DeliveryStatus =
  | "Not Arranged"
  | "Arranged"
  | "Arranged and Sorted"
  | "Arranged and Inspected"
  | "Despatched (given to driver/trip not started)"
  | "Despatched"
  | "Despatched and Client Notified"
  | "Delivered"
  | "Delivered and Client Notified"
  | "Delivery Failed/Issues with Delivery"
  | "Despatched (drivers update)"
  | "Delivered (drivers update)";

export interface DeliveryLocationOption {
  name: string;
  label: string;
  amount: number;
}

export type OrderActorCategory = "client" | "recipient" | "driver" | "supplier";

export interface OrderActor {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  address?: string[];
  phone?: string;
  phoneAlt?: string;
  phoneAlt2?: string;
  email?: string;
  residenceType?: string;
  state?: string;
  method?: string;
  category?: OrderActorCategory[];
}

type DeliveryZone =
  | "LND"
  | "LIK"
  | "LVI"
  | "LLI"
  | "LLK"
  | "LOL"
  | "LML"
  | "LYB"
  | "LGB"
  | "LOP"
  | "LPI"
  | "LPV"
  | "AND"
  | "AWU"
  | "AAS"
  | "AAP"
  | "AGP"
  | "AJB"
  | "AKB"
  | "AOP"
  | "APA"
  | "WEB"
  | "PPH"
  | "ONG"
  | "LPL"
  | "LPM"
  | "OST";

type DespatchedFrom = "Unselected" | "Ikoyi" | "VI" | "Abuja";

type Line =
  | "Unselected"
  | "Regal 1"
  | "Regal 2"
  | "Regal 3"
  | "Floral 1"
  | "NA"
  | "Admin B"
  | "Admin A"
  | "Ola's line";

type Purpose =
  | "Unknown"
  | "Valentine"
  | "Birthday"
  | "Anniversary"
  | "Romance"
  | "Sorry"
  | "Get Well"
  | "Condolence, Wreaths or Remembrance"
  | "Thanks"
  | "Congrats"
  | "Welcome or Goodbye"
  | "Bridal"
  | "Florist"
  | "Good Luck"
  | "Cake Decor"
  | "Event & Centerpiece"
  | "Mother's Day"
  | "Father's Day"
  | "International Women's Day"
  | "Christmas"
  | "Easter"
  | "Proposal"
  | "Plants"
  | "Gift Company"
  | "School Prom"
  | "Other"
  | "Complimentary";

type OrderStatus = "created" | "processing";

export interface Order {
  id: string;
  orderProducts: OrderItem[];
  paymentStatus: PaymentStatus;
  cost: number;
  deliveryDate?: string;
  admin: string;
  adminNotes: string;
  amount: number;
  anonymousClient: boolean;
  arrangementTime: string;
  business: "Regal Flowers" | "Floral Hub";
  channel: Channel;
  contactDepsArray: Array<string>;
  costBreakdown: string;
  deliveryMessage: string;
  deliveryNotePrinted: boolean;
  deliveryStatus: DeliveryStatus;
  deliveryZone: DeliveryZone;
  despatchFrom: DespatchedFrom;
  driverAlerted: boolean;
  editingAdminsRevised: Array<string>;
  feedback: Record<string, any>;
  isClientRecipient: boolean;
  isDuplicatedOrder: boolean;
  lastDeliveryNotePrintedAdmin: string;
  lastDeliveryNotePrintedTime: string;
  lastDeliveryStatusAdmin: string;
  lastDeliveryStatusTime: string;
  lastMessagePrintedAdmin: string;
  lastMessagePrintedTime: string;
  lastPaymentStatusAdmin: string;
  lastPaymentStatusTime: string;
  line: Line;
  messagePrinted: boolean;
  orderDetails: string;
  profit: number;
  purpose: Purpose;
  receivedByName: string;
  receivedByPhone: string;
  recipientAddress: string;
  sendReminders: boolean;
  upsellProfit: number;
  websiteOrderID: string;
  recipient: OrderActor;
  client: OrderActor;
  driver: OrderActor;
  orderStatus: OrderStatus;
  zone: string;
  state: string;
}

export type OrderCreate = Omit<Order, "id">;

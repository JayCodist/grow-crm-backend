import dayjs from "dayjs";
import { OTPRecord, OTPRecordModel } from "../model/OTPRecord";
import { PaymentLogModel, PaymentType } from "../model/PaymentLog";

export default class PaymentLogRepo {
  public static async createPaymentLog(
    paymentType: PaymentType,
    logData: unknown
  ): Promise<void> {
    const createdAt = dayjs().format();
    await OTPRecordModel.create({ paymentType, createdAt, logData });
  }

  public static findById(id: string): Promise<OTPRecord | null> {
    return PaymentLogModel.findOne({ _id: id }).lean<OTPRecord>().exec();
  }
}

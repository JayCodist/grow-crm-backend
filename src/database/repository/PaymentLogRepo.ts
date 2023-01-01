import dayjs from "dayjs";
import { Environment } from "../../config";
import { PaymentLog, PaymentLogModel, PaymentType } from "../model/PaymentLog";

export default class PaymentLogRepo {
  public static async createPaymentLog(
    paymentType: PaymentType,
    logData: unknown,
    environment: Environment
  ): Promise<void> {
    const createdAt = dayjs().format();
    await PaymentLogModel.create({
      paymentType,
      createdAt,
      logData,
      environment
    });
  }

  public static findById(id: string): Promise<PaymentLog | null> {
    return PaymentLogModel.findOne({ _id: id }).lean<PaymentLog>().exec();
  }
}

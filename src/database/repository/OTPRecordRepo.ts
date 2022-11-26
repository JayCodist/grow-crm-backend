import dayjs from "dayjs";
import { OTPRecord, OTPRecordModel } from "../model/OTPRecord";

const getOTPCode = () => {
  return Array(6)
    .fill("")
    .reduce(otp => `${otp}${Math.floor(Math.random() * 10)}`, "");
};

export default class OTPRecordRepo {
  public static async createOTPRecord(email: string): Promise<OTPRecord> {
    const createdAt = dayjs().format();
    const existingOTPRecord = await OTPRecordModel.findOne({ email });
    const code = getOTPCode();
    if (existingOTPRecord) {
      await OTPRecordModel.findByIdAndUpdate(
        existingOTPRecord._id,
        { code, createdAt },
        {
          new: true
        }
      );
      return existingOTPRecord;
    }
    const { _id } = await OTPRecordModel.create({ email, code, createdAt });
    return { email, code, createdAt, id: _id };
  }

  public static async delete(id: string) {
    const response = await OTPRecordModel.findByIdAndDelete(id);

    return response;
  }

  public static findById(id: string): Promise<OTPRecord | null> {
    return OTPRecordModel.findOne({ _id: id }).lean<OTPRecord>().exec();
  }

  public static async findByEmail(email: string): Promise<OTPRecord | null> {
    const doc = await OTPRecordModel.findOne({ email })
      .lean<OTPRecord>()
      .exec();
    if (!doc) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...OTPRecord } = doc as any;
    return { ...OTPRecord, id: _id };
  }
}

import { Types } from "mongoose";
import dayjs from "dayjs";
import ClientAccessLog, {
  ClientAccessLogModel
} from "../model/ClientAccessLog";
import { PartialLoose } from "../../helpers/type-helpers";
import { InternalError } from "../../core/ApiError";
import { getSearchArray } from "../../helpers/seach-helpers";
import { createdAtDateFormat } from "../../helpers/constants";

type SortLogic = PartialLoose<ClientAccessLog, "asc" | "desc">;

export interface PaginatedFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
}

const defaultSortLogic: SortLogic = { createdAt: "desc" };
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};
const defaultFilter = {};

export default class ClientAccessLogRepo {
  public static getPaginatedLogs({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic
  }: PaginatedFetchParams): Promise<{
    clientAccessLogs: ClientAccessLog[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      ClientAccessLogModel.find(filter)
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<ClientAccessLog[]>()
        .exec((err, clientAccessLogs) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            const filterQuery = ClientAccessLogModel.find(filter);
            const countQuery =
              filter === defaultFilter
                ? filterQuery.estimatedDocumentCount()
                : ClientAccessLogModel.countDocuments(filter);
            countQuery.exec((countErr, count) => {
              if (countErr) {
                reject(new InternalError(countErr.message));
              } else {
                resolve({
                  clientAccessLogs,
                  count
                });
              }
            });
          }
        });
    });
  }

  public static findById(id: Types.ObjectId): Promise<ClientAccessLog | null> {
    return (
      ClientAccessLogModel.findOne({ _id: id })
        // .select("+email +password +roles")
        .populate({
          path: "roles",
          match: { status: true }
        })
        .lean<ClientAccessLog>()
        .exec()
    );
  }

  public static async create(
    input: ClientAccessLog
  ): Promise<{ clientAccessLog: ClientAccessLog }> {
    const data: ClientAccessLog = {
      ...input,
      createdAt: dayjs().format(),

      _adminSearch: getSearchArray(input.admin),
      _clientSearch: getSearchArray(input.client),
      _createdAtSearch: getSearchArray(dayjs().format(createdAtDateFormat)),
      _orderIDSearch: getSearchArray(input.orderID)
    };
    const clientAccessLog = await ClientAccessLogModel.create(data);
    return { clientAccessLog };
  }

  // public static findByEmail(email: string): Promise<User | null> {
  //   return UserModel.findOne({ email, status: true })
  //     .select("+email +password +roles")
  //     .populate({
  //       path: "roles",
  //       match: { status: true },
  //       select: { code: 1 }
  //     })
  //     .lean<User>()
  //     .exec();
  // }
  // public static findProfileById(id: Types.ObjectId): Promise<User | null> {
  //   return UserModel.findOne({ _id: id, status: true })
  //     .select("+roles")
  //     .populate({
  //       path: "roles",
  //       match: { status: true },
  //       select: { code: 1 }
  //     })
  //     .lean<User>()
  //     .exec();
  // }
  // public static findPublicProfileById(
  //   id: Types.ObjectId
  // ): Promise<User | null> {
  //   return UserModel.findOne({ _id: id, status: true }).lean<User>().exec();
  // }
  // public static async update(
  //   user: User,
  //   accessTokenKey: string,
  //   refreshTokenKey: string
  // ): Promise<{ user: User; keystore: Keystore }> {
  //   user.updatedAt = new Date();
  //   await UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
  //     .lean()
  //     .exec();
  //   const keystore = await KeystoreRepo.create(
  //     user._id,
  //     accessTokenKey,
  //     refreshTokenKey
  //   );
  //   return { user, keystore };
  // }
  // public static updateInfo(user: User): Promise<any> {
  //   user.updatedAt = new Date();
  //   return UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
  //     .lean()
  //     .exec();
  // }
}

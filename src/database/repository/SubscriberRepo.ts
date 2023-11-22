import { Types } from "mongoose";
import dayjs from "dayjs";
import Subscriber, {
  SubscriberCreate,
  SubscriberModel,
  subscriberProjection
} from "../model/Subscriber";
import { PartialLoose } from "../../helpers/type-helpers";
import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";

type SortLogic = PartialLoose<Subscriber, "asc" | "desc">;

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

export default class SubscriberRepo {
  public static getPaginatedLogs({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic
  }: PaginatedFetchParams): Promise<{
    data: Subscriber[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      SubscriberModel.find(filter)
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<Subscriber[]>()
        .select(subscriberProjection.join(" "))
        .exec((err: Error | null, subscribers: Subscriber[]) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            const filterQuery = SubscriberModel.find(filter);
            const countQuery =
              filter === defaultFilter
                ? filterQuery.estimatedDocumentCount()
                : SubscriberModel.countDocuments(filter);
            countQuery.exec((countErr, count) => {
              if (countErr) {
                reject(new InternalError(countErr.message));
              } else {
                resolve({
                  data: subscribers.map(formatResponseRecord),
                  count
                });
              }
            });
          }
        });
    });
  }

  public static findById(id: Types.ObjectId): Promise<Subscriber | null> {
    return SubscriberModel.findOne({ _id: id }).lean<Subscriber>().exec();
  }

  public static async create(input: SubscriberCreate): Promise<Subscriber> {
    const data: SubscriberCreate = {
      ...input,
      createdAt: dayjs().format()
    };
    const { _id, createdAt } = await SubscriberModel.create(data);
    return { ...input, id: _id, createdAt };
  }
}

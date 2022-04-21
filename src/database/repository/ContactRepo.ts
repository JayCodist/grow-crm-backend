import { Request } from "express";
import dayjs from "dayjs";
import Contact, {
  ContactCreate,
  ContactModel,
  contactProjection
} from "../model/Contacts";
import { PartialLoose } from "../../helpers/type-helpers";
import { PaginatedFetchParams } from "./ClientAccessLogRepo";
import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import { getSearchArray } from "../../helpers/search-helpers";

type SortLogic = PartialLoose<Contact, "asc" | "desc">;
const defaultSortLogic: SortLogic = { createdAt: "asc" };
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};

const defaultFilter = {};

export default class ContactsRepo {
  public static getPaginatedContacts({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic
  }: PaginatedFetchParams): Promise<{ data: Contact[]; count: number }> {
    return new Promise((resolve, reject) => {
      ContactModel.find(filter)
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<Contact[]>()
        .select(contactProjection.join(" "))
        .exec((err: Error | null, contacts: Contact[]) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            const filterQuery = ContactModel.find(filter);
            const countQuery =
              filter === defaultFilter
                ? filterQuery.estimatedDocumentCount()
                : ContactModel.countDocuments(filter);
            countQuery.exec((countErr, count) => {
              if (countErr) {
                reject(new InternalError(countErr.message));
              } else {
                resolve({
                  data: contacts.map(formatResponseRecord),
                  count
                });
              }
            });
          }
        });
    });
  }

  public static async create(input: Contact): Promise<Contact> {
    const { id } = input;
    const data: ContactCreate = {
      ...input,
      _id: id,
      createdAt: input.createdAt || dayjs().format(),
      _categorySearch: input.category
        .map(getSearchArray)
        .reduce((previousValue, currentValue) =>
          previousValue.concat(currentValue)
        ),
      _nameSearch: getSearchArray(input.name),
      _genderSearch: getSearchArray(input.gender),
      _phonesSearch: getSearchArray(input.phones?.join("") || ""),
      _addressSearch: getSearchArray(input.address?.join("") || ""),
      _emailSearch: getSearchArray(input.email)
    };
    const { createdAt, phones } = await ContactModel.create(data);
    return { ...input, phones, createdAt };
  }

  public static async update(updateParams: PartialLoose<Contact>) {
    const { id, ...update } = updateParams;
    const contact = await ContactModel.findByIdAndUpdate(id, update, {
      new: true
    });

    return contact;
  }

  public static async delete(id: string) {
    const contact = await ContactModel.findByIdAndDelete(id);

    return contact;
  }
}

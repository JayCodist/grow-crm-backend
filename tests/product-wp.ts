import {
  expect,
  server,
  request,
  describe,
  before,
  after,
  it
} from "./helpers";
import { ApiResponse } from "../src/core/ApiResponse";
import { ProductWPModel } from "../src/database/model/ProductWP";

const endpoint = "/v1/product-wp";

interface ExternalFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortField?: string;
  searchField?: string;
  searchValue?: string;
  sortType?: "asc" | "desc";
  tagValue?: string;
}

const performFetchTest: (
  params?: ExternalFetchParams,
  isFailureCase?: boolean
) => Promise<ApiResponse> = async (params, isFailureCase) => {
  const paramsStr = params
    ? `?${new URLSearchParams(JSON.stringify(params))}`
    : "";
  const response = await request(server).get(
    `${endpoint}/paginate${paramsStr}`
  );
  const { status, body } = response;
  expect(status).to.equal(isFailureCase ? 400 : 200);
  if (isFailureCase) {
    expect(body.data).to.equal(undefined);
  } else {
    const { data } = body.data;
    console.log(data);
    expect(data).to.be.an("array");
  }
  return body;
};

describe("ProductWP", () => {
  before(done => {
    ProductWPModel.deleteMany({}, () => done());
  });

  after(done => {
    ProductWPModel.deleteMany({}, () => done());
  });
  /*
   * Test the /GET route
   */
  describe("/GET", async () => {
    it("it should fail to get empty array of products with wrong params", async () => {
      const shouldFail = true;
      const { message } = await performFetchTest(
        { pageNumber: -5 },
        shouldFail
      );
      expect(/not\sallowed/i.test(message)).to.equal(true);
    });

    it("it should fail to get empty array of products with wrong params", async () => {
      const shouldFail = true;
      const { message } = await performFetchTest(
        { tagValue: "tags" },
        shouldFail
      );
      expect(/not\sallowed/i.test(message)).to.equal(true);
    });

    it("it should get empty array of products", async () => {
      const { data: response } = await performFetchTest();
      const { data, count } = response;
      expect(data.length).to.equal(0);
      expect(count).to.equal(0);
    });
  });
});

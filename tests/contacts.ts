import {
  expect,
  Contact,
  server,
  request,
  describe,
  before,
  after,
  it
} from "./helpers";
import { ApiResponse } from "../src/core/ApiResponse";

const sampleContact: any = {
  id: "FgdVajAd4cV25K0mDoOg",
  name: "Damian Usifoh",
  firstName: "Damian",
  lastName: "Usifoh",
  phone: "0912345678",
  phoneAlt: "09111116666",
  phoneAlt2: "",
  phones: ["0912345678", "09111116666"],
  address: [],
  category: ["client", "recipient"],
  gender: "",
  city: "",
  state: "",
  dob: "",
  email: "",
  timeStamp: new Date().valueOf()
};

const endpoint = "/v1/contacts";

interface ExternalFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortField?: string;
  searchField?: string;
  searchValue?: string;
  sortType?: "asc" | "desc";
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
    expect(data).to.be.an("array");
  }
  return body;
};

describe("Contacts", () => {
  // let id: string;
  before(done => {
    Contact.deleteMany({}, () => done());
  });

  after(done => {
    Contact.deleteMany({}, () => done());
  });
  /*
   * Test the /GET route
   */
  describe("/GET", () => {
    it("it should fail to get empty array of contacts with wrong params", async () => {
      const shouldFail = true;
      const { message } = await performFetchTest(
        { pageNumber: -5 },
        shouldFail
      );
      expect(/not\sallowed/i.test(message)).to.equal(true);
    });

    it("it should get empty array of contacts", async () => {
      const { data: response } = await performFetchTest();
      const { data, count } = response;
      expect(data.length).to.equal(0);
      expect(count).to.equal(0);
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST", () => {
    it("it should fail to post a new contact with wrong payload", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...namelessContact } = sampleContact;
      const response = await request(server)
        .post(`${endpoint}/create`)
        .send(namelessContact);
      const { status, body } = response;
      const { message } = body;
      expect(status).to.equal(400);
      expect(/name\sis\srequired/i.test(message)).to.equal(true);
    });

    it("it should post a new contact", async () => {
      const response = await request(server)
        .post(`${endpoint}/create`)
        .send(sampleContact);
      const { status, body } = response;
      const { data } = body;
      expect(status).to.equal(200);
      expect(data).to.be.an("object");
      expect(data.id).to.equal(sampleContact.id);

      const { data: responseData } = await performFetchTest();
      const newContact = responseData.data[0];
      const { count } = responseData;
      expect(count).to.equal(1);
      expect(newContact).to.be.an("object");
      expect(newContact.id).to.equal(sampleContact.id);
      expect(newContact.name).to.equal(sampleContact.name);
      expect(newContact.phone).to.equal(sampleContact.phone);
    });
  });

  // /*
  //  * Test /PUT route
  //  */

  // describe("/PUT/:id", () => {
  //   it("it should UPDATE a contact by the given id", done => {
  //     const contact = new Contact({
  //       ...sampleContact,
  //       _id: sampleContact.id
  //     });
  //     contact.save(() => {
  //       request(server)
  //         .put(`${endpoint}/update/${sampleContact.id}`)
  //         .send({ phone: "08029667843", lastName: "Taiwo" })
  //         .end((_, res) => {
  //           const { status, body } = res;
  //           const { data } = body;
  //           expect(status).to.equal(200);
  //           expect(data).to.be.an("object");
  //           expect(data._id).to.be.a("string");
  //           expect(data.name).to.be.a("string");
  //           expect(data.firstName).to.be.a("string");
  //           expect(data.lastName).to.be.a("string").eql("Taiwo");
  //           expect(data.phone).to.be.a("string").eql("08029667843");
  //           expect(data.phoneAlt).to.be.a("string");
  //           expect(data.phoneAlt2).to.be.a("string");
  //           expect(data.phones).to.be.an("array");
  //           expect(data.address).to.be.an("array");
  //           expect(data.category).to.be.an("array");
  //           expect(data.city).to.be.a("string");
  //           expect(data.state).to.be.a("string");
  //           expect(data.dob).to.be.a("string");
  //           expect(data.email).to.be.a("string");
  //           expect(data.timeStamp).to.be.a("string");
  //           expect(data.gender).to.be.a("string");
  //           done();
  //         });
  //     });
  //   });
  // });

  // /*
  //  * Test /DELETE route
  //  */

  // describe("/DELETE/:id", () => {
  //   it("it should DELETE a contact by the given id", done => {
  //     const contact = new Contact({
  //       ...sampleContact,
  //       _id: sampleContact.id
  //     });
  //     contact.save(() => {
  //       request(server)
  //         .delete(`${endpoint}/delete/${sampleContact.id}`)
  //         .send(sampleContact)
  //         .end((_, res) => {
  //           const { status, body } = res;
  //           expect(status).to.equal(200);
  //           expect(body).to.not.have.property("data");

  //           done();
  //         });
  //     });
  //   });
  // });
});

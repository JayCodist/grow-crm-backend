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
  timestamp: new Date().valueOf()
};

const endpoint = "/v1/contacts";

describe("Contacts", () => {
  let id: string;
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
    it("it should GET empty array of Contacts", done => {
      request(server)
        .get(`${endpoint}/paginate`)
        .end((_, res) => {
          const { status, body } = res;
          const { data } = body.data;
          expect(status).to.equal(200);
          expect(data).to.be.an("array");
          expect(data.length).to.equal(0);
          done();
        });
    });
  });
});

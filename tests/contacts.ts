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
  timeStamp: new Date().valueOf()
};

const endpoint = "/v1/contacts";

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

  /*
   * Test the /POST route
   */
  describe("/POST", () => {
    it("it should POST a new Contact", done => {
      request(server)
        .post(`${endpoint}/create`)
        .send(sampleContact)
        .end((_, res) => {
          const { status, body } = res;
          const { data } = body;
          expect(status).to.equal(200);
          expect(data).to.be.an("object");
          expect(data.id).to.equal(sampleContact.id);
          // request(server)
          //   .get(`${endpoint}/paginate`)
          //   .end((_, res) => {

          //   })
          done();
        });
    });
  });

  /*
   * Test /PUT route
   */

  describe("/PUT/:id", () => {
    it("it should UPDATE a contact by the given id", done => {
      const contact = new Contact({
        ...sampleContact,
        _id: sampleContact.id
      });
      contact.save(() => {
        request(server)
          .put(`${endpoint}/update/${sampleContact.id}`)
          .send({ phone: "08029667843", lastName: "Taiwo" })
          .end((_, res) => {
            const { status, body } = res;
            const { data } = body;
            expect(status).to.equal(200);
            expect(data).to.be.an("object");
            expect(data._id).to.be.a("string");
            expect(data.name).to.be.a("string");
            expect(data.firstName).to.be.a("string");
            expect(data.lastName).to.be.a("string").eql("Taiwo");
            expect(data.phone).to.be.a("string").eql("08029667843");
            expect(data.phoneAlt).to.be.a("string");
            expect(data.phoneAlt2).to.be.a("string");
            expect(data.phones).to.be.an("array");
            expect(data.address).to.be.an("array");
            expect(data.category).to.be.an("array");
            expect(data.city).to.be.a("string");
            expect(data.state).to.be.a("string");
            expect(data.dob).to.be.a("string");
            expect(data.email).to.be.a("string");
            expect(data.timeStamp).to.be.a("string");
            expect(data.gender).to.be.a("string");
            done();
          });
      });
    });
  });

  /*
   * Test /DELETE route
   */

  describe("/DELETE/:id", () => {
    it("it should DELETE a contact by the given id", done => {
      const contact = new Contact({
        ...sampleContact,
        _id: sampleContact.id
      });
      contact.save(() => {
        request(server)
          .delete(`${endpoint}/delete/${sampleContact.id}`)
          .send(sampleContact)
          .end((_, res) => {
            const { status, body } = res;
            expect(status).to.equal(200);
            expect(body).to.not.have.property("data");

            done();
          });
      });
    });
  });
});

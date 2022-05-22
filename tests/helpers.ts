import chaiHttp from "chai-http";
import chai from "chai";
import mocha from "mocha";
import "../src/server";
import { ContactModel } from "../src/database/model/Contacts";
import app from "../src/app";

export const { expect } = chai;

chai.use(chaiHttp);

const { request } = chai;
const { after, before, describe, it } = mocha;

export {
  after,
  it,
  describe,
  before,
  request,
  ContactModel as Contact,
  app as server
};

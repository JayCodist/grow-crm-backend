import express from "express";
import validator from "../../../helpers/validator";
import validation from "./validation";

const verifyPaystack = express.Router();

verifyPaystack.get("/", validator(validation.verifyPaymentPaystack, "query"));

export default verifyPaystack;

import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import firebaseAdmin from "../../../helpers/firebase-admin";

const ordertID = express.Router();

ordertID.get("/:id", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore()
      .collection("orders")
      .doc(req.params.id)
      .get()
      .then(doc => {
        if (!doc.exists) {
          return "No such document!";
        }
        return doc.data();
      });

    if (!response) {
      new BadRequestResponse("Product not found").send(res);
    }
    new SuccessResponse("success", response).send(res);
  } catch (error) {
    ApiError.handle(new InternalError("Unable to fetch product"), res);
  }
});

export default ordertID;

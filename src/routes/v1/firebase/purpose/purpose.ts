import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const purposes = express.Router();

purposes.get("/", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore().collection("purposes").get();

    return new SuccessResponse(
      "success",
      response.docs
        .map(doc => doc.data())
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((purpose: any) => purpose.name)
    ).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default purposes;

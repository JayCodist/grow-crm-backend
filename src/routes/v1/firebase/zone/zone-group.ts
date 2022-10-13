import express from "express";
import {
  ApiError,
  BadRequestError,
  InternalError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const zoneGroup = express.Router();

zoneGroup.get("/groups", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await await await firestore()
      .collection("zoneGroups")
      .get();

    const zoneGroups = response.docs.map(doc => doc.data().name);

    if (!response) {
      return new BadRequestError("Unable to fetch zone groups");
    }
    return new SuccessResponse("success", zoneGroups).send(res);
  } catch (error) {
    return ApiError.handle(
      new InternalError("Unable to fetch zone groups"),
      res
    );
  }
});

export default zoneGroup;

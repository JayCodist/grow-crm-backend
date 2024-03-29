import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const zoneGroup = express.Router();

zoneGroup.get("/groups", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore().collection("zoneGroups").get();

    const zoneGroups = response.docs.map(doc => doc.data().name);

    return new SuccessResponse("success", zoneGroups).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default zoneGroup;

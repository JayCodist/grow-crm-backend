import express from "express";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use("/", async (req, res, next) => {
  // Check API key later
  next();
});
/*-------------------------------------------------------------------------*/

router.use("/client-access-logs/paginate", clientAccessLogList);
router.use("/client-access-logs/create", clientAccessLogCreate);

export default router;

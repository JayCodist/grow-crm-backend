import express from "express";
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

// router.use('/blogs', blogList);
// router.use('/blog', blogDetail);
// router.use('/writer/blog', writer);
// router.use('/editor/blog', editor);
// router.use('/profile', user);

export default router;

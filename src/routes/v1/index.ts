import express from "express";
import { SuccessResponse } from "../../core/ApiResponse";

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use("/", (req, res) =>
  new SuccessResponse("Done!", { name: "Ukaegbu Justice" }).send(res)
);
/*-------------------------------------------------------------------------*/

// router.use('/signup', signup);
// router.use('/login', login);
// router.use('/logout', logout);
// router.use('/token', token);
// router.use('/blogs', blogList);
// router.use('/blog', blogDetail);
// router.use('/writer/blog', writer);
// router.use('/editor/blog', editor);
// router.use('/profile', user);

export default router;

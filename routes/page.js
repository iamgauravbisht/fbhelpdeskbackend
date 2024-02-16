const { Router } = require("express");
const zod = require("zod");
const { userDetails } = require("../utils/pageutils");

const pageRouter = Router();

const connnectPage = zod.object({
  access_token: zod.string(),
});

pageRouter.get("/connect", async (req, res) => {
  const { success } = connnectPage.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid access token Error",
    });
  }

  await fetch(
    `https://graph.facebook.com/${userID}/accounts?access_token=${req.body.access_token}`
  );
});

const showAllPages = zod.object({
  userID: zod.string(),
  access_token: zod.string(),
});

pageRouter.post("/showallpages", async (req, res) => {
  const { success } = showAllPages.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  console.log(req.body);
  const response = await userDetails(req.body);
  if (response.message) {
    return res.status(411).json({
      message: response.message,
    });
  }
  const { pageDetailsWithToken } = response;
  console.log(pageDetails);
  return res.status(200).json({
    message: "success",
    pageDetails: pageDetailsWithToken,
  });
});

module.exports = pageRouter;

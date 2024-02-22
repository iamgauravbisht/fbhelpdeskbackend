const { Router } = require("express");
const zod = require("zod");
const {
  operateOnMessages,
  operateOnComments,
  operateOnUpdatedMessages,
} = require("../utils/pageutils");
const {
  userDetails,
  getMessages,
  getComments,
  replyComments,
  replyMessages,
  getUpdatedMessages,
} = require("../utils/pageRouteCall");
const { FBUser } = require("../db");
const pageRouter = Router();

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
  const response = await userDetails(req.body);
  if (response.message) {
    return res.status(411).json({
      message: response.message,
    });
  }
  const { pageDetailsWithToken } = response;
  return res.status(200).json({
    message: "success",
    pageDetails: pageDetailsWithToken,
  });
});

const conversationsBody = zod.object({
  pageID: zod.string(),
  pageAccessToken: zod.string(),
  userID: zod.string(),
});

pageRouter.post("/getmessages", async (req, res) => {
  const { success } = conversationsBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const conversations = await getMessages({
    pageID: req.body.pageID,
    pageAccessToken: req.body.pageAccessToken,
  });

  if (!conversations) {
    return res.status(411).json({
      message: "Error ocured while fetching user conversations details",
    });
  }
  const cleanedDataMesages = operateOnMessages(conversations);
  if (!cleanedData) {
    return res.status(411).json({
      message: "Error ocured while cleaning user conversations details",
    });
  }
  //your messages object conversation and return only that inside of conversation array
  const messageConversationObject = cleanedDataMesages.filter(
    (conversation) => conversation.messages.message === req.body.message
  );
  await FBUser.findOneAndUpdate(
    { userID: req.body.userID, "pageDetails.pageID": req.body.pageID },
    { $set: { "pageDetails.$.messages": cleanedDataMesages } }
  );
  return res.status(200).json({
    message: "success",
    conversation: messageConversationObject,
  });
});
pageRouter.post("/getcomments", async (req, res) => {
  const { success } = conversationsBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const comments = await getComments({
    pageID: req.body.pageID,
    pageAccessToken: req.body.pageAccessToken,
  });
  if (!comments) {
    return res.status(411).json({
      message: "Error ocured while fetching user comments details",
    });
  }
  const cleanedDataComments = operateOnComments(comments);
  await FBUser.findOneAndUpdate(
    { userID: req.body.userID, "pageDetails.pageID": req.body.pageID },
    { $set: { "pageDetails.$.comments": cleanedDataComments } }
  );

  return res.status(200).json({
    message: "success",
    comments: cleanedDataComments,
  });
});
pageRouter.post("/getconversations", async (req, res) => {
  const { success } = conversationsBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const conversations = await getMessages({
    pageID: req.body.pageID,
    pageAccessToken: req.body.pageAccessToken,
  });
  if (!conversations) {
    return res.status(411).json({
      message: "Error ocured while fetching user conversations details",
    });
  }
  const cleanedDataMesages = operateOnMessages(conversations);
  if (!cleanedDataMesages) {
    return res.status(411).json({
      message: "Error ocured while cleaning user conversations details",
    });
  }
  const comments = await getComments({
    pageID: req.body.pageID,
    pageAccessToken: req.body.pageAccessToken,
  });
  if (!comments) {
    return res.status(411).json({
      message: "Error ocured while fetching user comments details",
    });
  }
  const cleanedDataComments = operateOnComments(comments);

  const cleanedData = [...cleanedDataMesages, ...cleanedDataComments];
  const sortedCleanedData = cleanedData.sort(
    (a, b) =>
      new Date(b.messages[0].created_time) -
      new Date(a.messages[0].created_time)
  );
  // await FBUser.findOneAndUpdate(
  //   { userID: req.body.userID, "pageDetails.$.pageID": req.body.pageID },
  //   { $set: { "pageDetails.$.conversations": sortedCleanedData } }
  // );

  return res.status(200).json({
    message: "success",
    conversations: sortedCleanedData,
  });
});

const replyMessagesBody = zod.object({
  pageID: zod.string(),
  pageAccessToken: zod.string(),
  recipientPSID: zod.string(),
  message: zod.string(),
  messageThreadID: zod.string(),
  participants: zod.array(zod.object({ id: zod.string(), name: zod.string() })),
});

pageRouter.post("/replymessages", async (req, res) => {
  const { success } = replyMessagesBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const response = await replyMessages(req.body);
  if (response.message.includes("Error")) {
    return res.status(411).json({
      message: response.message,
    });
  }
  // call getUpdatedMessages to get the updated messages
  const updatedMessages = await getUpdatedMessages({
    messageThreadID: req.body.messageThreadID,
    pageAccessToken: req.body.pageAccessToken,
  });

  //operateOnUpdatedMessages to clean the data and make conversaton of it
  const cleanedData = operateOnUpdatedMessages({
    messages: updatedMessages,
    participants: req.body.participants,
    id: req.body.messageThreadID,
    type: "FACEBOOK DM",
  });

  // update database with new message
  // const updatedb = await FBUser.findOneAndUpdate(
  //   { pageDetails: { $elemMatch: { pageID: req.body.pageID } } },
  //   { $set: { "pageDetails.$.messages": cleanedData } }
  // );

  // if (!updatedb) {
  //   return res.status(411).json({
  //     message: "Error ocured while updating user message details",
  //   });
  // }

  return res.status(200).json({
    message: "success",
    conversation: cleanedData,
  });
});
const replyCommentsBody = zod.object({
  pageAccessToken: zod.string(),
  commentID: zod.string(),
  message: zod.string(),
});

//pageRouter which send a reply to the user comments from the frontend
pageRouter.post("/replycomments", async (req, res) => {
  const { success } = replyCommentsBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const response = await replyComments(req.body);
  if (response.message.includes("Error")) {
    return res.status(411).json({
      message: response.message,
    });
  }
  // update database with new message
  // const updatedComment = await FBUser.findOneAndUpdate(
  //   { "pageDetails.comments.id": req.body.commentID },
  //   {
  //     $set: {
  //       "pageDetails.comments.$.message": req.body.message,
  //     },
  //   }
  // );
  // if (!updatedComment) {
  //   return res.status(411).json({
  //     message: "Error ocured while updating user comments details",
  //   });
  // }

  return res.status(200).json({
    message: "success",
    conversation: response,
  });
});

pageRouter.post("/getselectedconversation", async (req, res) => {
  // call getUpdatedMessages to get the updated messages
  const updatedMessages = await getUpdatedMessages({
    messageThreadID: req.body.messageThreadID,
    pageAccessToken: req.body.pageAccessToken,
  });

  //operateOnUpdatedMessages to clean the data and make conversaton of it
  const cleanedData = operateOnUpdatedMessages({
    messages: updatedMessages,
    participants: req.body.participants,
    id: req.body.messageThreadID,
    type: "FACEBOOK DM",
  });

  // update database with new message
  // const updatedb = await FBUser.findOneAndUpdate(
  //   { pageDetails: { $elemMatch: { pageID: req.body.pageID } } },
  //   { $set: { "pageDetails.$.messages": cleanedData } }
  // );

  // if (!updatedb) {
  //   return res.status(411).json({
  //     message: "Error ocured while updating user message details",
  //   });
  // }

  return res.status(200).json({
    message: "success",
    conversation: cleanedData,
  });
});

module.exports = pageRouter;

const { Router } = require("express");
const zod = require("zod");
const {
  userDetails,
  getMessages,
  operateOnMessages,
  getComments,
  operateOnComments,
} = require("../utils/pageutils");
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
  console.log(req.body);
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

  console.log("conversations: ", conversations);

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
  await FBUser.findOneAndUpdate(
    { userID: req.body.userID, "pageDetails.pageID": req.body.pageID },
    { $set: { "pageDetails.$.messages": cleanedDataMesages } }
  );
  return res.status(200).json({
    message: "success",
    conversations: cleanedDataMesages,
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
  console.log("comments: ", comments);
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
  console.log("cleanedData: ", cleanedData);

  const sortedCleanedData = cleanedData.sort(
    (a, b) =>
      new Date(b.messages[0].created_time) -
      new Date(a.messages[0].created_time)
  );
  await FBUser.findOneAndUpdate(
    { userID: req.body.userID, "pageDetails.pageID": req.body.pageID },
    { $set: { "pageDetails.$.conversations": sortedCleanedData } }
  );

  return res.status(200).json({
    message: "success",
    conversations: sortedCleanedData,
  });
});

//pageRouter which send a reply message to the user from the frontend

//pageRouter which send a reply to the user comments from the frontend

module.exports = pageRouter;

//////response from the getcomments api
// {
//   "data": [
//     {
//       "message": "Hello, This is my Second Post.",
//       "comments": {
//         "data": [
//           {
//             "id": "122100645596217777_24718676151112952",
//             "message": "writing first comment on my second post.",
//             "from": {
//               "name": "HelpDesk",
//               "id": "221671561038277"
//             },
//             "created_time": "2024-02-16T19:27:49+0000"
//           }
//         ],
//         "paging": {
//           "cursors": {
//             "before": "MQZDZD",
//             "after": "MQZDZD"
//           }
//         }
//       },
//       "id": "221671561038277_122100645596217777"
//     },
//     {
//       "message": "Hello, This is my FIRST Post.",
//       "comments": {
//         "data": [
//           {
//             "id": "122100645542217777_267455606374104",
//             "message": "writing first comment on my first post.",
//             "from": {
//               "name": "HelpDesk",
//               "id": "221671561038277"
//             },
//             "created_time": "2024-02-16T19:28:03+0000"
//           }
//         ],
//         "paging": {
//           "cursors": {
//             "before": "MQZDZD",
//             "after": "MQZDZD"
//           }
//         }
//       },
//       "id": "221671561038277_122100645542217777"
//     }
//   ],
//   "paging": {
//     "cursors": {
//       "before": "QVFIUlV6dlc3bUdPNTlScGs0eFVKOGNiNVlBUlZAEb3NYT09kQVNrQjNNaTlVbzA2RnV3akdfTUpBRk8ySXF2TFYyanI3cmNYb25xQy1IUldHTC1uNXZA3WVd5bFRVSWtnVmJvRU5HNWdwZA2VKSjhfTmJpV0FXeVQxM3VIN3A5dXVpX09hczVOdkptaEQxNmVadTluSm10X3E3b1lmS0tudWVIVmlJUWxwNzdfQzl3MnpmckdYdE5OOXVOSDAzbm5RcEtuLVd0a2xTQlJqeTJVb2E2UlhsV0VTTmJMaWt3NC1aZA0tGYXJKc1BtMEszUkpKR1FzYXQyRW92NmpaVzZA6TGU2SmVXa2VFOXMxZAVpoMjU2SVU0em54WW5tczRScEdtQjdaV05qcXU1bGgzai1veTF4SkJmanFPenhLaWY0ZAXN1UFA2MDU2ZAEI5VVdhMHY2cTBLcWZAlTzU1RXk0cVAwZA0RBRldCRXREU0psUnhfd1lHaThzTFQzUkZA2NEpHeW93aFVnZA1JtUkZAQbG5DYlczQzJjMVNLZAHpVUElnTC1WSnA0amRRSU9sX1hqb1l6X1lHZAUFqTkFUM2FsdC10WXBLZAVhYTG1mVEs5WjVYZAzE5SllrV1A1clJkVEZAWZAUZAleDVoM0JnNjFyajh6V2hRa0w4",
//       "after": "QVFIUmNySmFNdFVKR0V5YVd1NW1kSU8yZAnNfYnRwMGVCSVdiMjlOWDNPYm11Rl9jaHpFZATltakFDeXBReTJQazJzLVROWU9qWU92QWY3WmtxTl9QOFMxWXdRUlRSRVJJd1RVS0h6SHF6Qlg0QWFJVFNTSXlSOHA3RjBRRDBKQXVPVGxrWHVySDFaRnhES19tZAGxORFM1OENDelh3MTgxVldKbDVYa013dWRmX3lrMVhQREN3bDZA1TWUzaUphOHRXRFI4aWp2U09kSUVYRDdFbW9ScWNyMzVlTFhDMk11Um41UkhxWHExWldnZAmVJREMxXzJfalMzLWpUQ25QalcwZAUhmaU5rSGtHZAVZAxS1U1aWtfQnViaDdneS00XzV1TFZAZAMjV5ZAFRuNHNFQmpjdWtPT1FsRGNtNHE5M3JsSVN3ZAUNjVG5HNTVoc0oxTWtxWnp0X0wtZAWhHRDFTQWVtSEU4akw4dktjdTRtY3E1blViUlBnU1drY3FmTHdCVDZAUMEE5ZADFoREdWMjBfeXZAMQzYtSVFYSEN5c2FuM012ekFHRXFaamcyOFFzeEZAzSHNhRUw2ODdYQVB0RS1NNEVQRk1NQWxnWExTUFBzSmhfdlpBMGRvVHZAJYXVaZA3E3eVFZANXV1c3NPMFNXeEhVUWxqcU1r"
//     }
//   }
// }

//////response from the getconversations api
// {
// "data": [
//   {
//     "participants": {
//       "data": [
//         {
//           "name": "Gaurav Bisht",
//           "email": "7952208864794492@facebook.com",
//           "id": "7952208864794492"
//         },
//         {
//           "name": "HelpDesk",
//           "email": "221671561038277@facebook.com",
//           "id": "221671561038277"
//         }
//       ]
//     },
//     "messages": {
//       "data": [
//         {
//           "id": "m_aWD7FCXhLG_XvA4Y6HqGpRJ4IDOXCGm0Ai_r0eXY2Kft6mtzUE1QN30QM_ojN134kLjJMCV6owCyevKtetao1w",
//           "message": "Hello gaurav this is helpDesk",
//           "created_time": "2024-02-17T06:57:33+0000",
//           "from": {
//             "name": "HelpDesk",
//             "email": "221671561038277@facebook.com",
//             "id": "221671561038277"
//           },
//           "to": {
//             "data": [
//               {
//                 "name": "Gaurav Bisht",
//                 "email": "7952208864794492@facebook.com",
//                 "id": "7952208864794492"
//               }
//             ]
//           }
//         },
//         {
//           "id": "m_d1_SOL66lnikt3tyS4-DZxJ4IDOXCGm0Ai_r0eXY2KerWAUGRCx7tYL9K8ZDxSpvH1xppl7bSbhC3eojKZHQzw",
//           "message": "This is gaurav",
//           "created_time": "2024-02-17T06:56:47+0000",
//           "from": {
//             "name": "Gaurav Bisht",
//             "email": "7952208864794492@facebook.com",
//             "id": "7952208864794492"
//           },
//           "to": {
//             "data": [
//               {
//                 "name": "HelpDesk",
//                 "email": "221671561038277@facebook.com",
//                 "id": "221671561038277"
//               }
//             ]
//           }
//         },
//         {
//           "id": "m_MTO7s9CTbjP9iUaJDlfnwxJ4IDOXCGm0Ai_r0eXY2Kd25R_ewiHceWSPLk17AGBis3AWuKS19LOn5p1nHlZ9tw",
//           "message": "testing message one",
//           "created_time": "2024-02-17T06:31:57+0000",
//           "from": {
//             "name": "Gaurav Bisht",
//             "email": "7952208864794492@facebook.com",
//             "id": "7952208864794492"
//           },
//           "to": {
//             "data": [
//               {
//                 "name": "HelpDesk",
//                 "email": "221671561038277@facebook.com",
//                 "id": "221671561038277"
//               }
//             ]
//           }
//         }
//       ],
//       "paging": {
//         "cursors": {
//           "before": "QVFIUmFsNXFlV3NKMzdFY2N3TFhLUDR1WEhTZA0lNdkNjYzM4eUg4ZA3pncTVibWxlRGlFWDVVa2dlNEw1SDFld1ZAxQ0dYOGJaOEpxcDJCSDctdGtsU1R2VW9uT21hbzZA2bkFHZAEpWWF9Bd3p6SXZAOWVVmSTBab29tSmtWNlpTbEZAiTzRJ",
//           "after": "QVFIUm9RRkxUb2JiMWNDUndNYXRvd09NSzlfVHptbkFLYkxOTUs2aW9scm9DUWgzdnBocTdOUjhmRmQyWUk3X0xPald4OTk4a1psV0pVZAk1IYjNmZADdmdmJHTkRkMDA5MEhVWDhLczY1NUxMUTlrR3N0cjk0ZAzljVTlZANVl1UE9XMDBI"
//         }
//       }
//     },
//     "id": "t_741667017926604"
//   }
// ],
// "paging": {
//   "cursors": {
//     "before": "QVFIUmI5djg4WGVtZA0F0ZAVVyWWZAVcm1rSUthSHBRWjZAHVWhQNjAtSy1Bbll3Q3E3N3lzVU80QjdlQVdxcm9EU0RDMF8tWFpPQndIZATZAPdmpVWVFmbUVvUGtzY2h4SWdISVUyT1VHLTQ3eXN4UG5SeU5JczdXdHJBTG8tSmNtZAzhOQVM3",
//     "after": "QVFIUmI5djg4WGVtZA0F0ZAVVyWWZAVcm1rSUthSHBRWjZAHVWhQNjAtSy1Bbll3Q3E3N3lzVU80QjdlQVdxcm9EU0RDMF8tWFpPQndIZATZAPdmpVWVFmbUVvUGtzY2h4SWdISVUyT1VHLTQ3eXN4UG5SeU5JczdXdHJBTG8tSmNtZAzhOQVM3"
//   }
// }
// }

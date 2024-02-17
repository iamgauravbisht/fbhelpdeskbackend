const { Router } = require("express");
const zod = require("zod");
const {
  userDetails,
  getConversations,
  operateOnConversations,
} = require("../utils/pageutils");

const pageRouter = Router();

// const connnectPage = zod.object({
//   access_token: zod.string(),
// });

// pageRouter.get("/connect", async (req, res) => {
//   const { success } = connnectPage.safeParse(req.body);
//   if (!success) {
//     return res.status(411).json({
//       message: "invalid access token Error",
//     });
//   }

//   await fetch(
//     `https://graph.facebook.com/${userID}/accounts?access_token=${req.body.access_token}`
//   );
// });

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

//pageRouter which gets the conversations of the page messenger
//sort the all the conversations between users and create a array of conversations between two users
// also then go inside that array and select each conversation and create a array of messages between two users with condition such that the two messages are not more than 24hrs apart if they are 24hrs apart create a new conversation array for them and then sort this array in descending order of time and send it to the frontend.

const conversationsBody = zod.object({
  pageID: zod.string(),
  pageAccessToken: zod.string(),
});

pageRouter.post("/getconversations", async (req, res) => {
  const { success } = conversationsBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "invalid inputs Error",
    });
  }
  const conversations = await getConversations({
    pageID: req.body.pageID,
    pageAccessToken: req.body.pageAccessToken,
  });

  console.log("conversations: ", conversations);

  if (!conversations) {
    return res.status(411).json({
      message: "Error ocured while fetching user conversations details",
    });
  }
  const cleanedData = operateOnConversations(conversations);
  if (!cleanedData) {
    return res.status(411).json({
      message: "Error ocured while cleaning user conversations details",
    });
  }
  return res.status(200).json({
    message: "success",
    conversations: cleanedData,
  });
});

//pageRouter which gets the comments from the page and then sort the comments in descending order of time and send it to the frontend.

//pageRouter which send a reply message to the user from the frontend

//pageRouter which send a reply to the user comments from the frontend

module.exports = pageRouter;

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

const userDetails = async ({ userID, access_token }) => {
  const user = await fetch(
    `https://graph.facebook.com/${userID}/accounts?access_token=${access_token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  const pageDetailsWithToken = user.data.map((page) => {
    return {
      pageID: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
    };
  });

  const pageDetails = pageDetailsWithToken.map((page) => {
    return {
      pageID: page.pageID,
      pageName: page.pageName,
    };
  });

  if (!userDetails) {
    return { message: "Error ocured while fetching user pages details" };
  }
  return { pageDetails, pageDetailsWithToken };
};
const getMessages = async ({ pageID, pageAccessToken }) => {
  const conversations = await fetch(
    `https://graph.facebook.com/${pageID}/conversations?fields=participants,messages{id,message,created_time,from,to}&access_token=${pageAccessToken}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
  return conversations;
};

const getComments = async ({ pageID, pageAccessToken }) => {
  const comments = await fetch(
    `https://graph.facebook.com/${pageID}/feed?fields=message,comments{id,message,from,created_time}&access_token=${pageAccessToken}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
  return comments;
};

const replyComments = async ({ pageAccessToken, commentID, message }) => {
  const replyComment = await fetch(
    `https://graph.facebook.com/${commentID}/comments?message=${message}&access_token=${pageAccessToken}`,
    {
      method: "POST",
    }
  ).then((res) => res.json());
  console.log("replycomment", replyComment);
  if (replyComment.error) {
    return { message: "Error ocured while replying to comments" };
  }
  return {
    replyComment,
    message: "Comment replied successfully",
  };
};

const replyMessages = async ({
  pageID,
  pageAccessToken,
  recipientPSID,
  message,
}) => {
  const replyMessage = await fetch(
    `https://graph.facebook.com/${pageID}/messages?recipient={'id':${recipientPSID}}&messaging_type=RESPONSE&message={'text':'${message}'}&access_token=${pageAccessToken}`,
    {
      method: "POST",
    }
  ).then((res) => res.json());
  if (replyMessage.error) {
    return { message: "Error ocured while replying to messages" };
  }
  return { ...replyMessage, message: "Message sent successfully" };
};
const getUpdatedMessages = async ({ messageThreadID, pageAccessToken }) => {
  console.log(
    "messageThreadID",
    messageThreadID,
    "\n",
    "pageAccessToken",
    pageAccessToken
  );
  const conversations = await fetch(
    `https://graph.facebook.com/${messageThreadID}/messages?fields=id,created_time,from,to,message&access_token=${pageAccessToken}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
  if (conversations.error) {
    return { message: "Error ocured while fetching updated messages" };
  }
  return conversations;
};

module.exports = {
  userDetails,
  getMessages,
  getComments,
  replyComments,
  replyMessages,
  getUpdatedMessages,
};

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
  console.log(userDetails);

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

const getConversations = async ({ pageID, pageAccessToken }) => {
  const conversations = await fetch(
    `https://graph.facebook.com/${pageID}/conversations?fields=participants,messages{id,message,created_time,from,to},access_token=${pageAccessToken}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
  console.log(conversations);
  return conversations;
};

const operateOnConversations = (conversations) => {
  const cleanedData = conversations.data.map((conversation) => {
    participants: conversation.participants.data.map((participant) => {
      return {
        id: participant.id,
        name: participant.name,
      };
    });
    messages: conversation.messages.data.map((message) => {
      return {
        id: message.id,
        message: message.message,
        created_time: message.created_time,
        from: message.from,
        to: message.to,
      };
    });
    id: conversation.id;
  });
  //sort all the messages in the conversation array in descending order of time and the sort all the conversations in the array in descending order of time
  const sortedConversationArray = cleanedData.map((conversation) => {
    conversation.messages.sort((a, b) => {
      return new Date(b.created_time) - new Date(a.created_time);
    });
    conversation.sort((a, b) => {
      return (
        new Date(b.messages[0].created_time) -
        new Date(a.messages[0].created_time)
      );
    });
    return conversation;
  });

  // create a newConversationArray in messages and divided into many conversations if the messages are more than 24hrs apart and then sort the newConversationArray in descending order of time
  const newConversationArray = sortedConversationArray.map((conversation) => {
    const newConversation = [];
    for (let i = 0; i < conversation.messages.length; i++) {
      if (
        new Date(conversation.messages[i].created_time) -
          new Date(conversation.messages[i + 1].created_time) >
        24 * 60 * 60 * 1000
      ) {
        newConversation.push({
          participants: conversation.participants,
          messages: [conversation.messages[i]],
          id: conversation.id,
        });
      } else {
        newConversation[newConversation.length - 1].messages.push(
          conversation.messages[i]
        );
      }
    }
    newConversation.map((conversation) => {
      conversation.messages.sort((a, b) => {
        return new Date(b.created_time) - new Date(a.created_time);
      });
    });
    return newConversation;
  });

  return newConversationArray;
};

module.exports = {
  userDetails,
  getConversations,
  operateOnConversations,
};

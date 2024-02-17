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
const getMessages = async ({ pageID, pageAccessToken }) => {
  const conversations = await fetch(
    `https://graph.facebook.com/${pageID}/conversations?fields=participants,messages{id,message,created_time,from,to}&access_token=${pageAccessToken}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
  return conversations;
};

const operateOnMessages = (conversations) => {
  const cleanedData = conversations.data.map((conversation) => ({
    participants: conversation.participants.data.map((participant) => ({
      id: participant.id,
      name: participant.name,
    })),
    messages: conversation.messages.data.map((message) => ({
      id: message.id,
      message: message.message,
      created_time: message.created_time,
      from: message.from,
      to: message.to,
    })),
    id: conversation.id,
    type: "FACEBOOK DM",
  }));

  const sortedConversationArray = cleanedData
    .map((conversation) => {
      conversation.messages.sort(
        (a, b) => new Date(a.created_time) - new Date(b.created_time)
      );
      return { ...conversation, messages: conversation.messages };
    })
    .sort(
      (a, b) =>
        new Date(a.messages[0].created_time) -
        new Date(b.messages[0].created_time)
    );

  const newConversationArray = sortedConversationArray
    .map((conversation) => {
      const newConversation = [];
      let currentMessages = [];

      for (let i = 0; i < conversation.messages.length; i++) {
        if (
          i === 0 ||
          Math.abs(
            new Date(currentMessages[0].created_time) -
              new Date(conversation.messages[i].created_time)
          ) >
            24 * 60 * 60 * 1000
        ) {
          if (currentMessages.length > 0) {
            newConversation.push({
              participants: conversation.participants,
              messages: currentMessages,
              id: conversation.id,
            });
          }
          currentMessages = [conversation.messages[i]];
        } else {
          currentMessages.push(conversation.messages[i]);
        }
      }

      if (currentMessages.length > 0) {
        newConversation.push({
          participants: conversation.participants,
          messages: currentMessages,
          id: conversation.id,
          type: conversation.type,
        });
      }

      return newConversation.map((newConvItem) => ({
        ...newConvItem,
        messages: newConvItem.messages.sort(
          (a, b) => new Date(a.created_time) - new Date(b.created_time)
        ),
      }));
    })
    .flat();

  return newConversationArray;
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

const operateOnComments = (comments) => {
  const cleanedData = comments.data.map((item) => ({
    name: item.message,
    messages: item.comments.data.map((comment) => ({
      id: comment.id,
      message: comment.message,
      from: comment.from,
      created_time: comment.created_time,
    })),
    id: item.id,
    participants: [{ id: item.id, name: item.message }],
    type: "FACEBOOK POST",
  }));

  const sortedData = cleanedData.sort(
    (a, b) =>
      new Date(a.messages[0].created_time) -
      new Date(b.messages[0].created_time)
  );

  return sortedData;
};

// const operateOnComments = (data) => {
//   const cleanedData = data.map((item) => ({
//     message: item.message,
//     comments: item.comments.data.map((comment) => ({
//       id: comment.id,
//       message: comment.message,
//       from: comment.from,
//       created_time: comment.created_time,
//     })),
//     id: item.id,
//     type: "FACEBOOK POST",
//   }));

//   const sortedData = cleanedData.sort(
//     (a, b) =>
//       new Date(a.comments[0].created_time) -
//       new Date(b.comments[0].created_time)
//   );

//   const updatedData = sortedData.map((item) => ({
//     ...item,
//     comments: item.comments.map((comment) => ({
//       ...comment,
//       name: item.message, // Renaming 'message' attribute to 'name' for comments
//     })),
//   }));

//   return updatedData;
// };

module.exports = {
  userDetails,
  getMessages,
  operateOnMessages,
  getComments,
  operateOnComments,
};

// const operateOnConversations = (conversations) => {
//   const cleanedData = conversations.data.map((conversation) => ({
//     participants: conversation.participants.data.map((participant) => ({
//       id: participant.id,
//       name: participant.name,
//     })),
//     messages: conversation.messages.data.map((message) => ({
//       id: message.id,
//       message: message.message,
//       created_time: message.created_time,
//       from: message.from,
//       to: message.to,
//     })),
//     id: conversation.id,
//     type: "FACEBOOK DM",
//   }));

//   const sortedConversationArray = cleanedData
//     .map((conversation) => {
//       conversation.messages.sort(
//         (a, b) => new Date(b.created_time) - new Date(a.created_time)
//       );
//       return { ...conversation, messages: conversation.messages };
//     })
//     .sort(
//       (a, b) =>
//         new Date(b.messages[0].created_time) -
//         new Date(a.messages[0].created_time)
//     );

//   const newConversationArray = sortedConversationArray
//     .map((conversation) => {
//       const newConversation = [];
//       let currentMessages = [];

//       for (let i = 0; i < conversation.messages.length; i++) {
//         if (
//           i === 0 ||
//           Math.abs(
//             new Date(currentMessages[0].created_time) -
//               new Date(conversation.messages[i].created_time)
//           ) >
//             24 * 60 * 60 * 1000
//         ) {
//           if (currentMessages.length > 0) {
//             newConversation.push({
//               participants: conversation.participants,
//               messages: currentMessages,
//               id: conversation.id,
//             });
//           }
//           currentMessages = [conversation.messages[i]];
//         } else {
//           currentMessages.push(conversation.messages[i]);
//         }
//       }

//       if (currentMessages.length > 0) {
//         newConversation.push({
//           participants: conversation.participants,
//           messages: currentMessages,
//           id: conversation.id,
//           type: conversation.type,
//         });
//       }

//       return newConversation.map((newConvItem) => ({
//         ...newConvItem,
//         messages: newConvItem.messages.sort(
//           (a, b) => new Date(b.created_time) - new Date(a.created_time)
//         ),
//       }));
//     })
//     .flat();

//   return newConversationArray;
// };

//  find the index of messages that are 24hrs apart from each other
function findIndexOfMessagesWRTTime(messages, timeInHrs) {
  const indices = [];
  messages.forEach((message, index) => {
    if (index === messages.length - 1) return;
    if (
      new Date(message.created_time) -
        new Date(messages[index + 1].created_time) >
      timeInHrs * 60 * 60 * 1000
    ) {
      indices.push(index);
    }
  });
  indices.push(messages.length - 1);
  console.log("indices", indices);
  return indices;
}

//divide the messages into multiple array and put them in new conversation array
function divideAndCreateMessagesConvo(conversation, messageIndex) {
  const newConversation = [];
  let j = 0;
  messageIndex
    .sort((a, b) => a - b)
    .forEach((index) => {
      newConversation.push({
        participants: conversation.participants,
        id: conversation.id,
        type: conversation.type,
        messages: conversation.messages.slice(j, index + 1).reverse(),
      });
      j = index + 1;
    });
  return newConversation;
}

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
  console.log("cleanedData", cleanedData);

  if (cleanedData && cleanedData.length > 0) {
    const newConvo = [];
    cleanedData.forEach((conversation) => {
      const messageIndex = findIndexOfMessagesWRTTime(
        conversation.messages,
        24
      );
      newConvo.push(
        ...divideAndCreateMessagesConvo(conversation, messageIndex)
      );
    });
    return newConvo;
  } else {
    // Handle case where cleanedData.messages is empty or undefined
    console.log(
      "error in operateOnMessages: cleanedData.messages is empty or undefined."
    );
    return [];
  }
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

const operateOnUpdatedMessages = ({ messages, participants, id, type }) => {
  console.log("messages :", messages);
  const cleanedData = [
    {
      participants: participants,
      messages: messages.data.map((message) => ({
        id: message.id,
        message: message.message,
        created_time: message.created_time,
        from: message.from,
        to: message.to,
      })),
      id: id,
      type: type,
    },
  ];
  if (cleanedData && cleanedData.length > 0) {
    const newConvo = [];
    cleanedData.forEach((conversation) => {
      const messageIndex = findIndexOfMessagesWRTTime(
        conversation.messages,
        24
      );
      newConvo.push(
        ...divideAndCreateMessagesConvo(conversation, messageIndex)
      );
    });
    return newConvo;
  } else {
    // Handle case where cleanedData.messages is empty or undefined
    console.log(
      "error in operateOnUpdatedMessages: cleanedData.messages is empty or undefined."
    );
    return [];
  }
};

module.exports = {
  operateOnComments,
  operateOnMessages,
  operateOnUpdatedMessages,
};

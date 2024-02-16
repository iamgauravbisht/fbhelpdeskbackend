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

module.exports = {
  userDetails,
};

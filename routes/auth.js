const { Router } = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, FBUser } = require("../db");
const bcrypt = require("bcrypt");
const { userDetails } = require("../utils/pageutils");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const authRouter = Router();

const signupBody = zod.object({
  email: zod.string().email(),
  username: zod.string(),
  password: zod.string(),
});

authRouter.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs Error",
    });
  }

  const existingUser = await User.findOne({
    email: req.body.email,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken Error",
    });
  }

  req.body.password = await hashPassword(req.body.password);

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  const userId = user._id;

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});

const signinBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

authRouter.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs Error",
    });
  }

  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(411).json({
      message: "user not found Error",
    });
  }

  if (user) {
    if (bcrypt.compare(req.body.password, user.password) === false) {
      return res.status(411).json({
        message: "Incorrect password Error ",
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    return res.json({
      message: "success",
      token: token,
    });
  }
});

//fb auth
const fbauthBody = zod.object({
  userID: zod.string(),
  access_token: zod.string(),
});

authRouter.post("/fbauth", async (req, res) => {
  const { success } = fbauthBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs Error",
    });
  }

  const { pageDetails } = await userDetails(req.body);

  const user = await FBUser.findOne({
    userID: req.body.userID,
  });

  if (user) {
    await FBUser.findOneAndUpdate(
      { userID: req.body.userID },
      { pageDetails: pageDetails }
    ).then(() => {
      console.log("updated page details for fbuser");
      return res.status(200).json({
        message: "success",
      });
    });
  }

  if (!user) {
    const newUser = await FBUser.create({
      userID: req.body.userID,
      pageDetails: pageDetails,
    });

    if (!newUser) {
      return res.status(411).json({
        message: "problem with creating new fbuser Error",
      });
    }
    return res.status(200).json({
      message: "success",
    });
  }
});

// {
//   "data": [
//     {
//       "access_token": "EAAFbWRC9eREBO6JZACJfV4ZC8Oz5Qm49w0hvoZCpmokVU12zkm5KhVTJLMZConQN15WdqwLcBINZAgCJWgTBRS9w90vJ24A3jvIHi5jEyTrLaGrUvdViZAVQ0JcmgQhjuRaNFgxupN9TAtZC53HCx4oT3LZCyL8ppGCwL9dXCwRzJimDDaZA3qo9PFN4jgK6S15zgbZCs0KEgZD",
//       "category": "Software",
//       "category_list": [
//         {
//           "id": "2211",
//           "name": "Software"
//         }
//       ],
//       "name": "HelpDesk",
//       "id": "221671561038277",
//       "tasks": [
//         "ADVERTISE",
//         "ANALYZE",
//         "CREATE_CONTENT",
//         "MESSAGING",
//         "MODERATE",
//         "MANAGE"
//       ]
//     }
//   ],
//   "paging": {
//     "cursors": {
//       "before": "QVFIUjFXZAW9aTVZAoRUhCTkZADZAVZAqY0RSNXV4QUg0ZAUtWbDZANU1BvVXJWbHF0emxZAc3NBRXFUOGFiZAlV1TlAtZAzZAwb3lwdEhBVkd6Y0xLc2RaWTJFZA0I0QWRn",
//       "after": "QVFIUjFXZAW9aTVZAoRUhCTkZADZAVZAqY0RSNXV4QUg0ZAUtWbDZANU1BvVXJWbHF0emxZAc3NBRXFUOGFiZAlV1TlAtZAzZAwb3lwdEhBVkd6Y0xLc2RaWTJFZA0I0QWRn"
//     }
//   }
// }

module.exports = authRouter;

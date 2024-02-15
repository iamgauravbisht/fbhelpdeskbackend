const { Router } = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");

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

module.exports = authRouter;

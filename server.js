const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const pageRouter = require("./routes/page");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/page", pageRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

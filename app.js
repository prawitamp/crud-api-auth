const express = require("express");
const dotenv = require("dotenv");
const main_route = require("./src/routes");

const app = express();
dotenv.config();

app.use(express.json());

app.use("/api/v1", main_route);
app.use("/*", (req, res) => {
  res.status(404).send({
    status: "failed",
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = app;

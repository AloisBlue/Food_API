// imports
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

// local imports
import users from "./routes/users";
import menus from "./routes/menu";
import orders from "./routes/orders";

// app config
dotenv.config();
const app = express();

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded ({ extended: false }));
app.use('/uploads', express.static('uploads'));

// database connection
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));


// register endpoints
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
});

app.use("/api/users", users);
app.use("/api/menus", menus);
app.use("/api/orders", orders);

// handle errors
app.use((req, res, next) => {
  const error = new Error('Not found');
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
  next();
});

// setup port
const port = process.env.PORT || 8080;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

export default server;

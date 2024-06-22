/* import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let authentication = async () => {
  let db = await connect();
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
};
authentication();

export default {
  async registerUser(userData) {
    let db = await connect();
    console.log("Connected to database");

    const user = await db
      .collection("users")
      .findOne({ username: userData.username });
    console.log("Checked for existing user");

    if (user) {
      throw new Error("User already exists!");
    }

    const doc = {
      username: userData.username,
      password: await bcrypt.hash(userData.password, 8),
    };
    console.log("Hashed password");

    const result = await db.collection("users").insertOne(doc);
    console.log("Inserted new user");

    if (result.insertedId) {
      return { success: true, insertedId: result.insertedId };
    } else {
      throw new Error("Error during user registration");
    }
  },

  async authenticateUser(username, password) {
    let db = await connect();
    const user = await db.collection("users").findOne({ username });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password;
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return { token, username: user.username };
    } else {
      throw new Error("Cannot authenticate");
    }
  },

  verify(req, res, next) {
    try {
      const authorization = req.headers.authorization.split(" ");
      const type = authorization[0];
      const token = authorization[1];

      if (type !== "Bearer") {
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      }
    } catch (e) {
      return res.status(403).send();
    }
  },
};
 */

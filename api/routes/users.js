// imports
import express from "express";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// local imports
import User from "../models/User";
import { validateSignupInput, validateLoginInput } from "../validations/auth";
import auth from "../middleware/auth";

const router = express.Router();

// signup route
router.post("/signup", (req, res) => {
  const { errors, isValid } = validateSignupInput(req.body.addUser);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check if user exists
  User
    .findOne({ email: req.body.addUser.email })
    .then(userFound => {
      if (userFound) {
        errors.global = "Email already exists"
        return res.status(409).json(errors)
      }

      const avatar = gravatar.url(req.body.addUser.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      // destruct fields
      const { firstName, lastName, userName, email, password } = req.body.addUser

      const newUser = new User ({
        firstName,
        lastName,
        userName,
        email,
        avatar,
        password
      });

      // hash password and save user to DB
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.status(201).json({
              status: '201',
              message: 'You have successfully signed up',
              user: {
                confirmed: user.confirmed,
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email
              }
            }))
            .catch(() => {
              errors.userName = "User name already taken"
              return res.status(409).json(errors)
            });
        })
      })
    })
    .catch(err => {
      res.json(err)
    });
});

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body.credentials);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // destruct variables
  const { email, password } = req.body.credentials

  // check for the user in the database
  User
    .findOne({email})
    .then(userFound => {
      if (!userFound) {
        errors.global = "The credential do not match please confirm email and password"
        return res.status(401).json(errors);
      }

      // check password
      bcrypt
        .compare(password, userFound.password)
        .then(isMatch => {
          if (isMatch) {
            // set payload
            const payload = {
              _id: userFound._id,
              email: userFound.email,
              password: userFound.password,
              isAdmin: userFound.isAdmin
            }

            jwt.sign(payload, process.env.SECRET_KEY,
              { expiresIn: 3600 }, (err, token) => {
                return res.status(200).json({
                  status: '200',
                  message: `You have logged in as ${userFound.email}`,
                  token,
                  user: {
                    email: userFound.email,
                    name: userFound.name,
                    avatar: userFound.avatar
                  }
                })
              })
          } else {
            errors.global = "Invalid credentials"
            return res.status(401).json(errors);
          }
        })
        .catch(err => res.json(err));
    })
});

router.get("/current", auth, (req, res) => {
  User
    .findOne({ _id: req.user._id })
    .then(user => res.status(200).json({
      user: {
        _id: user._id,
        isAdmin: user.isAdmin,
        userName: user.userName,
        email: user.email
      }
    }))
    .catch(err => res.status(400).json(err));
});

export default router;

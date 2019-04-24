// imports
import express from "express";

// local imports
import auth from "../middleware/auth";
import User from "../models/User";
import Menu from "../models/Menu";
import Order from "../models/Order";
import validateOrderInput from "../validations/order";

const router = express.Router();

// @task: Make an order
// @Access: Private(Admin, User)
// @desc: Make a new order for food
router.post("/order", auth, (req, res) => {
  const { errors, isValid } = validateOrderInput(req.body.addOrder);
  if (!isValid) {
    return res.status(404).json(errors)
  }

  User
    .findOne({ _id: req.user._id })
    .then(user => {
      if (!user) {
        errors.global = "You are not authenticated. Log in first"
        return res.status(401).json(errors)
      }

      const { item, quantity } = req.body.addOrder;

      Menu
        .findOne({ item })
        .then(found => {
          if (!found) {
            errors.noitem = "Sorry, unfortunately we don't have that food item"
            return res.status(404).json(errors)
          }
          // continue
          const price = quantity * found.price

          const newOrder = new Order({
            user: user._id,
            item,
            quantity,
            price
          });

          // save
          newOrder
            .save()
            .then(order => res.status(201).json({
              "status": 201,
              order
            }))
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// @task: Get all orders as admin
// @Access: Private(Admin)
// @desc: Get a list of all orders
router.get("/orders", auth, (req, res) => {
  const errors = {};

  User
    .findOne({ _id: req.user._id })
    .then(user => {
      if (!user.isAdmin) {
        errors.global = "This is for admins only"
        return res.status(403).json(errors);
      }
      // get all
      Order
        .find()
        .select('_id user item quantity price status completed createdAt updatedAt')
        .populate('user', ['userName'])
        .then(orders => res.json({
          status: "200",
          count: orders.length,
          orders: orders.map(order => {
            return {
              id: order._id,
              user: order.user,
              item: order.item,
              quantity: order.quantity,
              price: order.price,
              status: order.status,
              completed: order.completed,
              createdAt: order.createdAt,
              updateAt: order.updatedAt,
              request: {
                type: 'GET',
                url: `http://127.0.0.1:8080/api/orders/order/${order._id}`
              }
            }
          })
        }))
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// @task: Get all orders as user
// @Access: Private(User)
// @desc: Get a list of all orders
router.get("/orders/user", auth, (req, res) => {
  const errors = {};

  User
    .findOne({ _id: req.user._id })
    .then(user => {
      if (!user) {
        errors.global = "You are not authorized"
        return res.status(401).json(errors);
      }
      // get all
      Order
        .find({ user: req.user._id })
        .select('_id user item quantity price status completed createdAt updatedAt')
        .populate('user', ['userName'])
        .then(orders => res.json({
          status: "200",
          count: orders.length,
          orders: orders.map(order => {
            return {
              id: order._id,
              user: order.user,
              item: order.item,
              quantity: order.quantity,
              price: order.price,
              status: order.status,
              completed: order.completed,
              createdAt: order.createdAt,
              updateAt: order.updatedAt,
              request: {
                type: 'GET',
                url: `http://127.0.0.1:8080/api/orders/order/${order._id}`
              }
            }
          })
        }))
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// @task: Get an order
// @Access: Private(Admin, User)
// @desc: Get an order belonging to a user
router.get("/order/:order_id", auth, (req, res) => {
  const errors = {};

  // get user
  User
    .findOne({ _id: req.user._id })
    .then(user => {
      if (!user) {
        errors.noauth = "You are not authenticated. Please login"
        return res.status(401).json(errors)
      }
      // find order
      Order
        .findById({ _id: req.params.order_id })
        .select('_id user item quantity price accepted completed createdAt updatedAt')
        .then(order => {
          // check if exists
          if (!order) {
            errors.noorder = "There is no order by that id"
            res.status(404).json(errors);
          }
          // check owner of the order and the admin
          if (order.user.toString() === req.user._id ||
              user.isAdmin) {
            res.status(200).json(order);
          }
          errors.notauthorized = "You are not authorized"
          return res.status(200).json(errors);
        })
        .catch(() => {
          errors.noorder = "There is no order by that id"
          res.status(404).json(errors);
        });
    })
    .catch(err => res.json(err));
});

// @task: Accept an order
// @Access: Private(Admin)
// @desc: Mark an order as accepted
router.post("/accept/:order_id", auth, (req, res) => {
  const errors = {};

  Order
    .findOne({ _id: req.params.order_id })
    .then(order => {
      // check if user is administrators
      if (!req.user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }
      // check if menu exists
      if (!order) {
        errors.noorder = "Order not found"
        return res.status(404).json(errors);
      }

      const accept = {
        status: {
          accepted: true
        }
      }

      Order
        .findOneAndUpdate({ _id: req.params.order_id }, accept, { new: true })
        .then(updated => res.json(updated))
        .catch(err => res.json(err));
    })
    .catch(() => {
      errors.noorder = "Order not found"
      return res.status(404).json(errors);
    })
});

// @task: Reject an order
// @Access: Private(Admin)
// @desc: Mark an order as rejected
router.post("/reject/:order_id", auth, (req, res) => {
  const errors = {};

  Order
    .findOne({ _id: req.params.order_id })
    .then(order => {
      // check if user is administrators
      if (!req.user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }
      // check if menu exists
      if (!order) {
        errors.noorder = "Order not found"
        return res.status(404).json(errors);
      }

      const reject = {
        status: {
          rejected: true
        }
      }

      Order
        .findOneAndUpdate({ _id: req.params.order_id }, reject, { new: true })
        .then(updated => res.json(updated))
        .catch(err => res.json(err));
    })
    .catch(() => {
      errors.noorder = "Order not found"
      return res.status(404).json(errors);
    })
});

// @task: Accept an order
// @Access: Private(Admin)
// @desc: Mark an order as accepted
router.post("/complete/:order_id", auth, (req, res) => {
  const errors = {};

  Order
    .findOne({ _id: req.params.order_id })
    .then(order => {
      // check if user is administrators
      if (!req.user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }
      // check if menu exists
      if (!order) {
        errors.noorder = "Order not found"
        return res.status(404).json(errors);
      }

      const complete = {
        completed: true
      }

      Order
        .findOneAndUpdate({ _id: req.params.order_id }, complete, { new: true })
        .then(completed => res.json(completed))
        .catch(err => res.json(err));
    })
    .catch(() => {
      errors.noorder = "Order not found"
      return res.status(404).json(errors);
    })
});

export default router;

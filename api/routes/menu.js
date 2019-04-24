// imports
import express from "express";
import multer from "multer";

// local imports
import auth from "../middleware/auth";
import User from "../models/User";
import Menu from "../models/Menu";
import validateMenuInput from "../validations/menus";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()  } ${  file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // reject or accept file
  if (file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    const imageError = new Error('File rejected')
    cb(imageError, false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 6
  },
  fileFilter
});

// @task: Add menu item
// @Access: Private(Admin)
// @desc: Admin to add menu item
router.post("/menu", auth, upload.single('menuImage'), (req, res) => {
  const { errors, isValid } = validateMenuInput(req.body.addMenu);
  if (!isValid) {
    return res.status(404).json(errors);
  }

  // check if user is admin
  User
    .findOne({ email: req.user.email })
    .then(user => {
      if (!user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }

      Menu
        .findOne({ item: req.body.addMenu.item })
        .then(found => {
          if (found) {
            errors.item = "That item already exists in the menu"
            return res.status(409).json(errors);
          }

          const { item, price, description } = req.body.addMenu;

          const menuImage = req.file.path

          const newMenu = new Menu({
            item,
            price,
            description,
            menuImage
          });

          // save to DB
          newMenu
            .save()
            .then(menu => res.status(201).json({
              status: '201',
              menu
            }))
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err))
    })
    .catch(err => res.json(err))
});

// @task: Get menu items
// @Access: Public
// @desc: Get all the menu items
router.get("/menu", (req, res) => {
  const errors = {};

  Menu
    .find()
    .select('_id item price description menuImage createdAt updateAt')
    .then(menus => {
      if (!menus) {
        errors.nomenus = "No menu available"
        return res.status(404).json(errors);
      }
      res.status(200).json({
        status: '200',
        count: menus.length,
        menu: menus.map(menu => {
          return {
            _id: menu._id,
            item: menu.item,
            price: menu.price,
            description: menu.description,
            menuImage: menu.menuImage,
            createdAt: menu.createdAt,
            updateAt: menu.updateAt,
            request: {
              type: 'GET',
              url: `http://127.0.0.1:8080/api/menus/menu/${menu._id}`
            }
          }
        })
      })

    })
    .catch(err => res.json(err))
})

// @task: Get single menu
// @Access: Public
// @desc: Get a single menu item by id
router.get("/menu/:menu_id", (req, res) => {
  const errors = {};

  Menu
    .findById(req.params.menu_id)
    .select('_id item price description menuImage createdAt updateAt')
    .then(menu => {
      if (!menu) {
        errors.nomenu = "No menu by that id"
        return res.status(404).json(errors);
      }
      res.status(200).json(menu);
    })
    .catch(() => {
      errors.nomenu = "No menu by that id"
      res.status(404).json(errors);
    });
});

// @task: Update a menu
// @Access: Private(Admin)
// @desc: Update a menu item by id
router.put("/menu/:menu_id", auth, (req, res) => {
  const errors = {};

  // check if user is admin
  User
    .findOne({ email: req.user.email })
    .then(user => {
      if (!user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }

      // find menu
      Menu
        .findOne({ _id: req.params.menu_id })
        .then(menu => {
          if (!menu) {
            errors.nomenu = "No menu by that id"
            return res.status(404).json(errors);
          }
          // update
          Menu
            .findOneAndUpdate({ _id: req.params.menu_id }, req.body.putMenu, { new: true })
            .then(updated => res.json(updated))
            .catch(err => res.json(err));
        })
        .catch(() => {
          errors.nomenu = "No menu by that id"
          res.status(404).json(errors);
        });
    })
    .catch(err => res.json(err));
});

// @task: Delete single menu
// @Access: Private(Admin)
// @desc: Delete a single menu item by id
router.delete("/menu/:menu_id", auth, (req, res) => {
  const errors = {};

  Menu
    .findOne({ _id: req.params.menu_id })
    .then(menu => {
      // check if user is administrators
      if (!req.user.isAdmin) {
        errors.global = "This is for administrators only"
        return res.status(401).json(errors);
      }
      // check if menu exists
      if (!menu) {
        errors.nomenu = "Either the menu is deleted or does not exist"
        return res.status(404).json(errors);
      }
      // delete menu
      menu
        .remove()
        .then(() => res.status(200).json({
          menu: "Menu was successfully deleted"
        }))
        .catch(err => res.json(err));
    })
    .catch(() => {
      errors.nomenu = "Either the menu is deleted or does not exist"
      return res.status(404).json(errors);
    })
});


export default router;

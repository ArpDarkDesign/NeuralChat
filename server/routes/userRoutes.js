const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const { uploadAvatar } = require("../controllers/userController");

router.post("/avatar/:userId", upload.single("avatar"), uploadAvatar);
const { deleteAccount } = require("../controllers/userController");

router.delete("/delete/:userId", deleteAccount);

module.exports = router;

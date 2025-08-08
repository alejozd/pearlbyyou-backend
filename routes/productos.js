const express = require("express");
const { getProductos } = require("../controllers/productosController");

const router = express.Router();

router.get("/", getProductos);

module.exports = router;

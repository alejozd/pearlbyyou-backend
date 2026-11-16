const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const orderController = require("../controllers/orderController");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/",
  [
    body("cliente_nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("cliente_whatsapp").trim().notEmpty().withMessage("El WhatsApp es obligatorio"),
    body("productos").isArray({ min: 1 }).withMessage("Debe incluir al menos un producto"),
    body("productos.*.id").isInt().withMessage("ID de producto inválido"),
    body("productos.*.cantidad").isInt({ min: 1 }).withMessage("La cantidad debe ser al menos 1"),
  ],
  validate,
  orderController.createOrder
);

module.exports = router;

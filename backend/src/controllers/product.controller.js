const Product = require("../models/Product");

// GET /products (public) — pagination + search
const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const query = {
    isDeleted: false,
    name: { $regex: search, $options: "i" },
  };

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    products,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
};

// GET /products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();

  if (!product || product.isDeleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// ADMIN: POST /admin/products
const createProduct = async (req, res) => {
  const { name, price, description, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price required" });
  }

  const images = req.files ? req.files.map((file) => file.path) : [];

  const product = await Product.create({
    name,
    price,
    description,
    stock,
    images,
    createdBy: req.user,
  });

  res.status(201).json(product);
};

// ADMIN: PUT /admin/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product) return res.sendStatus(404);

  const { name, price, description, stock } = req.body;

  if (name) product.name = name;
  if (price) product.price = price;
  if (description) product.description = description;
  if (stock !== undefined) product.stock = stock;

  if (req.files?.length) {
    product.images = req.files.map((file) => file.path);
  }

  await product.save();
  res.json(product);
};

// ADMIN: DELETE (soft delete)
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product) return res.sendStatus(404);

  product.isDeleted = true;
  await product.save();

  res.json({ message: "Product deleted" });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

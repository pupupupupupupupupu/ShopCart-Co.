const Product = require("../models/Product");

// GET /products  — public, paginated, searchable, filterable by category
const getProducts = async (req, res) => {
  const page     = Math.max(1, Number(req.query.page)  || 1);
  const limit    = Math.min(50, Number(req.query.limit) || 12);
  const search   = (req.query.search   || "").trim();
  const category = (req.query.category || "").trim();

  const query = { isDeleted: false };
  if (category) query.category = { $regex: category, $options: "i" };

  let sortOption = { createdAt: -1 };

  if (search) {
    // Try full-text search first; fall back to regex on the same request if it fails
    try {
      const textQuery = { ...query, $text: { $search: search } };
      const total = await Product.countDocuments(textQuery);
      const products = await Product.find(textQuery)
        .select("-reviews")
        .sort({ score: { $meta: "textScore" } })
        .skip((page - 1) * limit)
        .limit(limit);
      return res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch {
      // Text index not ready yet — fall back to regex
      query.name = { $regex: search, $options: "i" };
    }
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("-reviews")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page, total });
};

// GET /products/:id  — full doc including reviews
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product || product.isDeleted)
    return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// ADMIN — POST /products/admin
const createProduct = async (req, res) => {
  const { name, price, description, stock, category, tags } = req.body;

  if (!name || price === undefined)
    return res.status(400).json({ message: "Name and price are required" });

  const images = req.files ? req.files.map((f) => f.path) : [];

  const parsedTags =
    typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(tags) ? tags : [];

  const product = await Product.create({
    name, price: Number(price), description,
    stock: Number(stock) || 0,
    category: category?.trim() || "",
    tags: parsedTags,
    images,
    createdBy: req.user,
  });

  res.status(201).json(product);
};

// ADMIN — PUT /products/admin/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product || product.isDeleted)
    return res.status(404).json({ message: "Product not found" });

  const { name, price, description, stock, category, tags } = req.body;

  if (name        !== undefined) product.name        = name;
  if (price       !== undefined) product.price        = Number(price);
  if (description !== undefined) product.description  = description;
  if (stock       !== undefined) product.stock        = Number(stock);
  if (category    !== undefined) product.category     = category.trim();
  if (tags        !== undefined) {
    product.tags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(tags) ? tags : [];
  }

  if (req.files?.length) product.images = req.files.map((f) => f.path);

  await product.save();
  res.json(product);
};

// ADMIN — DELETE /products/admin/:id  (soft delete)
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product) return res.status(404).json({ message: "Product not found" });
  product.isDeleted = true;
  await product.save();
  res.json({ message: "Product deleted" });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

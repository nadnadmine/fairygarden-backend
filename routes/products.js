const express = require('express');
const { Product, ProductImage } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Import multer
const router = express.Router();
const { Op } = require('sequelize');

// Public: Get Products
router.get('/', async (req, res) => {
  const { category_id, is_active, search, sort, limit } = req.query;
  const where = {};
  
  // 1. Fitur Search (Pencarian Nama) - Sesuai Icon Kaca Pembesar
  if (search) {
      where.product_name = { [Op.iLike]: `%${search}%` }; // iLike = case insensitive (Postgres)
  }

  // 2. Filter Kategori
  if (category_id) where.category_id = category_id;
  
  // 3. Filter Aktif/Tidak
  if (is_active !== undefined) where.is_active = is_active === 'true';

  // 4. Sorting Logic
  let order = [['created_at', 'DESC']]; // Default: Terbaru

  // Sesuai Desain "SORT BY" (Highest Price)
  if (sort === 'price_desc') order = [['price', 'DESC']];
  if (sort === 'price_asc') order = [['price', 'ASC']];
  
  // Sesuai Desain Home "Most Popular" (Sort by Sold)
  if (sort === 'popular') order = [['sold', 'DESC']];

  try {
    // Limit query (misal cuma mau tampilkan 4 produk populer di Home)
    const queryOptions = {
        where,
        include: [{ model: ProductImage }],
        order: order
    };

    if (limit) queryOptions.limit = parseInt(limit);

    const products = await Product.findAll(queryOptions);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: ProductImage });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create Product + Upload Image
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  const { category_id, product_name, description, price, stock } = req.body;
  const imageFile = req.file; // File dari multer

  try {
    // 1. Buat Produk
    const product = await Product.create({ 
        category_id, product_name, description, price, stock, 
        image_url: imageFile ? imageFile.filename : null // Simpan nama file utama
    });

    // 2. Simpan ke tabel ProductImage juga (opsional, untuk galeri)
    if (imageFile) {
        await ProductImage.create({
            product_id: product.product_id,
            url: imageFile.filename,
            is_primary: true
        });
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Product.destroy({ where: { product_id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
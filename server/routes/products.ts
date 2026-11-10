import { Router } from 'express';
import { db } from '../db';

export const productsRouter = Router();

/**
 * GET /api/semesters
 * Fetch all published academic semesters (or all if query include_all=true with admin auth)
 */
productsRouter.get('/semesters', (req, res) => {
  try {
    const includeAll = req.query.include_all === 'true';
    const semesters = includeAll ? db.getSemesters() : db.getPublishedSemesters();
    res.json({
      success: true,
      semesters: semesters.sort((a, b) => a.semesterNumber - b.semesterNumber),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/products
 * Fetch published BCA question bank subjects
 */
productsRouter.get('/products', (req, res) => {
  try {
    const semesterId = req.query.semesterId as string;
    const includeAll = req.query.include_all === 'true';

    let products = includeAll ? db.getProducts() : db.getPublishedProducts();
    if (semesterId) {
      products = products.filter((p) => p.semesterId === semesterId);
    }

    // Sanitize products to not expose internal disk storage paths to public client
    const safeProducts = products.map((p) => ({
      id: p.id,
      semesterId: p.semesterId,
      subjectCode: p.subjectCode,
      subjectName: p.subjectName,
      description: p.description,
      syllabusHighlights: p.syllabusHighlights,
      price: p.price,
      originalPrice: p.originalPrice,
      pageCount: p.pageCount,
      fileSizeKb: p.fileSizeKb,
      examYear: p.examYear,
      published: p.published,
      updatedAt: p.updatedAt,
    }));

    res.json({
      success: true,
      products: safeProducts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/products/:id
 */
productsRouter.get('/products/:id', (req, res) => {
  try {
    const product = db.getProduct(req.params.id);
    if (!product || !product.published) {
      return res.status(404).json({ success: false, error: 'Product not found or unavailable' });
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        semesterId: product.semesterId,
        subjectCode: product.subjectCode,
        subjectName: product.subjectName,
        description: product.description,
        syllabusHighlights: product.syllabusHighlights,
        price: product.price,
        originalPrice: product.originalPrice,
        pageCount: product.pageCount,
        fileSizeKb: product.fileSizeKb,
        examYear: product.examYear,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

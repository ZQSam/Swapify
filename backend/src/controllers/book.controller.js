import { z } from "zod";
import { Book } from "../models/Book.model.js";

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  year: z.number().optional(),
  courseCode: z.string().min(1),
  courseName: z.string().optional(),
  term: z.string().optional(),
  section: z.string().optional(),
  price: z.number().positive(),
  condition: z.enum(['new', 'used']),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  meetingLocation: z.string().optional(),
});

export const createBook = async (req, res) => {
  const data = createBookSchema.parse(req.body);
  const book = await Book.create({
    ...data,
    owner: req.user._id
  });
  res.status(201).json({ book });
};

export const listBooks = async (req, res) => {
  const {
    search,
    courseCode,
    minPrice,
    maxPrice,
    condition,
    status = 'available',
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (courseCode) query.courseCode = new RegExp(courseCode, "i");
  if (condition) query.condition = condition;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { title: regex },
      { author: regex },
      { courseCode: regex }
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [books, total] = await Promise.all([
    Book.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'nickname averageRating'),
    Book.countDocuments(query)
  ]);

  res.json({
    books,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
};

export const getBook = async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('owner', 'nickname averageRating ratingCount avatar');

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.json({ book });
};

export const updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const updates = createBookSchema.partial().parse(req.body);
  Object.assign(book, updates);
  await book.save();

  res.json({ book });
};

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await book.deleteOne();
  res.json({ message: "Book deleted" });
};

export const getMyBooks = async (req, res) => {
  const books = await Book.find({ owner: req.user._id })
    .sort({ createdAt: -1 });
  res.json({ books });
};

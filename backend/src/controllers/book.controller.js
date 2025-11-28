import { z } from "zod";
import { Book } from "../models/Book.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";

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
  image: z.string().optional(),
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
      { courseCode: regex },
      { courseName: regex },
      { isbn: regex }
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [books, total] = await Promise.all([
    Book.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'nickname avatar bio'),
    Book.countDocuments(query)
  ]);

  // Attach rating stats to each owner and transform to seller
  const booksWithRatings = await Promise.all(
    books.map(async (book) => {
      const bookObj = book.toObject();
      if (bookObj.owner) {
        const ratings = await bookObj.owner.getRatingStats?.() || { averageRating: 0, ratingCount: 0 };
        bookObj.seller = {
          _id: bookObj.owner._id,
          nickname: bookObj.owner.nickname,
          avatar: bookObj.owner.avatar,
          bio: bookObj.owner.bio,
          ...ratings
        };
        delete bookObj.owner;
      }
      return bookObj;
    })
  );

  res.json({
    ok: true,
    books: booksWithRatings,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
};

export const getBook = async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('owner', 'nickname avatar bio');

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const bookObj = book.toObject();
  if (bookObj.owner) {
    const ratings = await book.owner.getRatingStats();
    bookObj.seller = {
      _id: bookObj.owner._id,
      nickname: bookObj.owner.nickname,
      avatar: bookObj.owner.avatar,
      bio: bookObj.owner.bio,
      ...ratings
    };
    delete bookObj.owner;
  }

  res.json({ ok: true, book: bookObj });
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

export const closeBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // Mark book as closed
  book.status = 'closed';
  await book.save();

  // Reject all pending purchase requests for this book
  await PurchaseRequest.updateMany(
    { book: book._id, status: 'pending' },
    { status: 'rejected' }
  );

  res.json({ message: "Book closed and all pending requests rejected", book });
};

export const getMyBooks = async (req, res) => {
  const books = await Book.find({ owner: req.user._id })
    .sort({ createdAt: -1 });
  res.json({ books });
};

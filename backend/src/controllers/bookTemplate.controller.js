import { BookTemplate } from "../models/BookTemplate.model.js";

export const searchTemplates = async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json({ suggestions: [] });
  }

  const regex = new RegExp(q.trim(), "i");
  const templates = await BookTemplate.find({
    $or: [
      { title: regex },
      { author: regex },
      { "commonCourses.code": regex }
    ]
  }).limit(parseInt(limit));

  const suggestions = templates.map(t => ({
    id: t._id,
    title: t.title,
    author: t.author,
    isbn: t.isbn || undefined,
    edition: t.edition,
    year: t.year,
    coverImage: t.coverImage,
    courseInfo: t.commonCourses[0] || null
  }));

  res.json({ suggestions });
};

export const getTemplate = async (req, res) => {
  const template = await BookTemplate.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  res.json({ template });
};

export const getAvailableTerms = async (req, res) => {
  try {
    const templates = await BookTemplate.find({});

    const termsSet = new Set();
    templates.forEach(template => {
      template.commonCourses.forEach(course => {
        if (course.term) {
          termsSet.add(course.term);
        }
      });
    });

    const terms = Array.from(termsSet).sort();
    res.json({ terms });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch terms" });
  }
};

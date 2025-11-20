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

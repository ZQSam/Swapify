import { Course } from "../models/Course.model.js";
import { BookTemplate } from "../models/BookTemplate.model.js";

export const listCourses = async (req, res) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json({ courses });
};

export const searchCourses = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json({ courses: [] });
  }

  const regex = new RegExp(q.trim(), "i");
  const courses = await Course.find({
    $or: [{ code: regex }, { name: regex }]
  }).limit(10);

  res.json({ courses });
};

export const getCoursesByTerm = async (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: "Term is required" });
  }

  try {
    // Find all book templates that have courses for this term
    const templates = await BookTemplate.find({
      "commonCourses.term": term
    });

    // Extract and deduplicate courses
    const coursesMap = new Map();

    templates.forEach(template => {
      template.commonCourses.forEach(course => {
        if (course.term === term) {
          const key = course.code;
          if (!coursesMap.has(key)) {
            coursesMap.set(key, {
              code: course.code,
              name: course.name
            });
          }
        }
      });
    });

    const courses = Array.from(coursesMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

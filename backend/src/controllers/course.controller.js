import { Course } from "../models/Course.model.js";

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

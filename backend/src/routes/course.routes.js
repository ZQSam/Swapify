import express from "express";
import * as courseController from "../controllers/course.controller.js";

const router = express.Router();

router.get("/by-term", courseController.getCoursesByTerm);
router.get("/search", courseController.searchCourses);
router.get("/", courseController.listCourses);

export default router;

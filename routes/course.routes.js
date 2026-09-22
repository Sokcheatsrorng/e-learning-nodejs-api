const express = require("express");
const courseController = require("../controllers/course.controller");
// const auth = require("../middlewares/auth");
// const { authorize } = require("../utils/role");
const upload = require("../middlewares/multerConfig");
const router = new express.Router();

// router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course and lesson management
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create one or multiple courses
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   thumbnail:
 *                     type: string
 *                     example: https://example.com/images/course-thumb.jpg
 *               - type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                       example: https://example.com/images/course-thumb.jpg
 *           examples:
 *             single:
 *               summary: Create a single course
 *               value:
 *                 title: "Intro to React"
 *                 description: "Learn the fundamentals of React"
 *                 thumbnail: "https://example.com/images/react-thumb.jpg"
 *             multiple:
 *               summary: Create multiple courses
 *               value:
 *                 - title: "Intro to React"
 *                   description: "Learn the fundamentals of React"
 *                   thumbnail: "https://example.com/images/react-thumb.jpg"
 *                 - title: "Advanced Next.js"
 *                   description: "Deep dive into Next.js"
 *                   thumbnail: "https://example.com/images/nextjs-thumb.jpg"
 *     responses:
 *       201:
 *         description: Course(s) created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", courseController.createCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", courseController.getCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get("/:id", courseController.getCourseById);

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 example: https://example.com/images/course-thumb.jpg
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 */
router.patch("/:id", courseController.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete("/:id", courseController.deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Enrolled successfully
 *       404:
 *         description: Course not found
 */
router.post("/:id/enroll", courseController.enrollInCourse);

/**
 * @swagger
 * /api/courses/{id}/materials:
 *   post:
 *     summary: Upload course material
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               materials:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Material uploaded successfully
 */
router.post(
  "/:id/materials",
  upload.single("materials"),
  courseController.uploadCourseMaterial
);

/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   get:
 *     summary: Get all lessons for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get("/:courseId/lessons", courseController.getCourseLessons);

/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   post:
 *     summary: Create one or multiple lessons within a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *               - type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *           examples:
 *             single:
 *               summary: Create a single lesson
 *               value:
 *                 title: "Introduction"
 *                 content: "Welcome to the course"
 *             multiple:
 *               summary: Create multiple lessons
 *               value:
 *                 - title: "Introduction"
 *                   content: "Welcome to the course"
 *                 - title: "Getting Started"
 *                   content: "Setting up your environment"
 *     responses:
 *       201:
 *         description: Lesson(s) created successfully, returned alongside course info
 *       404:
 *         description: Course not found
 */
router.post("/:courseId/lessons", courseController.createLesson);

/**
 * @swagger
 * /api/courses/{courseId}/lessons/{lessonId}:
 *   get:
 *     summary: Get a specific lesson within a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Returns the lesson along with its parent course info
 *       404:
 *         description: Lesson not found
 */
router.get("/:courseId/lessons/:lessonId", courseController.getLesson);

/**
 * @swagger
 * /api/courses/{courseId}/lessons/{lessonId}:
 *   patch:
 *     summary: Update a lesson within a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns the updated lesson along with its parent course info
 *       404:
 *         description: Lesson not found
 */
router.patch("/:courseId/lessons/:lessonId", courseController.updateLesson);

/**
 * @swagger
 * /api/courses/{courseId}/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson within a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 */
router.delete("/:courseId/lessons/:lessonId", courseController.deleteLesson);

module.exports = router;
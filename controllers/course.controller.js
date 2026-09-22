const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");


// Create Course (single or multiple)
const createCourse = async (req, res) => {
  try {
    const isArray = Array.isArray(req.body);
    const coursesData = isArray ? req.body : [req.body];

    // Validate each entry has required fields
    for (const item of coursesData) {
      if (!item.title || !item.description) {
        return res.status(400).json({
          error: "Each course must have a title and description.",
        });
      }
    }

    const coursesToCreate = coursesData.map((item) => ({
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      createdBy: req.user?._id,
    }));

    const createdCourses = await Course.insertMany(coursesToCreate);

    res
      .status(201)
      .json(isArray ? createdCourses : createdCourses[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  const _id = req.params.id;

  try {
    const course = await Course.findOne({ _id });

    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    res.status(200).send(course);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update course
const updateCourse = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description", "thumbnail"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const filter = { _id: req.params.id };
    if (req.user?._id) filter.createdBy = req.user._id;

    const course = await Course.findOne(filter);

    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    updates.forEach((update) => (course[update] = req.body[update]));
    await course.save();

    res.status(200).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user?._id) filter.createdBy = req.user._id;

    const course = await Course.findOneAndDelete(filter);

    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    res.status(200).send(course);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Enroll Course by Student
const enrollInCourse = async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user?._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    if (studentId && course.enrolledStudents.includes(studentId)) {
      return res
        .status(400)
        .send({ error: "Student already enrolled in this course" });
    }

    if (studentId) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    res
      .status(200)
      .send({ message: "Enrolled in course successfully", course });
  } catch (error) {
    res.status(500).send({ error: "Error enrolling in course" });
  }
};

const uploadCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    // Save the uploaded file's path to the course materials array
    course.materials.push(req.file.path);
    await course.save();

    res.status(201).send({
      message: "Course material uploaded successfully",
      path: req.file.path,
    });
  } catch (error) {
    res.status(500).send({ error: "Error uploading course material" });
  }
};

// Create course lesson(s)
const createLesson = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Ensure the user is the course creator (only checked if auth is active)
    if (
      req.user?._id &&
      course.createdBy &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const isArray = Array.isArray(req.body);
    const lessonsData = isArray ? req.body : [req.body];

    // Validate each entry has required fields
    for (const item of lessonsData) {
      if (!item.title || !item.content) {
        return res.status(400).json({
          error: "Each lesson must have a title and content.",
        });
      }
    }

    const lessonsToCreate = lessonsData.map((item) => ({
      title: item.title,
      content: item.content,
      course: courseId,
    }));

    const createdLessons = await Lesson.insertMany(lessonsToCreate);

    // Add all new lesson IDs to the course
    course.lessons.push(...createdLessons.map((lesson) => lesson._id));
    await course.save();

    res.status(201).json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        createdBy: course.createdBy,
        lessons: course.lessons,
      },
      lessons: isArray ? createdLessons : createdLessons[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.status(200).json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        createdBy: course.createdBy,
      },
      lesson,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { title, content } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (
      req.user?._id &&
      course.createdBy &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, course: courseId },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.status(200).json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        createdBy: course.createdBy,
      },
      lesson,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (
      req.user?._id &&
      course.createdBy &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const lesson = await Lesson.findOneAndDelete({
      _id: lessonId,
      course: courseId,
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    course.lessons = course.lessons.filter(
      (id) => id.toString() !== lessonId
    );
    await course.save();

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCourseLessons = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId).populate("lessons");
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseWithLessons = {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      createdBy: course.createdBy,
      lessons: course.lessons,
    };

    res.status(200).json(courseWithLessons);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  uploadCourseMaterial,
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  getCourseLessons,
};
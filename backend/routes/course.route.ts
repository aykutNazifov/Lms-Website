import express from 'express'
import { addQestion, addReview, editCourse, getAllCourses, getCourseByUser, getSingleCourse, replyToQuestion, replyToReview, uploadCourse } from '../controllers/course.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';

const courseRouter = express.Router()

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse)
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse)
courseRouter.get("/get-course/:id", getSingleCourse)
courseRouter.get("/get-all-courses", getAllCourses)
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser)
courseRouter.put("/add-question", isAuthenticated, addQestion)
courseRouter.put("/add-question-reply", isAuthenticated, replyToQuestion)
courseRouter.put("/add-review/:id", isAuthenticated, addReview)
courseRouter.put("/add-review-reply/:id", isAuthenticated, authorizeRoles("admin"), replyToReview)

export default courseRouter;
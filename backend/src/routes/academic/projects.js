const express = require('express');
const router = express.Router();
const {
    getProjects, getProject, createProject, updateProject, deleteProject,
    addMember, removeMember, exportCSV
} = require('../../controllers/academic/projects');
const { projectValidation, projectUpdateValidation } = require('../../middleware/validators/projectValidator');
const { protect, authorize } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

// CSV export (before :id routes to avoid conflict)
router.get('/export/csv', authorize('admin'), exportCSV);

// Project CRUD
router.route('/')
    .get(getProjects)
    .post(authorize('admin', 'lecturer', 'student'), projectValidation, createProject);

router.route('/:id')
    .get(getProject)
    .put(authorize('admin', 'lecturer'), projectUpdateValidation, updateProject)
    .delete(authorize('admin'), deleteProject);

// Member management
router.post('/:id/members', authorize('admin', 'lecturer'), addMember);
router.delete('/:id/members/:regNo', authorize('admin', 'lecturer'), removeMember);

module.exports = router;

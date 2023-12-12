const express = require('express')
const {
	getTeatros,
	getTeatro,
	createTeatro,
	updateTeatro,
	deleteTeatro,
	getUnreleasedTeatros
} = require('../controllers/teatroController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getTeatros).post(protect, authorize('admin'), createTeatro)
router.route('/unreleased').get(protect, authorize('admin'), getUnreleasedTeatros)
router
	.route('/:id')
	.get(getTeatro)
	.put(protect, authorize('admin'), updateTeatro)
	.delete(protect, authorize('admin'), deleteTeatro)

module.exports = router

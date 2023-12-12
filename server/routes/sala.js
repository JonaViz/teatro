const express = require('express')
const {
	getSalas,
	getSala,
	createSala,
	updateSala,
	deleteSala,
	getSalaByObra,
	getUnreleasedSala,
	getUnreleasedSalaByObra
} = require('../controllers/salaController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getSalas).post(protect, authorize('admin'), createSala)
router.route('/unreleased/:id').get(protect, authorize('admin'), getUnreleasedSala)
router.route('/obra/unreleased/:mid/:date/:timezone').get(protect, authorize('admin'), getUnreleasedSalaByObra)
router.route('/obra/:mid/:date/:timezone').get(getSalaByObra)
router
	.route('/:id')
	.get(getSala)
	.put(protect, authorize('admin'), updateSala)
	.delete(protect, authorize('admin'), deleteSala)

module.exports = router

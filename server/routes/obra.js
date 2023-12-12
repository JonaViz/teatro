const express = require('express')
const {
	getObras,
	getObra,
	createObra,
	updateObra,
	deleteObra,
	getShowingObras,
	getUnreleasedShowingObras
} = require('../controllers/obraController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getObras).post(protect, authorize('admin'), createObra)
router.route('/showing').get(getShowingObras)
router.route('/unreleased/showing').get(protect, authorize('admin'), getUnreleasedShowingObras)
router
	.route('/:id')
	.get(getObra)
	.put(protect, authorize('admin'), updateObra)
	.delete(protect, authorize('admin'), deleteObra)

module.exports = router

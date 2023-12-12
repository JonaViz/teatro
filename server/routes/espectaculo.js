const express = require('express')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')
const {
	addEspectaculo,
	getEspectaculo,
	deleteEspectaculo,
	compra,
	deletePreviousEspectaculo,
	getEspectaculos,
	deleteEspectaculos,
	getEspectaculoWithUser,
	getUnreleasedEspectaculos,
	updateEspectaculo
} = require('../controllers/espectaculoController')

router
	.route('/')
	.get(getEspectaculos)
	.post(protect, authorize('admin'), addEspectaculo)
	.delete(protect, authorize('admin'), deleteEspectaculos)
router.route('/unreleased').get(protect, authorize('admin'), getUnreleasedEspectaculos)
router.route('/previous').delete(protect, authorize('admin'), deletePreviousEspectaculo)
router.route('/user/:id').get(protect, authorize('admin'), getEspectaculoWithUser)
router
	.route('/:id')
	.get(getEspectaculo)
	.post(protect, compra)
	.put(protect, authorize('admin'), updateEspectaculo)
	.delete(protect, authorize('admin'), deleteEspectaculo)

module.exports = router

const Teatro = require('../models/Teatro')

//@desc     GET all teatros
//@route    GET /teatro
//@access   Public
exports.getTeatros = async (req, res, next) => {
	try {
		const teatros = await Teatro.find()
			.populate({
				path: 'salas',
				populate: {
					path: 'espectaculos',
					populate: { path: 'obra', select: 'name length' },
					select: 'obra espectaculo isRelease'
				},
				select: 'number seatPlan espectaculos'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })
			.then((teatros) => {
				teatros.forEach((teatro) => {
					teatro.salas.forEach((sala) => {
						sala.espectaculos = sala.espectaculos.filter((espectaculo) => espectaculo.isRelease)
					})
				})
				return teatros
			})

		res.status(200).json({ success: true, count: teatros.length, data: teatros })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET all teatros with all unreleased espectaculo
//@route    GET /teatro/unreleased
//@access   Private admin
exports.getUnreleasedTeatros = async (req, res, next) => {
	try {
		const teatros = await Teatro.find()
			.populate({
				path: 'salas',
				populate: {
					path: 'espectaculos',
					populate: { path: 'obra', select: 'name length' },
					select: 'obra espectaculo isRelease'
				},
				select: 'number seatPlan espectaculos'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })

		res.status(200).json({ success: true, count: teatros.length, data: teatros })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single teatro
//@route    GET /teatro/:id
//@access   Public
exports.getTeatro = async (req, res, next) => {
	try {
		const teatro = await Teatro.findById(req.params.id)
			.populate({
				path: 'salas',
				populate: {
					path: 'espectaculos',
					populate: { path: 'obra', select: 'name length' },
					select: 'obra espectaculo isRelease'
				},
				select: 'number seatPlan espectaculos'
			})
			.then((teatros) => {
				teatros.forEach((teatro) => {
					teatro.salas.forEach((sala) => {
						sala.espectaculos = sala.espectaculos.filter((espectaculo) => espectaculo.isRelease)
					})
				})
				return teatros
			})

		if (!teatro) {
			return res.status(400).json({ success: false, message: `teatro not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: teatro })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create teatro
//@route    POST /teatro
//@access   Private
exports.createTeatro = async (req, res, next) => {
	try {
		const teatro = await Teatro.create(req.body)
		res.status(201).json({
			success: true,
			data: teatro
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update teatros
//@route    PUT /teatro/:id
//@access   Private Admin
exports.updateTeatro = async (req, res, next) => {
	try {
		const teatro = await Teatro.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!teatro) {
			return res.status(400).json({ success: false, message: `teatro not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: teatro })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single teatro
//@route    DELETE /teatro/:id
//@access   Private Admin
exports.deleteTeatro = async (req, res, next) => {
	try {
		const teatro = await Teatro.findById(req.params.id)

		if (!teatro) {
			return res.status(400).json({ success: false, message: `teatro not found with id of ${req.params.id}` })
		}

		await teatro.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

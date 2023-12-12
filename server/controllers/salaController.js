const Teatro = require('../models/Teatro')
const Sala = require('../models/Sala')

//@desc     GET all salas
//@route    GET /sala
//@access   Public
exports.getSalas = async (req, res, next) => {
	try {
		const salas = await Sala.find()
			.populate([
				{ path: 'espectaculos', select: 'obra espectaculo isRelease' },
				{ path: 'teatro', select: 'name' }
			])
			.then((salas) => {
				salas.forEach((sala) => {
					sala.espectaculos = sala.espectaculos.filter((espectaculo) => espectaculo.isRelease)
				})
				return salas
			})

		res.status(200).json({ success: true, count: salas.length, data: salas })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single sala
//@route    GET /sala/:id
//@access   Public
exports.getSala = async (req, res, next) => {
	try {
		const sala = await Sala.findById(req.params.id)
			.populate([
				{ path: 'espectaculos', select: 'obra espectaculo isRelease' },
				{ path: 'teatro', select: 'name' }
			])
			.then((sala) => {
				sala.espectaculos = sala.espectaculos.filter((espectaculo) => espectaculo.isRelease)
				return sala
			})

		if (!sala) {
			return res.status(400).json({ success: false, message: `sala not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: sala })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single sala with all unreleased espectaculo
//@route    GET /sala/unreleased/:id
//@access   Private admin
exports.getUnreleasedSala = async (req, res, next) => {
	try {
		const sala = await Sala.findById(req.params.id).populate([
			{ path: 'espectaculos', select: 'obra espectaculo isRelease' },
			{ path: 'teatro', select: 'name' }
		])

		if (!sala) {
			return res.status(400).json({ success: false, message: `sala not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: sala })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET salas by obra and date
//@route    GET /sala/obra/:mid/:date/:timezone
//@access   Public
exports.getSalaByObra = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let salas = await Sala.find()
			.populate([
				{
					path: 'espectaculos',
					populate: { path: 'obra', select: 'name _id' },
					select: 'obra espectaculo isRelease'
				},
				{ path: 'teatro', select: 'name' }
			])
			.then((salas) => {
				salas.forEach((sala) => {
					sala.espectaculos = sala.espectaculos.filter((espectaculo) => espectaculo.isRelease)
				})
				return salas
			})

		salas = salas.filter((sala) => {
			return sala.espectaculos.some((espectaculo) => {
				const d1 = new Date(espectaculo.espectaculo)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					espectaculo.obra._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(200).json({ success: true, data: salas })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET salas by obra and date with all unreleased espectaculo
//@route    GET /sala/obra/unreleased/:mid/:date/:timezone
//@access   Private admin
exports.getUnreleasedSalaByObra = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let salas = await Sala.find().populate([
			{
				path: 'espectaculos',
				populate: { path: 'obra', select: 'name _id' },
				select: 'obra espectaculo isRelease'
			},
			{ path: 'teatro', select: 'name' }
		])

		salas = salas.filter((sala) => {
			return sala.espectaculos.some((espectaculo) => {
				const d1 = new Date(espectaculo.espectaculo)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					espectaculo.obra._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(200).json({ success: true, data: salas })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create sala
//@route    POST /sala
//@access   Private
exports.createSala = async (req, res, next) => {
	try {
		const { teatro: teatroId, row, column } = req.body
		const rowRegex = /^([A-D][A-Z]|[A-Z])$/
		if (!rowRegex.test(row)) {
			return res.status(400).json({ success: false, message: `Row is not a valid letter between A to CZ` })
		}

		if (column < 1 || column > 120) {
			return res.status(400).json({ success: false, message: `Column is not a valid number between 1 to 250` })
		}

		const teatro = await Teatro.findById(teatroId)

		if (!teatro) {
			return res.status(400).json({ success: false, message: `teatro not found with id of ${teatroId}` })
		}

		const sala = await Sala.create({ teatro, number: teatro.salas.length + 1, seatPlan: { row, column } })

		teatro.salas.push(sala._id)

		await teatro.save()

		res.status(201).json({
			success: true,
			data: sala
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update salas
//@route    PUT /sala/:id
//@access   Private Admin
exports.updateSala = async (req, res, next) => {
	try {
		const sala = await Sala.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!sala) {
			return res.status(400).json({ success: false, message: `sala not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: sala })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single salas
//@route    DELETE /sala/:id
//@access   Private Admin
exports.deleteSala = async (req, res, next) => {
	try {
		const sala = await Sala.findById(req.params.id)

		if (!sala) {
			return res.status(400).json({ success: false, message: `sala not found with id of ${req.params.id}` })
		}

		await sala.deleteOne()

		await Teatro.updateMany({ salas: sala._id }, { $pull: { salas: sala._id } })

		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

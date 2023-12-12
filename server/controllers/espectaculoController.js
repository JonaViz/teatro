const Obra = require('../models/Obra')
const Espectaculo = require('../models/Espectaculo')
const Sala = require('../models/Sala')
const User = require('../models/User')

//@desc     GET espectaculos
//@route    GET /espectaculo
//@access   Public
exports.getEspectaculos = async (req, res, next) => {
	try {
		const espectaculos = await Espectaculo.find({ isRelease: true })
			.populate([
				'obra',
				{ path: 'sala', populate: { path: 'teatro', select: 'name' }, select: 'number teatro seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: espectaculos.length, data: espectaculos })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET espectaculos with all unreleased espectaculo
//@route    GET /espectaculo/unreleased
//@access   Private admin
exports.getUnreleasedEspectaculos = async (req, res, next) => {
	try {
		const espectaculos = await Espectaculo.find()
			.populate([
				'obra',
				{ path: 'sala', populate: { path: 'teatro', select: 'name' }, select: 'number teatro seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: espectaculos.length, data: espectaculos })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single espectaculo
//@route    GET /espectaculo/:id
//@access   Public
exports.getEspectaculo = async (req, res, next) => {
	try {
		const espectaculo = await Espectaculo.findById(req.params.id)
			.populate([
				'obra',
				{ path: 'sala', populate: { path: 'teatro', select: 'name' }, select: 'number teatro seatPlan' }
			])
			.select('-seats.user')

		if (!espectaculo) {
			return res.status(400).json({ success: false, message: `Espectaculo not found with id of ${req.params.id}` })
		}

		if (!espectaculo.isRelease) {
			return res.status(400).json({ success: false, message: `Espectaculo is not released` })
		}

		res.status(200).json({ success: true, data: espectaculo })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single espectaculo with user
//@route    GET /espectaculo/user/:id
//@access   Private Admin
exports.getEspectaculoWithUser = async (req, res, next) => {
	try {
		const espectaculo = await Espectaculo.findById(req.params.id).populate([
			'obra',
			{ path: 'sala', populate: { path: 'teatro', select: 'name' }, select: 'number teatro seatPlan' },
			{ path: 'seats', populate: { path: 'user', select: 'username email role' } }
		])

		if (!espectaculo) {
			return res.status(400).json({ success: false, message: `Espectaculo not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: espectaculo })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Add espectaculo
//@route    POST /espectaculo
//@access   Private
exports.addEspectaculo = async (req, res, next) => {
	try {
		const { obra: obraId, espectaculo: espectaculoString, sala: salaId, repeat = 1, isRelease } = req.body

		if (repeat > 31 || repeat < 1) {
			return res.status(400).json({ success: false, message: `Repeat is not a valid number between 1 to 31` })
		}

		let espectaculo = new Date(espectaculoString)
		let espectaculos = []
		let espectaculoIds = []

		const sala = await Sala.findById(salaId)

		if (!sala) {
			return res.status(400).json({ success: false, message: `sala not found with id of ${req.params.id}` })
		}

		const obra = await Obra.findById(obraId)

		if (!obra) {
			return res.status(400).json({ success: false, message: `Obra not found with id of ${obraId}` })
		}

		for (let i = 0; i < repeat; i++) {
			const espectaculoDoc = await Espectaculo.create({ sala, obra: obra._id, espectaculo, isRelease })

			espectaculoIds.push(espectaculoDoc._id)
			espectaculos.push(new Date(espectaculo))
			espectaculo.setDate(espectaculo.getDate() + 1)
		}
		sala.espectaculos = sala.espectaculos.concat(espectaculoIds)

		await sala.save()

		res.status(200).json({
			success: true,
			espectaculos: espectaculos
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Compra seats
//@route    POST /espectaculo/:id
//@access   Private
exports.compra = async (req, res, next) => {
	try {
		const { seats } = req.body
		const user = req.user

		const espectaculo = await Espectaculo.findById(req.params.id).populate({ path: 'sala', select: 'seatPlan' })

		if (!espectaculo) {
			return res.status(400).json({ success: false, message: `Espectaculo not found with id of ${req.params.id}` })
		}

		const isSeatValid = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			const maxRow = espectaculo.sala.seatPlan.row
			const maxCol = espectaculo.sala.seatPlan.column

			if (maxRow.length !== row.length) {
				return maxRow.length > row.length
			}

			return maxRow.localeCompare(row) >= 0 && number <= maxCol
		})

		if (!isSeatValid) {
			return res.status(400).json({ success: false, message: 'Seat is not valid' })
		}

		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !espectaculo.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Seat not available' })
		}

		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		espectaculo.seats.push(...seatUpdates)
		const updatedEspectaculo = await espectaculo.save()

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$push: { tickets: { espectaculo, seats: seatUpdates } }
			},
			{ new: true }
		)

		res.status(200).json({ success: true, data: updatedEspectaculo, updatedUser })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update espectaculo
//@route    PUT /espectaculo/:id
//@access   Private Admin
exports.updateEspectaculo = async (req, res, next) => {
	try {
		const espectaculo = await Espectaculo.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!espectaculo) {
			return res.status(400).json({ success: false, message: `Espectaculo not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: espectaculo })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single espectaculo
//@route    DELETE /espectaculo/:id
//@access   Private Admin
exports.deleteEspectaculo = async (req, res, next) => {
	try {
		const espectaculo = await Espectaculo.findById(req.params.id)

		if (!espectaculo) {
			return res.status(400).json({ success: false, message: `Espectaculo not found with id of ${req.params.id}` })
		}

		await espectaculo.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete espectaculos
//@route    DELETE /espectaculo
//@access   Private Admin
exports.deleteEspectaculos = async (req, res, next) => {
	try {
		const { ids } = req.body

		let espectaculosIds

		if (!ids) {
			// Delete all espectaculos
			espectaculosIds = await Espectaculo.find({}, '_id')
		} else {
			// Find espectaculos based on the provided IDs
			espectaculosIds = await Espectaculo.find({ _id: { $in: ids } }, '_id')
		}

		for (const espectaculoId of espectaculosIds) {
			await espectaculoId.deleteOne()
		}

		res.status(200).json({ success: true, count: espectaculosIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete previous day espectaculo
//@route    DELETE /espectaculo/previous
//@access   Private Admin
exports.deletePreviousEspectaculo = async (req, res, next) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0)

		const espectaculosIds = await Espectaculo.find({ espectaculo: { $lt: currentDate } }, '_id')

		for (const espectaculoId of espectaculosIds) {
			await espectaculoId.deleteOne()
		}

		res.status(200).json({ success: true, count: espectaculosIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

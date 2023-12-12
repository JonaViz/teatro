const Obra = require('../models/Obra')
const Espectaculo = require('../models/Espectaculo')

//@desc     GET all obras
//@route    GET /obra
//@access   Public
exports.getObras = async (req, res, next) => {
	try {
		const obras = await Obra.find().sort({ createdAt: -1 })
		res.status(200).json({ success: true, count: obras.length, data: obras })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showing obras
//@route    GET /obra/showing
//@access   Public
exports.getShowingObras = async (req, res, next) => {
	try {
		const showingEspectaculo = await Espectaculo.aggregate([
			{ $match: { espectaculo: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'obras', // Replace "obras" with the actual collection name of your obras
					localField: 'obra',
					foreignField: '_id',
					as: 'obra'
				}
			},
			{
				$group: {
					_id: '$obra',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingEspectaculo })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showing obras with all unreleased espectaculo
//@route    GET /obra/unreleased/showing
//@access   Private admin
exports.getUnreleasedShowingObras = async (req, res, next) => {
	try {
		const showingEspectaculo = await Espectaculo.aggregate([
			{ $match: { espectaculo: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'obras', // Replace "obras" with the actual collection name of your obras
					localField: 'obra',
					foreignField: '_id',
					as: 'obra'
				}
			},
			{
				$group: {
					_id: '$obra',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1, updatedAt: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingEspectaculo })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single obra
//@route    GET /obra/:id
//@access   Public
exports.getObra = async (req, res, next) => {
	try {
		const obra = await Obra.findById(req.params.id)

		if (!obra) {
			return res.status(400).json({ success: false, message: `obra not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: obra })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create obra
//@route    POST /obra
//@access   Private
exports.createObra = async (req, res, next) => {
	try {
		const obra = await Obra.create(req.body)
		res.status(201).json({
			success: true,
			data: obra
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update obras
//@route    PUT /obra/:id
//@access   Private Admin
exports.updateObra = async (req, res, next) => {
	try {
		const obra = await Obra.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!obra) {
			return res.status(400).json({ success: false, message: `obra not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: obra })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single obras
//@route    DELETE /obra/:id
//@access   Private Admin
exports.deleteObra = async (req, res, next) => {
	try {
		const obra = await Obra.findById(req.params.id)

		if (!obra) {
			return res.status(400).json({ success: false, message: `obra not found with id of ${req.params.id}` })
		}

		await obra.deleteOne()
		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

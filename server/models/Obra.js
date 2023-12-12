const mongoose = require('mongoose')

const obraSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a obra name'],
			trim: true
		},
		length: {
			type: Number,
			required: [true, 'Please add a obra length']
		},
		img: {
			type: String,
			required: [true, 'Please add a obra img'],
			trim: true
		}
	},
	{ timestamps: true }
)

obraSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const obraId = this._id
	const espectaculos = await this.model('Espectaculo').find({ obra: obraId })

	for (const espectaculo of espectaculos) {
		await espectaculo.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Obra', obraSchema)

const mongoose = require('mongoose')

const salaSchema = new mongoose.Schema({
	teatro: { type: mongoose.Schema.ObjectId, ref: 'Teatro' },
	number: { type: Number, required: true },
	seatPlan: {
		row: {
			type: String,
			maxlength: 2,
			required: [true, 'Please add a seatPlan row']
		},
		column: {
			type: Number,
			required: [true, 'Please add a seatPlan column']
		},
		
	},
	precio:{type:Number, required: false},
	espectaculos: [{ type: mongoose.Schema.ObjectId, ref: 'Espectaculo' }]
})

salaSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const espectaculos = await this.model('Espectaculo').find({ _id: { $in: this.espectaculos } })

	for (const espectaculo of espectaculos) {
		await espectaculo.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Sala', salaSchema)

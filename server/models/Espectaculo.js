const mongoose = require('mongoose')

const espectaculoSchema = new mongoose.Schema({
	sala: { type: mongoose.Schema.ObjectId, ref: 'Sala' },
	obra: { type: mongoose.Schema.ObjectId, ref: 'Obra' },
	espectaculo: Date,
	seats: [
		{
			row: { type: String, required: [true, 'Please add a seat row'] },
			number: { type: Number, required: [true, 'Please add a seat number'] },
			
			user: { type: mongoose.Schema.ObjectId, ref: 'User' }
		}
	],
	isRelease: Boolean
})

espectaculoSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const espectaculoId = this._id
	await this.model('User').updateMany(
		{ 'tickets.espectaculo': espectaculoId },
		{ $pull: { tickets: { espectaculo: espectaculoId } } }
	)
	next()
})

module.exports = mongoose.model('Espectaculo', espectaculoSchema)

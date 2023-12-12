const mongoose = require('mongoose')

const teatroSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			unique: true,
			required: [true, 'Please add a name']
		},
		salas: [{ type: mongoose.Schema.ObjectId, ref: 'Sala' }]
	},
	{ timestamps: true }
)

teatroSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	// Remove salas associated with the teatro being deleted
	const salas = await this.model('Salas').find({ _id: { $in: this.salas } })

	for (const sala of salas) {
		await sala.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Teatro', teatroSchema)

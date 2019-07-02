const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema
const URLSchema = new Schema({
	url: {
		type: String,
	},
	maxPrice: {
		type: Number,
	},
	toEmail: {
		type: String,
	},
});

// Create a model
const URLs = mongoose.model('url', URLSchema);

// Export the model
module.exports = URLs;

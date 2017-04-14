// movies database schema for movie review for homework5
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Review = new Schema ({
	movieTitle : { type: String, required: true },
	reviewer: { type: String, required: true },
	star: { type: Number, required: true },
	review: { type: String, required: true },
	seeReview: {type: Boolean, default: false}
	});
	
module.exports = mongoose.model('Review', Review);
// movies database schema for homework4
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Movie = new Schema ({
	title : { type: String, required: true, unique: true, index: {unique: true} },
	year: { type: Number, required: true },
	actor: { type: Array, "default" : [], required: true }
	});
	
module.exports = mongoose.model('Movie', Movie);
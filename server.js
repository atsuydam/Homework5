// load the express package and create our app
var express = require('express');
var app 	= express();
var path 	= require('path');
// body parser allows us to pull post content?
// app.body use the body parser
var bodyParser = require('body-parser');
var morgan 	= require('morgan');
//adding mongoose so we can use our database
var mongoose = require('mongoose');

// for local testing
//mongoose.connect('mongodb://localhost/test');

// connect to the database at mongolab.
mongoose.connect('mongodb://AwesomeAmanda:dave4275@ds143980.mlab.com:43980/movies');

// ok, declare a movie variable from the schema, or link to it
var Movie = require('./app/models/movie');
// declare the new review schema
var Review = require('./app/models/review');

// Test for a successful connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('connected successfully');
});

//body parser
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	//not entirely confident on these since they are bring up undefined but from the book
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	next();
});

// this is to log things to the console per the book, not sure it's needed
app.use(morgan('dev'));
//send out index.html to the user for the home page
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

// get all the movies in the database collection
var apiRouter = express.Router();

apiRouter.use(function(req, res, next){
	// logging
	console.log('Someone is visiting the movie api');
	next();
});
apiRouter.get('/', function( req, res){
	res.json({message: "Hello"});
});
apiRouter.route('/movies')
	.post(function(req, res, next){
		var movie = new Movie();

		movie.title = req.body.title;
		if (!movie.title) {
			return res.json ({message: "Error: Movie title required"});
		}
		movie.year = req.body.year;
		if (!movie.year) {
		 	return res.json ({message: "Error: Year required"});
		 }
		movie.actor = req.body.actor;
		if (!movie.actor) {
			return res.json ({message: "Error: Actor required"});
		}
		console.log(movie.title, movie.year, movie.actor);
		movie.save(function(err) {
            if (err) {
                if (err.code === 11000)
                    return res.json({success: false, message: "That movie already exist"});
                else
                    return res.send(err);
            } // Not stating the error but the movie is not appearing duplicate times in the database
            else
                res.json({message: "Movie Saved"});
            next ();
        });
	})

	.get(function(req, res){
		Movie.find(function (err, data){
			if (err) return console.error(err);
			res.json(data);
		})
	});

apiRouter.route('/movies/:movie_title')
	.post(function(req, res, next){
		var review = new Review();
		// make sure movie exists in the database
		Movie.findOne({title: req.params.movie_title}, 'title', function(err, data){
			if (err)
				res.send(err);
			else if (!data)
				return res.send({ message: 'movie not found'});
			else {
				review.movieTitle = req.params.movie_title;
				review.reviewer = req.body.reviewer;
				if (req.body.star >= 5) {
					review.star = 5;
					res.send({ message: "You really liked that one! We'll give it five stars."});
				}
				if (req.body.star < 0) {
					review.star = 0;
					res.send({ message: "Not a fan, huh? We'll put down the lowest, 0 stars."});
				}
				else
					review.star = req.body.star;
				review.review = req.body.review;
			}
			review.save(function(err){
				if (err) return  console.error(err);
			})
			res.send({message: "Review posted"});
		})

	})
	.get(function(req, res){
		var output ='';
		Movie.findOne({title: req.params.movie_title}, 'title year actor', function(err, data){
			if (err)
				res.send(err);
            if (!data)
                return res.send({ message: 'movie not found'});
			output += data;
			var reviewed = req.query.seeReview;
			var reviewTitle = req.params.movie_title;
			console.log(reviewed);
			console.log(reviewTitle);
			if (reviewed === 'true') {
				console.log('here');
				Review.find({movieTitle: reviewTitle}, 'reviewer star review',
					function(err, data2) {
					if (err)
						res.send(err);
					output += data2;
					console.log('review' + output);
					res.send(output);
					}, output)
			}
			else
				res.send(data);
		});
	})
	.delete(function(req, res){
		Movie.findOneAndRemove({title: req.params.movie_title}, function (err, movie){
			if (err)
				res.send(err);
			res.json({message: "Movie deleted"});
		})
	});




app.use('/moviedb', apiRouter);
// start the server
app.listen(1337);
console.log('1337 is the magic port!');
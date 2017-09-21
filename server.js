/* Derrick Li - Server side js file: server.js */

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.use(express.static('public'));

/* Server renders workoutList.handlebars upon initial page visit */
app.get('/', function(req, res, next) {

	res.render('workoutList');
});

/* Server sends back all current row data held in workouts table */
app.get('/initial', function(req, res, next) {

	mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
		if(err) {
			next(err);
			return;
		}

		/* Send back table data */
		res.send(JSON.stringify(rows));
	});
});

/* Server adds new exercise to workoutList then sends back updated table data */
app.post('/add-exercise', function (req, res, next) {

	/* Adds new exercise to table. id is automatically generated for exercise */
	mysql.pool.query('INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)',
		[req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs],
		function(err, result) {
		if(err) {
			next(err);
			return;
		}

		/* redirects to '/initial' to send back table data */
		res.redirect('/initial');
	});
});

/* Server renders edit page with fields prepopulated with previously entered user data */
app.post('/edit-page', function (req, res, next) {

	var context = {};
	context.id = req.body.id;

	mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.body.id], function(err, rows, fields) {
		if(err) {
			next(err);
			return;
		}

		context.name  = rows[0].name;
		context.reps  = rows[0].reps;
		context.weight  = rows[0].weight;

		if(rows[0].date != null) {
			/* Converts date object to date string in format 'YYYY-MM-DD' */
			context.date = rows[0].date.toISOString().split("T")[0];
		} else {
			context.date = null;
		}

		context.lbs  = rows[0].lbs;

		res.render('editPage', context);
	});
});

/* Server receives updated row data and makes query to database, then redirects to '/' */
app.post('/update-table', function (req, res, next) {

	mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?',
		[req.body.exerciseName, req.body.reps || null, req.body.weight || null, req.body.date || null, req.body.lbs, req.body.id],
		function(err, result) {
		if(err) {
			next(err);
			return;
		}

		/* redirects to '/' to render workoutList.handlebars */
		res.redirect('/');
	});
});

/* Server removes exercise from workoutList then sends back updated table data */
app.post('/remove-exercise', function (req, res, next) {

	/* Removes exercise from table */
	mysql.pool.query('DELETE FROM workouts WHERE id=?', [req.body.id], function(err, result) {
		if(err) {
			next(err);
			return;
		}

		/* redirects to '/initial' to send back table data */
		res.redirect('/initial');
	});
});

/* Server resets the table */
app.get('/reset-table',function(req,res,next){

	/* Drops table, creates new table, then send back row data */
	mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) {
		if(err) {
			next(err);
			return;
		}

		var createString = "CREATE TABLE workouts("+
			"id INT PRIMARY KEY AUTO_INCREMENT,"+
			"name VARCHAR(255) NOT NULL,"+
			"reps INT,"+
			"weight INT,"+
			"date DATE,"+
			"lbs BOOLEAN)";

		/* Creates new table with query string */
		mysql.pool.query(createString, function(err) {
			if(err) {
				next(err);
				return;
			}

			/* redirects to '/initial' to send back table data */
			res.redirect('/initial');
		});
	});
});

app.use(function(req,res){
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

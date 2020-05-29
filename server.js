const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');

const router = require('./routes');
const {MONGO_URI, PORT} = require('./config');

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use('/api/', router);
// app.use(express.static("uploads"));
// app.use(express.static('public'));
app.use(express.static('public'));

//Serves all the request which includes /images in the url from Images folder
app.use('/images', express.static(__dirname + '/Images'));

mongoose.connection.on("error", (err) => {
	console.error(`MongoDB connection error: ${err}`);
	process.exit(-1);
});

mongoose.connect(
	MONGO_URI, { useNewUrlParser: true, useFindAndModify: false, keepAlive: 1, useUnifiedTopology: true, useCreateIndex: true,
	 });
app.listen(PORT, function (req, res) {
	console.log(`server is listening at ${PORT}`);
});


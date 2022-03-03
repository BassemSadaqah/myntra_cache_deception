var express = require('express');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 5000;


app.listen(PORT, function () {
    console.log('Mailer started')
})
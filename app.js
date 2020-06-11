const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser=require('cookie-Parser');
const path = require('path');

const app=express();

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

const publicDirectory =path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

// Parsing Url urlencoded bodies as sent by html forms
app.use(express.urlencoded({extended:false}));

// parsing json bodies as sent by API
app.use(express.json());

// Setting up Cookieparser
app.use(cookieParser());

app.set('view engine','hbs');


db.connect((error) => {
  if(error){
    console.log(error);
  } else{
    console.log('Mysql Connected..');
  };
});

// Defining routes
app.use('/',require('./routes/pages'));

app.use('/auth',require('./routes/auth'))

app.listen(process.env.PORT || 3004,(req,res) => {
  console.log('Server started on port 3004');
});

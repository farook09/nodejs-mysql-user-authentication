const mysql =require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } =require('util');


const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

// Login Function Programm code

exports.login = async (req,res) => {
  try {
    const { email, password } = req.body;
      if(!email ||!password){
        return res.status(400).render('login',{
          message:"Please provide an email and password"
        });
      }

      db.query('SELECT * FROM usersign WHERE email = ?',[email] , async (error,results) =>{

        console.log(results);

        if( !results || !(await bcrypt.compare(password, results[0].PASSWORD )) ) {
          res.status(401).render('login',{
            message:"The Email or Password is Incorrect!"
          });
        } else {
          const id = results[0].ID;
          const token = jwt.sign({ id }, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_IN
          });

          console.log("The token is : " +token);

          const cookieOptions= {
            expires:new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          }

          res.cookie('jwt',token,cookieOptions);
          res.status(200).redirect('/');
        }

      });

  } catch (error) {
    console.log(error);
  }
}

// Regitser function code

exports.register = (req,res) => {
  console.log(req.body);

const {name, email, password, passwordConfirm} = req.body;

db.query('SELECT EMAIL FROM usersign WHERE email=?',[email], async (error,result) =>{
  if(error){
    console.log(error);
  }

  if(result.length > 0){
    return res.render('register',{
      message:"The email is already in use."
    });
  } else if(password !== passwordConfirm) {
    return res.render('register',{
      message:"Password's do not Match!"
    });
  }

  let hashedPassword = await bcrypt.hash(password,8);
  console.log(hashedPassword);

db.query('INSERT INTO usersign SET ?',{NAME:name, EMAIL:email,PASSWORD:hashedPassword},(error,results)=>{
  if (error){
    console.log(error);
  } else {
    db.query('SELECT * FROM usersign WHERE email=?',[email],(error,result) => {
      const id = result[0].ID
      console.log(id);

      const token= jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const cookieOptions ={
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly:true
      };

      res.cookie('jwt',token,cookieOptions);

      res.status(200).redirect('/');
    });
  }
});

});

};


exports.isLoggedIn = async (req,res,next) => {
  console.log(req.cookies);
  if (req.cookies.jwt){
    try{
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log("decoded");
      console.log(decoded);

        db.query('SELECT * FROM usersign WHERE id = ?', [decoded.id], (error,result) =>{
          console.log(result);
          if(!result) {
            return next();
          }

          req.user = result[0];

          console.log("next");
          return next();
        });
    } catch(err){
      return next();
    }
  } else {
    next ();
  }
};


exports.logout = (req,res) =>{
  res.cookie('jwt','loggedout',{
    expires:new Date(Date.now() + 10 * 1000),
    httpOnly:true
  });
  res.status(200).redirect('/');
};

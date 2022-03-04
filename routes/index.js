var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt')
const saltRounds = 10

/* GET home page. */
module.exports = function (db) {

  router.get('/', function (req, res, next) {
    res.render('index', { title: 'OLX', user: req.session.user });
  });

  router.get('/login', function (req, res) {
    res.render('login', { loginMessage: req.flash('loginMessage') })
  })

  router.post('/login', function (req, res) {
    const email = req.body.email
    const password = req.body.password

    db.query('select * from users where email = $1', [email], (err, user) => {
      if (err) {
        req.flash('loginMessage', 'Gagal Login')
        return res.redirect('/login')
      }
      if (user.rows.length == 0) {
        req.flash('loginMessage', 'User Tidak Ditemukan')
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.rows[0].pass, function (err, result) {
        if (result) {
          req.session.user = user.rows[0]
          if (user.rows[0].isadmin) {
            res.redirect('/ads')
          } else {
            res.redirect('/')
          }
        } else {
          req.flash('loginMessage', 'Password salah')
          res.redirect('/login')
        }
      });

    })
  });

  router.get('/register', function (req, res) {
    res.render('register')
  })

  router.post('/register', function (req, res) {
    const email = req.body.email
    const fullname = req.body.fullname
    const password = req.body.password

    bcrypt.hash(password, saltRounds, function (err, hash) {
      db.query('insert into users (email, pass, fullname, isadmin) values ($1, $2, $3, $4)', [email, hash, fullname, false], (err) => {
        if (err) return res.send('register gagal')
        res.redirect('/login')
      })
    })
  })

  router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      res.redirect('/login')
    })
  })

  return router;
}

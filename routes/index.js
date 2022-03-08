var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt')
var path = require('path');
const helpers = require('../helpers/util')
const saltRounds = 10

/* GET home page. */
module.exports = function (db) {

  router.get('/', function (req, res, next) {
    const url = req.url == '/' ? '/ads?page=1&sortBy=id&sortMode=asc' : req.url.replace('/', '/ads')
    const params = []

    params.push('approved is true')

    if (req.query.keyword) {
      params.push(`(title ilike '%${req.query.keyword}%' or description ilike '%${req.query.keyword}%')`)
    }

    if (req.query.category) {
      params.push(`category = ${req.query.category}`)
    }

    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit
    let sql = 'select count(*) as total from ads';
    if (params.length > 0) {
      sql += ` where ${params.join(' and ')}`
    }
    db.query(sql, (err, data) => {
      const pages = Math.ceil(data.rows[0].total / limit)
      sql = 'select * from ads'
      if (params.length > 0) {
        sql += ` where ${params.join(' and ')}`
      }
      req.query.sortMode = req.query.sortMode || 'asc';

      req.query.sortBy = req.query.sortBy || 'id';

      sql += ` order by ${req.query.sortBy} ${req.query.sortMode}`

      sql += ' limit $1 offset $2'
      db.query(sql, [limit, offset], (err, data) => {
        if (err) return res.send(err)
        db.query('select * from categories order by id', (err, categories) => {
          if (err) return res.send(err)
          db.query('select * from users order by id', (err, users) => {
            if (err) return res.send(err)
            res.render('index', {
              data: data.rows,
              page,
              pages,
              query: req.query,
              url,
              user: req.session.user,
              categories: categories.rows,
              users: users.rows,
              successMessage: req.flash('successMessage')
            })
          })
        })
      })
    })
  });

  router.get('/sell', helpers.isLoggedIn, function (req, res) {
    db.query('select * from categories order by id', (err, categories) => {
      if (err) return res.send(err)
      res.render('sell', {
        user: req.session.user,
        data: {},
        categories: categories.rows
      })
    })
  })

  router.post('/sell', helpers.isLoggedIn, function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), req.session.user.id, Number(req.body.price), false, []], (err) => {
        if (err) {
          console.log(err)
          req.flash('successMessage', `gagal bikin ads`)
          return res.redirect('/')
        }
        res.redirect('/')
      });
    } else {
      const fileNames = []
      if (req.files.picture.length > 1) {
        req.files.picture.forEach(file => {
          const fileName = `${Date.now()}-${file.name}`
          const uploadPath = path.join(__dirname, '..', 'public', 'images', 'ads', fileName);
          fileNames.push(fileName)
          // Use the mv() method to place the file somewhere on your server
          file.mv(uploadPath, function (err) {
            if (err)
              console.log(err)
          });
        });
        db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), req.session.user.id, Number(req.body.price), false, fileNames], (err) => {
          if (err) {
            console.log(err)
            req.flash('successMessage', `gagal bikin ads plus picture`)
            return res.redirect('/')
          }
          res.redirect('/')
        })
      } else {
        const file = req.files.picture;
        const fileName = `${Date.now()}-${file.name}`
        const uploadPath = path.join(__dirname, '..', 'public', 'images', 'ads', fileName);

        // Use the mv() method to place the file somewhere on your server
        file.mv(uploadPath, function (err) {
          if (err)
            return res.status(500).send(err);
          fileNames.push(fileName)
          db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), req.session.user.id, Number(req.body.price), false, fileNames], (err) => {
            if (err) {
              console.log(err)
              req.flash('successMessage', `gagal bikin ads plus pictures`)
              return res.redirect('/')
            }
            res.redirect('/')
          });
        });
      }
    }

  })

  router.get('/profile', helpers.isLoggedIn, function (req, res) {
    db.query('select * from users where id = $1', [req.session.user.id], (err, item) => {
      if (err) return res.send(err)
      db.query('select * from ads where seller = $1', [req.session.user.id], (err, ads) => {
        if (err) return res.send(err)
        res.render('profile', {
          user: req.session.user,
          data: item.rows[0],
          ads: ads.rows
        })
      })
    })
  })

  router.post('/profile', helpers.isLoggedIn, function (req, res) {
    const id = req.session.user.id
    if (!req.files || Object.keys(req.files).length === 0) {
      db.query('update users set fullname = $1, email = $2, phone = $3 where id = $4', [req.body.fullname, req.body.email, req.body.phone, id], (err) => {
        if (err) {
          console.log(err)
          req.flash('successMessage', `gagal bikin user`)
          return res.redirect('/profile')
        }
        res.redirect('/profile')
      });
    } else {
      const file = req.files.avatar;
      const fileName = `${Date.now()}-${file.name}`
      uploadPath = path.join(__dirname, '..', 'public', 'images', 'avatars', fileName);

      // Use the mv() method to place the file somewhere on your server
      file.mv(uploadPath, function (err) {
        if (err)
          return res.status(500).send(err);
        db.query('update users set fullname = $1, email = $2, phone = $3, avatar = $4 where id = $5', [req.body.fullname, req.body.email, req.body.phone, fileName, id], (err) => {
          if (err) {
            console.log(err)
            req.flash('successMessage', `gagal bikin user plus avatar`)
            return res.redirect('/profile')
          }
          res.redirect('/profile')
        });
      });
    }
  })

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

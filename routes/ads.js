var express = require('express');
var router = express.Router();
var path = require('path');
const helpers = require('../helpers/util')
const bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
module.exports = function (db) {

  router.get('/', helpers.isLoggedIn, function (req, res) {

    const url = req.url == '/' ? '/ads?page=1&sortBy=id&sortMode=asc' : req.url.replace('/', '/ads')

    const params = []

    if (req.query.title) {
      params.push(`title ilike '%${req.query.title}%'`)
    }

    if (req.query.description) {
      params.push(`description ilike '%${req.query.description}%'`)
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
            res.render('admin/ads/list', {
              data: data.rows,
              page,
              pages,
              query: req.query, url,
              user: req.session.user,
              categories: categories.rows,
              users: users.rows,
              successMessage: req.flash('successMessage')
            })
          })
        })
      })
    })
  })

  router.get('/add', helpers.isLoggedIn, function (req, res) {
    db.query('select * from categories order by id', (err, categories) => {
      if (err) return res.send(err)
      db.query('select * from users order by id', (err, users) => {
        if (err) return res.send(err)
        res.render('admin/ads/form', {
          user: req.session.user,
          data: {},
          categories: categories.rows,
          users: users.rows,
        })
      })
    })
  })

  router.post('/add', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), []], (err) => {
        if (err) {
          console.log(err)
          req.flash('successMessage', `gagal bikin ads`)
          return res.redirect('/ads')
        }
        res.redirect('/ads')
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
        db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), fileNames], (err) => {
          if (err) {
            console.log(err)
            req.flash('successMessage', `gagal bikin ads plus picture`)
            return res.redirect('/ads')
          }
          res.redirect('/ads')
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
          db.query('insert into ads(title, description, category, seller, price, approved, pictures) values ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), fileNames], (err) => {
            if (err) {
              console.log(err)
              req.flash('successMessage', `gagal bikin ads plus pictures`)
              return res.redirect('/ads')
            }
            res.redirect('/ads')
          });
        });
      }
    }

  })

  router.get('/delete/:id', helpers.isLoggedIn, function (req, res) {
    const id = Number(req.params.id)
    db.query('delete from ads where id = $1', [id], (err) => {
      if (err) return res.send(err)
      req.flash('successMessage', `ID : ${id} berhasil dihapus`)
      res.redirect('/ads')
    });
  })

  router.get('/edit/:id', helpers.isLoggedIn, function (req, res) {
    db.query('select * from ads where id = $1', [Number(req.params.id)], (err, item) => {
      if (err) return res.send(err)
      db.query('select * from categories order by id', (err, categories) => {
        if (err) return res.send(err)
        db.query('select * from users order by id', (err, users) => {
          if (err) return res.send(err)
          res.render('admin/ads/form', {
            user: req.session.user,
            data: item.rows[0],
            categories: categories.rows,
            users: users.rows,
          })
        })
      })
    })
  })

  router.post('/edit/:id', helpers.isLoggedIn, function (req, res) {
    const id = Number(req.params.id)
    let fileNames = req.body.pictures ? typeof req.body.pictures == 'string' ? [req.body.pictures] : [...req.body.pictures] : []
    if (!req.files || Object.keys(req.files).length === 0) {
      db.query('update ads set title = $1, description = $2, category = $3, seller = $4, price = $5, approved = $6, pictures = $7 where id = $8', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), fileNames, id], (err) => {
        if (err) {
          console.log(err)
          req.flash('successMessage', `gagal bikin ads`)
          return res.redirect('/ads')
        }
        res.redirect('/ads')
      });
    } else {
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
        db.query('update ads set title = $1, description = $2, category = $3, seller = $4, price = $5, approved = $6, pictures = $7 where id = $8', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), fileNames, id], (err) => {
          if (err) {
            console.log(err)
            req.flash('successMessage', `gagal bikin ads plus picture`)
            return res.redirect('/ads')
          }
          res.redirect('/ads')
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
          db.query('update ads set title = $1, description = $2, category = $3, seller = $4, price = $5, approved = $6, pictures = $7 where id = $8', [req.body.title, req.body.description, Number(req.body.category), Number(req.body.seller), Number(req.body.price), JSON.parse(req.body.approved), fileNames, id], (err) => {
            if (err) {
              console.log(err)
              req.flash('successMessage', `gagal bikin ads plus pictures`)
              return res.redirect('/ads')
            }
            res.redirect('/ads')
          });
        });
      }
    }
  })

  return router;
}

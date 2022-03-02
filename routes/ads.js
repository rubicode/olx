var express = require('express');
var router = express.Router();
const helpers = require('../helpers/util')

/* GET home page. */
module.exports = function (db) {

    router.get('/', helpers.isLoggedIn, function (req, res) {
 
        const url = req.url == '/' ? '/?page=1&sortBy=id&sortMode=asc' : req.url
      
        const params = []
      
        params.push(`userid = ${req.session.user.id}`)
      
        if (req.query.task) {
          params.push(`task like '%${req.query.task}%'`)
        }
      
        if (req.query.complete) {
          params.push(`complete = ${req.query.complete}`)
        }
      
        const page = req.query.page || 1
        const limit = 3
        const offset = (page - 1) * limit
        let sql = 'select count(*) as total from todo';
        if (params.length > 0) {
          sql += ` where ${params.join(' and ')}`
        }
        db.get(sql, (err, row) => {
          const pages = Math.ceil(row.total / limit)
          sql = 'select * from todo'
          if (params.length > 0) {
            sql += ` where ${params.join(' and ')}`
          }
          req.query.sortMode = req.query.sortMode || 'asc';
      
          req.query.sortBy = req.query.sortBy || 'id';
      
          sql += ` order by ${req.query.sortBy} ${req.query.sortMode}`
      
          sql += ' limit ? offset ?'
          console.log(sql)
          db.all(sql, [limit, offset], (err, rows) => {
            if (err) return res.send(err)
            res.render('list', {
              data: rows,
              page,
              pages,
              query: req.query, url,
              user: req.session.user,
              successMessage: req.flash('successMessage')
            })
          })
        })
      })
      
      router.get('/add', helpers.isLoggedIn, function (req, res) {
        res.render('add')
      })
      
      router.post('/add', function (req, res) {
        let task = req.body.task
        // query binding
        db.run('insert into todo(task, userid) values (?, ?)', [task, req.session.user.id], (err) => {
          if (err) return res.send(err)
          res.redirect('/')
        });
      
      })
      
      router.get('/delete/:id', helpers.isLoggedIn, function (req, res) {
        const id = req.params.id
        db.run('delete from todo where id = ?', [Number(id)], (err) => {
          if (err) return res.send(err)
          req.flash('successMessage', `ID : ${id} berhasil dihapus`)
          res.redirect('/')
        });
      })
      
      router.get('/edit/:id', helpers.isLoggedIn, function (req, res) {
        const id = req.params.id
        db.get('select * from todo where id = ?', [Number(id)], (err, item) => {
          if (err) return res.send(err)
          res.render('edit', { data: item })
        })
      })
      
      router.post('/edit/:id', helpers.isLoggedIn, function (req, res) {
        const id = Number(req.params.id)
        const task = req.body.task
        const complete = JSON.parse(req.body.complete)
      
        if (!req.files || Object.keys(req.files).length === 0) {
          db.run('update todo set task = ?, complete = ? where id = ?', [task, complete, id], (err) => {
            if (err) return res.send(err)
            res.redirect('/')
          });
        } else {
          const file = req.files.picture;
          const fileName = `${Date.now()}-${file.name}`
          uploadPath = path.join(__dirname, '..', 'public', 'images', fileName);
      
          // Use the mv() method to place the file somewhere on your server
          file.mv(uploadPath, function (err) {
            if (err)
              return res.status(500).send(err);
            db.run('update todo set task = ?, complete = ?, picture = ? where id = ?', [task, complete, fileName, id], (err) => {
              res.redirect('/')
            });
          });
        }
      })

  return router;
}

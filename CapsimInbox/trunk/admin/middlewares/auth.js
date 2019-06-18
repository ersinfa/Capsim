module.exports = (req, res, next) => {
    if( !req.session.passport ) res.render('index', { layout: false, title: 'Admin Dashboard', data: JSON.stringify({}) })
    else next()
}

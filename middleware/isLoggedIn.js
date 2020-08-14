module.exports = (req, res, next) =>{

if(!req.user) {
    req.flash("error, you must be signed in to view this page");
    res.redirect('/auth/login')
}else{
    next();

}
}

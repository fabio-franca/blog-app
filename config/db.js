if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: "//MONGOURI(verificar no mongo atlas"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}
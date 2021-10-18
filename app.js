//Carregando modulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const admin = require("./routers/admin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")

//Chama o model de postagens
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

// Cria a variavel usuarios para usar na rota
const usuarios = require("./routers/usuario")

const passport = require("passport")
require("./config/auth")(passport)

const db = require("./config/db")

//-------------------------------------------------->Config
    //--------------------------->Sessão
    app.use(session({
        secret: "node",
        resave: true,
        saveUninitialized: true
    }))
                                     //Seguir essa ordem
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())

    //Middleware
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")                  //Cria variável global
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;         //Variavel global para o usuário autenticado
        next();
    })

    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //HandleBars
    app.engine("handlebars", handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars');

    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
        console.log("Conectado ao Mongo");
    }).catch((erro)=>{
        console.log("Erro ao se conectar: " + erro);
    })
    //Public's
    app.use(express.static(path.join(__dirname, "public")))

//Rotas
app.use("/admin", admin)  //Prefixo das rotas

app.get("/", (req,res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("index", {postagens: postagens})
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
        if(postagem){
            res.render("postagem/index", {postagem: postagem})
        } else {
            req.flash("error_msg", "Postagem não existe")
            res.redirect("/")
        }
    }).catch((erro)=>{
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/404", (req,res)=>{
    res.send("Erro 404")
})

//Novo prefixo para usuários
app.use("/usuarios", usuarios)

//Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, ()=>{
    console.log("Servidor rodando na porta: 8081")
})
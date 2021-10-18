const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
//MOdel usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email, senha, done)=>{
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null,false,{message: "Conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha,(erro, batem)=>{ //Compara os valores encriptados
                if(batem){
                    return done(null,usuario)
                } else {
                    return done(null,false, {message: "Senha incorreta"})
                }
            })    
        })
    }))

    passport.serializeUser((usuario, done)=>{       //Salva os dados na sessão
        done(null,usuario.id)
    })

    passport.deserializeUser((id,done)=>{
        Usuario.findById(id, (err, usuario)=>{     //Procura usuario pelo ID
            done(err, usuario)
        })
    })
}
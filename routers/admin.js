const e = require("connect-flash")
const { application } = require("express")
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")    //Importa o mongoose   
require("../models/Categoria")      //Chama o arquivo do model categoria
const Categoria = mongoose.model("categorias")     //Referencia do model para a constante Categoria
require("../models/Postagem")       //Chama o arquivo do model postagem
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")     //Pega apenas a função "eAdmin"

router.get("/", (req,res)=>{
    res.render("admin/index")
})

router.get("/posts", eAdmin, (req,res)=>{
    res.send("Página de posts")
})

router.get("/categorias", eAdmin, (req,res)=>{
    Categoria.find().sort({date: "desc"}).lean().then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get("/categorias/add", eAdmin, (req,res)=>{
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req,res)=>{
    //Validação
    var erros = []      //Cria array de validação e logo abaixo faz as validações: vazio, undefined ou nulo

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.descricao.length > 25){
        erros.push({texto: "Descrição da categoria deve ter no máximo 25 caracteres"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    } else {                                                //Senão existir erros, salva a categoria
        const novaCategoria = {
            descricao: req.body.descricao,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria registrada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro)=>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin")
        })
    } 
    })

router.get("/categorias/edit/:id", eAdmin, (req,res)=>{
    Categoria.findOne({_id: req.params.id})       //Vai pesquisar o registro igual ao id passado
    .lean().then((categoria)=>{
            res.render("admin/editcategorias", {categoria: categoria})
        }).catch((erro)=>{
            req.flash("error_msg", "Categoria inexistente...")
            res.redirect("/admin/categorias")
        })
})

router.post("/categorias/edit", eAdmin, (req,res)=>{
    var erros = []

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.descricao.length > 25){
        erros.push({texto: "Descrição da categoria deve ter no máximo 25 caracteres"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    } else {
        Categoria.findOne({_id: req.body.id}).then((categoria)=>{   //Encontra pelo id do campo
            categoria.descricao = req.body.descricao           //Vai passar exatamente o valor do campo para a variavel
            categoria.slug = req.body.slug

            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((erro)=>{
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
                res.redirect("/admin/categorias")
            })
        }).catch((erro)=>{
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
            console.log(erro)
        })
    }

})

router.post("/categorias/deletar", eAdmin, (req,res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria excluída com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro)=>{
        req.flash("error_msg","Houve um erro ao tentar excluir a categoria...")
        res.redirect("/admin/categorias")
    })
})

//------------------------------------------------> Rotas de Postagens
router.get("/postagens", eAdmin, (req,res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"})
        .then((postagens)=>{
            res.render("admin/postagens", {postagens: postagens})
        }).catch((erro)=>{
            req.flash("error_msg", "Houve um erro ao listar as postagens")
            res.redirect("/admin")
        })
})

router.get("/postagens/add", eAdmin, (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
 
})

router.post("/postagens/nova", eAdmin, (req,res)=>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length>0){
        res.render("admin/addpostagens", {erros: erros})
    } else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro)=>{
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req,res)=>{ 
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{   //Pesquisa por postagens depois por categorias(combo)
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((erro)=>{
            req.flash("error_msg","Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin, (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg","Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro)=>{
            req.flash("error_msg","Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((erro)=>{
        req.flash("error_msg","Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem excluída com sucesso")
        res.redirect("/admin/postagens")
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

//-----------------------------------------------> Exportação da rota
module.exports = router
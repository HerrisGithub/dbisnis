// var common = require('./common');
var model  = require('.././model/model');
var express = require('express');
var router = express.Router();
var common = require('.././routes/common');
var model  = require('.././model/model');
var  graph = require('fbgraph');
var localStorage = require('localStorage');
var Promise = require('bluebird');
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' });
var fs = require('fs');
var path = require('path');
var requestify = require('requestify');
var knexfile=require('../knexfile');
var knex =  knexfile.knex;
var db= require('./db.js').pembeli;
var util = require('./db.js').util;


function singleInsert(table,doc){
    return knex.transaction(function(trx) {
        knex(table).transacting(trx).insert(doc)
        .then(trx.commit)
        .catch(trx.rollback);
    });
                
}
function singleSelect(table,where,select){
    return knex(table).where(where).select(select);
}
function isEmpty(obj){
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
function convertToDateJS(date){
    return date.substring(0, 10);
}
function isInArray(value,arr){
    return array.indexOf(value) > -1;
}

function setJSONParse(data){
    return JSON.parse(JSON.stringify(data));
}
module.exports={
        index:function (req,res,next) {  
            singleSelect('banner',{featured:true},'*').then(function(data){
                data=setJSONParse(data);
                res.render('pages/home', { 
                    title       : 'Shop',
                    data        : data,
                    session     : req.session,
                    message     : common.clear_session_value(req.session, "message"),
                    message_type: common.clear_session_value(req.session, "message_type"),
                    config      : req.config.get('application'),
                    helpers     : req.handlebars.helpers,
                    page_url    : req.config.get('application').base_url,
                    show_footer : "show_footer"
                });
            
                // var channel=req.channel;
                // channel.publish('posting',{data:'123'});
            })
        },
        getProfile:function(req,res){
            db.getProfilePembeliById(req.params.username)
            .first()
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        contacts:function(req,res){
            knex('user_follow')
            .join('users','user_follow.following','users.username')
            .join('penjual','users.username','penjual.username')
            .where({follower:req.session.users_name})
            
            .select('*')
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data)
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        paymentPage:function(req,res){
            var id = req.params.id;
            res.render('pembeli/payment', { 
                title       : 'Payment',
                id          : id,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),    
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        getProfilePenjual:function(req,res){
            var user = req.params.user;
            knex('users as a').join('penjual as b','a.username','b.username')
            .where({'a.username':user})
            .select('*')
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
             }).catch(function(err){
                 res.send(409);
             })
        },
     
        //#region company

        getAllCompany:function(req,res){
            db.getAllCompany()
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        companyPages:function (req,res) {  
            model.penjual.where(true).fetchAll()
            .then(function (results) {
            results = JSON.stringify(results);
            results = JSON.parse(results);
            res.render('pages/company', { 
                title       : 'Shop',
                results     : results,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),    
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
            }).catch(function(err){
                console.log(err);
            });
        },
        companyProfilPages:function(req,res){
            knex('users as a')
            .join('user_account as b','a.username','b.username')
            .join('penjual as c','b.username','c.username')
            .where('c.id','=',req.params.id)
            .first()
            .then(function(data){
                try {
                    data = util.setJSONParse(data);
                        
                } catch (error) {
                    data=[];                    
                }
                res.render('penjual/profile-company', { 
                    title       : 'Profile',
                    data        : data,
                    session     : req.session,
                    message     : common.clear_session_value(req.session, "message"),
                    message_type: common.clear_session_value(req.session, "message_type"),
                    config      : req.config.get('application'),    
                    helpers     : req.handlebars.helpers,
                    page_url    : req.config.get('application').base_url,
                    show_footer : "show_footer"
                });
            })
            
        },

        sendMessage:function(req,res){
            var message_id=req.body.id;
            knex.transaction(function(trx) {
               return knex('messages')
                .transacting(trx)
                .insert({
                    id:message_id,
                    subject:req.body.subject,
                    creator:req.body.creator,
                    message_body:req.body.message_body,
                })
                .then(function(){
                    return knex('message_recipient')
                    .transacting(trx)
                    .insert({
                        id:common.generateId(),
                        message_id:message_id,
                        recipient:req.body.recipient,
                        is_read:0
                    })
                    .then(trx.commit);
                })
                .catch(trx.rollback);
            }).then(function(){
                // knex('messages')
                res.send(200);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
       
        //#endregion

        //#region messages
            updateMessage:function(req,res){
                // knex('message_recipient')
                var body = req.body;
                var id =body.message_id;
                knex.transaction(function(trx) {    
                    return knex('message_recipient')
                     .transacting(trx)
                     .update({
                         recipient:body.recipient,
                         is_read:body.is_read,
                     })
                     .where({message_id:id})
                     .then(function(){
                         return knex('message_reply')
                         .transacting(trx)
                        .update({
                            is_read:body.is_read,
                        })
                        .where({message_id:id})
                        .then(trx.commit);
                     })
                     .catch(trx.rollback);
                 }).then(function(){
                     res.send(200);
                 }).catch(function(err){
                     console.log(err);
                     res.send(409);
                 })
            },
            message:function(req,res){
                knex('messages').select('*').where({id:req.params.id})
                .then(function(data){
                    data = util.setJSONParse(data)[0];
                    res.render('pages/messages', { 
                        title       : 'Messages',
                        data        : data,
                        session     : req.session,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config      : req.config.get('application'),    
                        helpers     : req.handlebars.helpers,
                        page_url    : req.config.get('application').base_url,
                        show_footer : "show_footer"
                    });
                })
                .catch(function(err){
                    console.log(err);
                    res.send(409);
                })
                
            },
    
        //#endregion

        //#region send chat
            sendChat:function(req,res){
                // var boss =req.boss;
                var body = req.body;
                knex('chat_room').count()
                .where({id:body.room_id})
                .then(function(data){
                    data = util.setJSONParse(data)[0];
                    if(data.count>0){
                         knex.transaction(function(trx) {
                           return knex('chats')
                            .transacting(trx)
                            .insert({
                                id:common.generateId(),
                                creator:body.creator,
                                receiver:body.recipient,
                                message_body:body.message_body,
                                room_id:body.room_id,
                                is_read:0,
                                lampiran:req.body.lampiran
                            })
                            .then(trx.commit)
                            .catch(trx.rollback);
                        }).then(function(){
                            req.channel.publish('chats-notif-'+req.body.recipient,{data:req.body});
                            res.send(200);
                        }).catch(function(err){
                            console.log(err);
                            res.send(409);
                        })
                    }
                    else{
                        knex.transaction(function(trx) {
                            return knex('chat_room')
                             .transacting(trx)
                             .insert({
                                id:body.room_id,
                                user1:body.creator,
                                user2:body.recipient
                             }).then(function(){
                                return knex('chats')
                                .transacting(trx)
                                .insert({
                                    id:common.generateId(),
                                    creator:body.creator,
                                    receiver:body.recipient,
                                    message_body:body.message_body,
                                    room_id:body.room_id,
                                    is_read:0
                                })
                                .then(trx.commit)
                             }).catch(trx.rollback);
                         }).then(function(){
                             req.channel.publish('chats-notif-'+req.body.recipient,{data:req.body});
                             res.send(200);
                         }).catch(function(err){
                             console.log(err);
                             res.send(409);
                         })
                    }

                })

               
            },
            getRoom:function(req,res){
                var user1 =  req.params.user1;
                var user2 =  req.params.user2;
                knex('chat_room')
                .select('id').where({user1:user1,user2:user2}).orWhere({user1:user2,user2:user1})
                .then(function(data){
                    data = util.setJSONParse(data);
                    if(data.length==0){
                        res.send(common.generateId().toString());
                    }else{
                        res.send((data[0].id).toString());
                    }
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            },
            getChatsById:function(req,res){
                knex('chat_room as a').join('chats as b','a.id','b.room_id')
                .where({room_id:req.params.id})
                .select('*').orderBy('b.created_at','asc')
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data)
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            },
            getChatById:function(req,res){
                knex('chats')                
                .where({id:req.params.id})
                .select('*')
                .first()
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data)
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            },
            
            hasReadChat:function(req,res){
                knex('chats').count('is_read as sum')
                .where({creator:req.params.user2,receiver:req.params.user1,is_read:0})
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data)
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            },
            setReadChat:function(req,res){
                knex.transaction(function(trx) {
                    return knex('chats')
                    .transacting(trx)
                    .update({is_read:1})
                    .where({creator:req.body.user2,receiver:req.body.user1})
                    .then(trx.commit)
                    .catch(trx.rollback);
                })
                .then(function(resp) {
                    console.log('Transaction complete.');
                    res.send(200);
                })
                .catch(function(err) {
                    console.error(err);
                });
                
            },
            getAllChatByUser:function(req,res){
                knex('chat_room as a').
                join('chats as b','a.id','b.room_id')
                .orderBy('b.created_at','desc')
                .where({'b.receiver':req.session.users_name})
                .select('*')
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data)
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })

            },
        //#endregion
        //#region rating
            getRatingAllByUser:function(req,res){
                knex('rating').where({product_by:req.params.username})
                .select('*')
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data)
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            },
        //#endregion
        updateOrder:function(req,res){
            var order = req.body.order;
            order = JSON.parse(order);
            db.updateOrder(order.id,order.payment_status,order.bank).then(function(){
                res.send(200)
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        bestSelling:function(req,res){
            knex('products as a')
            .join('order_details as b','a.id','b.product_id')
            .select('*').where('b.status','=',4)
            .then(function(data){
                res.send(util.setJSONParse(data))
            }).catch(function(err){
                console.log(err)
                res.send(409);
            });
        },
        
        getOrderDetailsBySession:function(req,res){
            knex('order_details as a')
            .join('products as b','a.product_id','b.id')
            .where({'a.product_by':req.session.users_name})
            .select('*','a.id as detail_id')
            .then(function(data){
                res.send(util.setJSONParse(data))
            }).catch(function(err){
                console.log(err)
                res.send(409);
            });
        },
        getOrdersSellerByUser:function(req,res){
            knex('orders as a')
            .join('order_details as b','a.id','b.order_id')
            .where({product_by:req.params.username})
            .select('*')
            .then(function(data){
                res.send(util.setJSONParse(data))
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        meProfile:function(req,res){
            var me = req.session.users_name;
            if(typeof me!=='undefined'){
                 db.meProfile({username:me}).then(function(data){
                    res.send(util.setJSONParse(data));
                 }).catch(function(err){
                     console.log(err);
                     res.send(409);
                 });
            }
           
        },
        updateProfile:function(req,res){
            db.updateProfile(req.body)
            .then(function(){
                res.send(200);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getAllProvinces:function(req,res){
            db.getAllProvinces().then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        getProvinceById:function(req,res){
            db.getProvinceById(req.params.id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        getDistrictByProvinceId:function(req,res){
            db.getDistrictByProvinceId(req.params.id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        getDistrictById :function (req,res) { 
            db.getDistrictById(req.params.id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
         },
        getSubDistrictByDistrictId:function(req,res){
            db.getSubDistrictByDistrictId(req.params.id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        getSubDistrictById:function(req,res){
            db.getSubDistrictById(req.params.id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
        uploadFile:function(req,res){
            var upload_dir = path.join("public/uploads/profile/"+req.session.users_name);
            common.check_directory_sync(upload_dir);
            var file = req.file;
            var source = fs.createReadStream(file.path);
            var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
            source.pipe(dest);
            source.on("end", function() {
                res.send(200);
            });
            fs.unlink(file.path, function (err) {});
        },
        uploadFile2:function(req,res){
            var users = req.params.users;
            var folder = req.params.folder;
            var upload_dir = path.join("public/uploads/files/",users);
            common.check_directory_sync(upload_dir);
            upload_dir=path.join(upload_dir,folder);
            common.check_directory_sync(upload_dir);
            var file = req.file;
            var source = fs.createReadStream(file.path);
            var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
            source.pipe(dest);
            source.on("end", function() {
                res.send(200);
            });
            fs.unlink(file.path, function (err) {});
        },
        updatePassword :function(req,res){
            var username = req.body.username;
            var passwordBaru = req.body.passwordBaru;
            var passwordSekarang = req.body.passwordSekarang;
            
            db.verifikasiPassword(username,passwordSekarang)
            .then(function(data){
                data = util.setJSONParse(data);
                data = data[0];
                if(data.password===passwordSekarang){
                    db.updatePassword(username,passwordBaru,passwordSekarang) 
                    .then(function(){
                        res.send(200);
                    }).catch(function(err){
                        console.log(err);
                        res.send(409);
                    })
                }
                else{
                    res.send(404);
                }
            }).catch(function(err){
                console.log(err);
                res.send(409);

            })
            
        },
        userExist:function(req,res){
            var body = req.body;
            db.checkUserExist(body.username)
            .then(function(data){
                res.send(util.setJSONParse(data)[0]);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        emailExist:function(req,res){
            var body = req.body;
            db.checkEmailExist(body.email).then(function(data){
                res.send(util.setJSONParse(data)[0]);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        halamanProduk:function (req,res) {      
            res.render('pages/halaman_produk', { 
                title       : 'Shop',
                // results     : results,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),    
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        getAllProducts:function(req,res){
            db.getAllProducts().then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        
        getProductsByCategory:function(req,res){
            db.getProductsByCategory({kategori:req.params.category})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getKatalog:function(req,res){
            db.getListKatalogByusers(req.params.users)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getImageProductById:function(req,res){
            db.getProductImageById(req.params.id).then(function(data){
                data = util.setJSONParse(data);
                res.send(data[0]);
            }).catch(function(err){
                res.send(409);
            });
        },
        getVariasiByProductId:function(req,res){
            var id = req.params.id;
            db.getVariasiHargaByProductId(id)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            });
        },
        getVariasiHarga:function(req,res){
            db.getVariasiHarga({product_id:req.params.id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getVariasiHargaMin:function(req,res){
            knex('variasi').min('harga')
            .where({product_id:req.params.id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getVariasiHargaMax:function(req,res){
            knex('variasi').max('harga')
            .where({product_id:req.params.id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getHargaGrosir:function(req,res){
            db.getHargaGrosirByProductId(req.params.id)
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getHargaGrosirByVariasi:function(req,res){
          knex('grosir').select('*')
          .where({variasi_id:req.params.id})
          .then(function(data){
            data=util.setJSONParse(data);
            res.send(data);
        }).catch(function(err){
            res.send(409);
        });
        },
        getMaxHargaGrosir:function(req,res){
            db.getMaxHargaGrosir(req.params.id)
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getMinHargaGrosir:function(req,res){
            db.getMinHargaGrosir(req.params.id)
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getMinHargaSatuan:function(req,res){
            knex('grosir').min('satuan').where({product_id:req.params.id})
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
        getMaxHargaSatuan:function(req,res){
            knex('grosir').max('satuan').where({product_id:req.params.id})
            .then(function(data){
                data=util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                res.send(409);
            });
        },
       
        productCategory:function(req,res){
            var category=[];
            category.push({category:'Flash Disk'})
            res.send(category);
        },
        register:function (req,res) {  
            //#region 
            model.admin_account
            .where(true).count().then(function(count){
            if(count>0){
                if(req.method==='GET'){
                    res.render('register', { 
                        title       : 'Register',
                        session     : req.session,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config      : req.config.get('application'),
                        helpers     : req.handlebars.helpers,
                        page_url    : req.config.get('application').base_url,
                        show_footer : "show_footer"
                    });
                }
                else if(req.method==='POST'){
                    var body = req.body;
                    db.registerUser(body).then(function(){
                        res.send(200);
                    }).catch(function(err){
                        console.log(err);
                        res.send(409);
                    })
                }
            }
            else{
                res.redirect('/setup');
            }
        });

        //#endregion

            // model.admin_account.where(true).count()
            // .then(function(count){
            //     if(count>0){
            //         if(req.method==='GET'){
            //             res.render('pages/register', { 
            //                 title       : 'Register',
            //                 session     : req.session,
            //                 message     : common.clear_session_value(req.session, "message"),
            //                 message_type: common.clear_session_value(req.session, "message_type"),
            //                 config      : req.config.get('application'),
            //                 helpers     : req.handlebars.helpers,
            //                 page_url    : req.config.get('application').base_url,
            //                 show_footer : "show_footer"
            //             });
            //         }
            //     }
            // });

        },
        userInfo:function(req,res){
            function rend(data){
                 res.render('panel_user', { 
                    title       : 'Profile',
                    user        : data,
                    session     : req.session,
                    message     : common.clear_session_value(req.session, "message"),
                    message_type: common.clear_session_value(req.session, "message_type"),
                    config      : req.config.get('application'),
                    helpers     : req.handlebars.helpers,
                    page_url    : req.config.get('application').base_url,
                    show_footer : "show_footer"
                });
            }
            var id = req.params.id;
            knex('users').join('penjual','users.username','=','penjual.username')
            .where('users.id',id)
            .then(function(data){
                data = JSON.stringify(data);
                data = JSON.parse(data);
                if(isEmpty(data)){
                    knex('users').join('penjual','users.username','=','penjual.username')
                    .where('users.id',id)
                    .then(function(data){
                        data = JSON.stringify(data);
                        data = JSON.parse(data);
                        rend(data);
                    });
                }else{  
                         rend(data);
                }
               
            });

        },
        editProfile:function (req,res) {  
            res.render('pembeli/profile', { 
                title       : 'Profile',
                // user        : user[0],
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        
        searchProductById:function (req,res) {  
           
        },
        logout:function (req,res) {  
            req.session.user         = null;
            req.session.users_name   = null;
            req.session.user_id      = null;
            req.session.message      = null;
            req.session.message_type = null;
            req.session.passport     = null;
            req.session.user_type    = null;
            req.session.photo        = null;
             localStorage.setItem('url','');
            res.redirect('/');
        },
        productCategoryPage:function(req,res){
            res.render('pages/product_id', { 
                title       : 'Products',
                // data        : data,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        UKMCategoryPage:function(req,res){
            res.render('pages/UKM_id', { 
                title       : 'UKM',
                // data        : data,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        searchProductByCategory:function (req,res) {  
            var category = req.params.cat;
            var text =req.params.text;
            db.getProductsByCategory2(category,text)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        products:function (req,res) {  

            model.products.where(true).orderBy('added_date',"DESC").fetchAll().then(function(products){
            products = JSON.stringify(products);
            products = JSON.parse(products);
            res.render('products', { 
                title       : 'Products',
                config      : req.config.get('application'),
                products    : products,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers     : req.handlebars.helpers
            });
            }).catch(function(err){
                console.log(err);
            });
        },
        cart:function (req,res,next) {  
            res.render('cart', { 
                title       : 'Cart',
                config      : req.config.get('application'),
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers     : req.handlebars.helpers,
                show_footer : "show_footer"
            });
        },
        checkout:function (req,res,next) {  
            // if there is no items in the cart then render a failure
            if(!req.session.cart){
                req.session.message      = "The are no items in your cart. Please add some items before checking out";
                req.session.message_type = "danger";
                res.redirect("/cart");
                return;
            }
            // render the checkout
            res.render('checkout', { 
                title       : 'Checkout',
                config      : req.config.get('application'),
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers     : req.handlebars.helpers,
                show_footer : "show_footer"
            });
        },
       
        getMe:function(req,res){
            db.getProfileAllMe(req.params.username).then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getNotificationMessages:function(req,res){
            knex('message_recipient as a')
            .join('messages as b','a.message_id','b.id')
            .select('*')
            .where({recipient:req.params.user})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getMessagesReply:function(req,res){
            knex('message_reply')
            .select('*')
            .where({message_id:req.params.id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        replyMessage:function(req,res){
            knex.transaction(function(trx) {
                knex('message_reply').transacting(trx).insert(req.body)
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .then(function(resp) {
                console.log('Transaction complete.');
                res.send(200);
            })
            .catch(function(err) {
                console.error(err);
            });
        },
        infoPengiriman:function(req,res){
            res.render('pembeli/info_pengiriman',{
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                search_term : req.params.tag,
                helpers     : req.handlebars.helpers
            });
        },
        getDiscount:function(req,res){
            db.getPromosi({product_id:req.params.id}).then(function(data){
               res.send(util.setJSONParse(data));
            }).catch(function(err){
                res.send(409);
            })
        },
        getProductById:function(req,res){
            var id = req.params.id;
            var classy     = require("markdown-it-classy");
            var markdownit = req.markdownit;
            markdownit.use(classy);
            var promise = new Promise(function(resolve,reject){
                db.getProductById(id).then(function(data){
                    data = util.setJSONParse(data);
                    db.getVariasiHargaByProductId(data[0].id).then(function(variasi){
                        variasi = util.setJSONParse(variasi);
                        var d={
                            data:data[0],
                            variasi:variasi,
                        }
                        resolve(d);
                    });
                })
                .catch(function(err){
                    res.send(409);
                })
            });
            promise.then(function(d){
                db.getHargaGrosirByProductId(d.data.id)
                .then(function(data){
                    data=util.setJSONParse(data);
                    var i=0;
                    new Promise(function(resolve,reject){
                        data.forEach(function(e) {
                            db.getVariasiNameById({id:e.variasi_id})
                            .then(function(dat){
                                dat=util.setJSONParse(dat);
                                data[i].variasi_name=dat[0].nama;
                                i++;
                                if(i===data.length){
                                    resolve(data);
                                }
                            })
                        }, this);
                    }).then(function(data){
                        d.grosir=util.setJSONParse(data);
                    })
                    
                });
            });
            promise.then(function(d){
                db.getPromosi({product_id:d.data.id})
                .then(function(data){
                    data=util.setJSONParse(data);
                    d.diskon=data[0];
                });
            });
            promise.then(function(d){
                    common.get_images(req.params.id, req, res, function (images){
                        images=JSON.stringify(images);
                        images=JSON.parse(images);
                        res.render('pages/produk', { 
                            title       : d.data.nama,
                            filtered    : true,
                            config      : req.config.get('application'),
                            data        : d,
                            grosir      : d.grosir,
                            diskon      : d.diskon,
                            images      : images,
                            description : markdownit.render(d.data.deskripsi),
                            session     : req.session,
                            message     : common.clear_session_value(req.session, "message"),
                            message_type: common.clear_session_value(req.session, "message_type"),
                            search_term : req.params.tag,
                            helpers     : req.handlebars.helpers
                        });
                    });
                
            })
                
        },
        getPromosiByKode:function(req,res){
            var kode = req.params.kode;
            var id = req.params.id;
            kode = kode.toLowerCase();
            console.log(kode)
            db.getPromosi({'kode_promosi':kode,product_id:id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data)
            }).catch(function(err){
                console.log(err);
                res.send(409);
            });
        },
        getProductByUser:function(req,res){
            var user = req.params.user;
            
            db.getProductByUser(user)
            .then(function(data){
               data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            });
        },
       
        getProdukById:function(req,res){
            var id = req.params.id;
            db.getProductById(id).then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        
        getStatusPembayaran:function(req,res){
            var id = req.params.id;
            db.getStatusPembayaran(id).then(function(data){
                data = JSON.stringify(data);
                res.send(data);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
            // res.send(200)
        },
        orders:function(req,res){
            var body=req.body;
            var cart = JSON.parse(body.cart);
            var doc = JSON.parse(body.doc);
            temp = [];

            for(var i in cart){
                var c = cart[i].item=JSON.parse(cart[i].item);
                for(var j in c){
                    temp.push({
                        id:common.generateId(),
                        order_id:doc.id,
                        product_by:cart[i].product_by,
                        product_id:c[j].id,
                        product_name:c[j].nama,
                        qty:c[j].count,
                        price:c[j].harga,
                        status:1,
                    });
                }
                
            }
            db.addOrder(doc,temp)
            .then(function(){
                res.send(200);
            }).catch(function(err){
                console.log(err)
                res.send(409);
            })
        },
         // render order details
        orderdetail:function(req,res){
            res.render('pembeli/order', { 
                title       : 'order details',
                config      : req.config.get('application'),
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                search_term : req.params.tag,
                helpers     : req.handlebars.helpers
            });
        }, 
         // add order
         order_details:function(req,res){
            var body=req.body;
            db.addOrderDetails(body).then(function(){
                res.send(200);
            }).catch(function(err){
                res.send(409);
                console.log(err)
            })
        },
        myorders:function(req,res){
            res.render('pembeli/orders', { 
                title       : 'order details',
                config      : req.config.get('application'),
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                search_term : req.params.tag,
                helpers     : req.handlebars.helpers
            });
        },
        getMonthlySellingByUser:function(req,res){
            var user = req.params.user;
            knex.raw("select sum (qty), sum (qty*price) as total, cast(created_at as date) date from order_details where product_by ='"+user+"' and status = 5 group by cast(created_at as date)")
            .then(function(data){
                res.send(util.setJSONParse(data).rows);
            }).catch(function(err){
                res.send(409);
                console.log(err)
            })
        },
        // getOrderstListBySession:function(){
        //     knex('orders').select('*');
        // },
        getMonthlyRefundByUser:function(req,res){
            var user = req.params.user;
            knex.raw("select sum (qty), sum (qty*price) as total, cast(created_at as date) date from order_details where product_by ='"+user+"' and status =3 group by cast(created_at as date)")
            .then(function(data){
                res.send(util.setJSONParse(data).rows);
            }).catch(function(err){
                res.send(409);
                console.log(err)
            })
        },

        getMyOrders:function(req,res){
            var me = req.session.users_name;
            db.myorders(me)
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getMyOrderDetailsByOrderId:function(req,res){
            var id = req.params.id;
            db.myOrderDetails({order_id:id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getMyOrderDetail:function(req,res){
            var id = req.params.id;
            db.myOrderDetails({id:id})
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        getOrderById:function(req,res){
            db.getOrderById(req.params.id).then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
        },
        uploadBukti:function(req,res){
            var directory=req.params.id; 
            var upload_dir = path.join("public/uploads/order/", directory);
            common.check_directory_sync(upload_dir);
            var file = req.file;
            var source = fs.createReadStream(file.path);
            var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
            source.pipe(dest);
            source.on("end", function() {
                res.send(200);
            });
            fs.unlink(file.path, function (err) {});
        },
        login:function (req,res) { 
            model.admin_account.count('username').then(function (user_count) {  
                user_count=JSON.stringify(user_count);
                user_count=JSON.parse(user_count);
                user_count=parseInt(user_count);
                // we check for a user. If one exists, redirect to login form otherwise setup
                if(user_count > 0){			
                    // set needs_setup to false as a user exists
                    req.session.needs_setup = false;
                    res.render('login', { 
                        title        : 'Login',
                        referring_url: req.header('Referer'),
                        config       : req.config.get('application'),
                        message      : common.clear_session_value(req.session, "message"),
                        message_type : common.clear_session_value(req.session, "message_type"),
                        helpers      : req.handlebars.helpers,
                        show_footer  : "show_footer"
                    });
                }else{
                    // if there are no users set the "needs_setup" session
                    req.session.needs_setup = true;
                    res.redirect('/setup');
                }
            }).catch(function (err) {  
                console.log(err);
            });


        },
        setup:function (req,res) { 
            model.admin_account.where(true).count().then(function(count){
                if(count==0){
                    req.session.needs_setup = true;
                    res.render('setup', { 
                        title       : 'Setup',
                        config      : req.config.get('application'),
                        helpers     : req.handlebars.helpers,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        show_footer : "show_footer"
                    });
                }
            })
        },
        login_action:function (req,res,next) {  
            knex('users')
            .join('user_account', 'users.username', '=', 'user_account.username')
            .join('penjual', 'users.username', '=', 'penjual.username')
            .select('users.username','users.id','user_account.password','penjual.username','penjual.photo')
            .where('users.email','=',req.body.email)
            .then(function (user) { 
                user=JSON.stringify(user);
                user=JSON.parse(user);
                 if(isEmpty(user) || typeof user === undefined || user === null){
                     knex('users')
                    .join('user_account', 'users.username', '=', 'user_account.username')
                    .join('pembeli', 'users.username', '=', 'pembeli.username')
                    .select('users.username','users.id','user_account.password','pembeli.username','pembeli.photo')
                    .where('users.email','=',req.body.email)
                    .then(function (user) { 
                         if(isEmpty(user) || typeof user === undefined || user === null){
                            req.session.message      = "A user with that email does not exist.";
                            req.session.message_type = "danger";
                            req.session.save();
                            res.redirect('/login');
                            return;
                         }else{
                            if(req.body.password===user[0].password){
                                req.session.user       = req.body.email;
                                req.session.users_name = user[0].username;
                                req.session.user_id    = user[0].id;
                                req.session.user_type = 'pembeli';
                                req.session.photo      = user[0].photo;
                                localStorage.setItem('session',JSON.stringify(req.session));
                                res.redirect("/me/profile");
                                return;
                            }
                            else{
                                req.session.message      = "Email or password does not exist.";
                                req.session.message_type = "danger";
                                req.session.save();
                                res.redirect('/login');
                                return;
                            }
                         }
                    }).catch(function (err) {  
                        console.log(err);
                    }); 
                }
                else{
                    if(req.body.password===user[0].password){
                        req.session.user       = req.body.email;
                        req.session.users_name = user[0].username;
                        req.session.user_id    = user[0].id;
                        req.session.user_type = 'penjual';
                        req.session.photo      = user[0].photo;
                        localStorage.setItem('session',JSON.stringify(req.session));
                        res.redirect("/penjual");
                        return;
                    }
                     else{
                        req.session.message      = "Email or password does not exist.";
                        req.session.message_type = "danger";
                        req.session.save();
                        res.redirect('/login');
                        return;
                    }
                }
            }).catch(function (err) {  
                console.log(err);
            });
          
        },
        auth:function (req,res,next) {  
            var provider = "";
            if (!isEmpty(req.session.passport))
                provider = req.session.passport.user.provider;
            if (provider === 'facebook') {
                graph.setAccessToken(localStorage.getItem('facebook_access_token'));
                graph.setVersion("2.2");
                var params = { fields: "name,gender,email" };
                graph.get("me", params, function (err, user) {
                    model.facebook_account.where({ facebook_id: user.id }).fetch().then(function (usr) {
                        usr = util.setJSONParse(usr);
                        if (usr === null) {
                            localStorage.setItem('facebook_id', user.id);
                            if(user.email){
                               req.session.email=user.email;
                               req.session.message      = "isi kembali username anda";
                               req.session.message_type = "success";
                            }else{
                               req.session.email='';
                               req.session.message      = "isi kembali email dan username anda";
                               req.session.message_type = "success";
                            }
                            res.render('completing_account', { 
                                    title       : 'Completing Account',
                                    user        : user,
                                    config      : req.config.get('application'),
                                    session     : req.session,
                                    message     : common.clear_session_value(req.session, "message"),
                                    message_type: common.clear_session_value(req.session, "message_type"),
                                    helpers     : req.handlebars.helpers,
                                    show_footer : "show_footer"
                            });
                        }
                        else {
                                res.redirect("/me/profile");
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                });
            }
            else if (provider === 'google') {
                res.send(JSON.parse(JSON.stringify(req.session.passport.user)));
            }
            else
                res.redirect('/login');
            
        },
        registerByFb:function (req,res,next){
           var body = req.body;
           body = util.setJSONParse(body);
           var id = localStorage.getItem('facebook_id');
              db.registerUserByFB(body,id)
           .then(function(resp) {
                console.log('Transaction complete.');
                res.send(200);
            })
            .catch(function(err) {
                console.log(err);
                res.send(err);
            });

        },
        meFacebook:function (req,res) {  
            graph.setAccessToken(localStorage.getItem('facebook_access_token'));
            graph.setVersion("2.2");
            var params = { fields: "name,gender,email" };
            graph.get("me", params, function (err, user) {
                model.facebook_account
                .where({ facebook_id: user.id })
                .fetch()
                .then(function (usr) {
                    usr=util.setJSONParse(usr);
                    if(usr){
                        res.send(usr).status(200);
                    }else{
                        res.send(409);
                    }
                }).catch(function (err) {  
                        console.log(err);
                        res.send(409);
                });
            });
           
        },
        meFacebookProfile:function (req,res) {  
            graph.setAccessToken(localStorage.getItem('facebook_access_token'));
            graph.setVersion("2.2");
            var params = { fields: "name,gender,email" };
            graph.get("me", params, function (err, user) {
                model.facebook_account
                .where({ facebook_id: user.id })
                .fetch()
                .then(function (usr) {
                    usr=util.setJSONParse(usr);
                    db.meFacebookProfile(usr.username)
                    .then(function (usr) {
                        usr=util.setJSONParse(usr);
                        res.send(usr);
                    }).catch(function (err) {  
                            console.log(err);
                            res.send(409);
                    });
                }).catch(function (err) {  
                        console.log(err);
                        res.send(409);
                });
            });
           
        },
        getMeFacebookProfile:function(req,res){
            graph.setAccessToken(localStorage.getItem('facebook_access_token'));
            graph.setVersion("2.2");
            var params = { fields: "name,gender,email,photos" };
            
            graph.get("me", params, function (err, user) {
                user= util.setJSONParse(user);
              res.send(user);
            });
        },
       
        buatPermintaan:function (req,res) {  
             if(req.method==='GET'){
                res.render('pembeli/buat_permintaan', { 
                    title: 'Permintaan', 
                    // orders: orders, 
                    config: req.config.get('application'),
                    session: req.session,
                    message: common.clear_session_value(req.session, "message"),
                    message_type: common.clear_session_value(req.session, "message_type"),
                    helpers: req.handlebars.helpers,
                    show_footer: "show_footer"
                });   
            }
            else if(req.method==='POST'){
                var body=req.body;
                console.log(req.body)
                var doc={
                    id:common.generateId(),
                    name:body.name,
                    kuantitas:body.kuantitas,
                    satuan:body.lainnya||body.satuan,
                    harga:body.harga,
                    desc:body.desc,
                    province:body.province,
                    district:body.district,
                    sub_district:body.subdistrict,
                    address:body.address,
                    lampiran:body.lampiran,
                    create_by:req.session.users_name,
                    zip_code:body.zip_code,
                    status:body.status,
                    kategori:body.kategori
                }
                knex.transaction(function(trx) {
                    knex('permintaan').transacting(trx).insert(doc)
                    .then(trx.commit)
                    .catch(trx.rollback);
                })
                .then(function(resp) {
                    console.log('Transaction complete.');
                    res.send(200);
                })
                .catch(function(err) {
                    console.error(err);
                });
            }
        },
       setujuPenawaran:function(req,res){
            knex.transaction(function(trx) {
               return knex('permintaan').transacting(trx)
                .update({status:2,harga:req.params.harga,kuantitas:req.params.qty})
                .where({id:req.params.id})
                .then(function(){
                   return knex('penawaran').transacting(trx)
                    .update({status:2})
                    .where({id_permintaan:req.params.id})
                    .then(trx.commit)
                })
                .catch(trx.rollback);
            })
            .then(function(resp) {
                console.log('Transaction complete.');
                res.redirect('/pages/demands/get');
            })
            .catch(function(err) {
                console.error(err);
            });
        },
        tolakPenawaran:function(req,res){
            knex.transaction(function(trx) {
                return knex('penawaran').transacting(trx)
                    .update({status:3})
                    .where({id_permintaan:req.params.id})
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
             .then(function(resp) {
                 console.log('Transaction complete.');
                 res.redirect('/pages/demands/get');
             })
             .catch(function(err) {
                 console.error(err);
             });
        },
        bayarPenawaran:function(req,res){
            var id = req.params.id;
            knex('permintaan as a')
            .join('penawaran as b','a.id','b.id_permintaan')
            .join('users as c','a.create_by','c.username')
            .where({'a.id':id,'b.status':2})
            .select('*','b.create_by as product_by')
            .then(function (data) { 
                data = util.setJSONParse(data);
                if(data.length>0){
                    data=data[0];
                    var doc={
                        id:common.generateId(),
                        name:data.fullname,
                        email:data.email,
                        address:data.address,
                        province:data.province,
                        district:data.district,
                        sub_district:data.sub_district,
                        postal_code:data.zip_code,
                        order_date:Date.now(),
                        verification:false,
                        bank_account:{},
                        transfer_note:'',
                        orders_total:(data.harga*data.kuantitas),
                        payment_status:false,
                        buyer:req.session.users_name,
                    }
                    var det ={
                        id:common.generateId(),
                        order_id:doc.id,
                        product_id:data.product_id,
                        product_by:data.product_by,
                        product_name:data.name,
                        qty:data.kuantitas,
                        price:data.harga,
                        status:1

                    }
                }
                db.addOrder(doc,det)
                .then(function () { 
                    res.redirect('/order/myorders');
                }).catch(function(error){
                    console.error(error);
                    res.send(409);
                });
               
            }).catch(function(error){
                console.error(error);
                res.send(409);
            });
        },
        getAllPermintaan:function(req,res){
            knex('permintaan').select('*')
            .where('status','<',2)
            .then(function (data) { 
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(error){
                console.error(error);
                res.send(409);
            });
        },
        halamanPenawaran:function(req,res){
            res.render('pages/Penawaran', { 
                title: 'Penawaran', 
                // orders: orders, 
                config: req.config.get('application'),
                session: req.session,
                message: common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers: req.handlebars.helpers,
                show_footer: "show_footer"
            });   
        },
        getAllPenawaran:function(req,res){
            // 0 pending, 1 ada penawaran, 2 sudah proses, 3 batal sebelum proses

            knex('permintaan as a')
            .join('penawaran as b','a.id','b.id_permintaan')
            .join('users as c','b.create_by','c.username')
            .join('penjual as d','c.username','d.username')
            .where({'a.create_by':req.session.users_name,'a.status':0})
            .select('*').then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            });

        },
        timeline:function(req,res){
            if(req.method==='GET'){
                // knex('users')
                // .join('post', 'users.username', '=', 'post.author')
                // .join('penjual', 'users.username', '=', 'penjual.username')
                // // .join('pembeli', 'users.username', '=', 'pembeli.username')
                // .select('users.*','post.*','penjual.*')
                // .then(function (data) { 
                //     data = JSON.stringify(data);
                //     data = JSON.parse(data);
                    res.render('pages/timeline', { 
                        title       : 'Timeline',
                        // user        : data[0],
                        session     : req.session,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config      : req.config.get('application'),
                        helpers     : req.handlebars.helpers,
                        page_url    : req.config.get('application').base_url,
                        show_footer : "show_footer"
                    });
                // });
            }else if(req.method==='POST'){
                db.addPost(req.body)
                .then(function(resp) {
                    console.log('Transaction complete.');
                    
                    res.send(200);
                })
                .catch(function(err) {
                    console.error(err);
                });
            }
        },
        timelineList:function(req,res){
            knex('users')
            .join('post', 'users.username', '=', 'post.author')
            .join('penjual', 'users.username', '=', 'penjual.username')
            .select('users.*','post.*','post.id as postid','penjual.*')
            .orderBy('post.created_at','desc')
            .then(function (data) { 
                data = JSON.stringify(data);
                data = JSON.parse(data);
                res.send(data);
            });
        },
        timelineLike:function(req,res){
            var doc = {
                id:common.generateId(),
                post_id:req.body.id,
                user_like:req.session.users_name
            }
            knex.transaction(function(trx) {
                knex('likes').transacting(trx).insert(doc)
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .then(function(resp) {
                console.log('Transaction complete.');
                res.send({aksi:1}).status(200);
            })
            .catch(function(err) {
                knex('likes')
                .where({post_id:req.body.id,user_like:req.session.users_name})
                .del().then(function(){
                    res.send({aksi:2}).status(200);
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
            });
        },
        timelineUnLike:function(req,res){
            knex.transaction(function(trx) {
                return knex('likes').transacting(trx)
                .where({id:req.session.id,user_like:req.session.users_name})
                .del()
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .then(function(resp) {
                console.log('Transaction complete.');
                res.send(200);
            })
            .catch(function(err) {
                res.send(409)
            });
        },
        timelineSearch:function(req,res){
            var key = req.params.key;
            var k = "%"+key+"%";
            knex('users').select('*')
            .where('fullname','like',k).then(function(data){
                data = JSON.stringify(data);
                data = JSON.parse(data);
                res.send(data);
            });
        },
        chatPages:function(req,res){
            res.render('pages/halaman_chatting', { 
                title       : 'Timeline',
                room_id     : req.params.room,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        },
        addPostComment :function(req,res){
            knex.transaction(function(trx){
                knex('post_comments').transacting(trx)
                .insert(req.body)
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .then(function(resp) {
                console.log('Transaction complete.');
                res.send(200);
            })
            .catch(function(err) {
                console.log(err);
                res.send(409);
            });
        },
        getCommentById:function(req,res){
            knex('post_comments as a')
            .join('users as b','a.creator','b.username')
            .where({post_id:req.params.id})
            .select('*','a.created_at as date')
            .then(function(data){
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
            // knex('post_comments').where({post_id:req.params.id})
            // .select('*')
            //  .then(function(data){
            //     data = util.setJSONParse(data);
            //     res.send(data);
            // }).catch(function(err){
            //     console.log(err);
            //     res.send(409);
            // })

        },
        permintaan:function(req,res){
            model.permintaan.query(function(q){
                q.where('create_by',req.session.users_name)
            }).fetchAll().then(function(permintaan){
                permintaan=JSON.stringify(permintaan);
                permintaan=JSON.parse(permintaan);
                  res.render('pembeli/permintaan', { 
                    title: 'Permintaan', 
                    permintaan: permintaan, 
                    config: req.config.get('application'),
                    session: req.session,
                    message: common.clear_session_value(req.session, "message"),
                    message_type: common.clear_session_value(req.session, "message_type"),
                    helpers: req.handlebars.helpers,
                    show_footer: "show_footer"
                });
            });
        },
        getLikesCount:function(req,res){
           knex('post')
            .join('likes', 'post.id', '=', 'likes.post_id')
            .count()
            .where('post.id','=',req.params.id)
            .then(function (count) { 
                count=JSON.stringify(count);
                count=JSON.parse(count);
                res.send(count[0].count);
            });
        },
        
       
        follow:function(req,res){
            var username = req.body.username;
            var follow ={
                id:common.generateId(),
                following:username,
                follower:req.session.users_name
            }
             knex.transaction(function(trx) {
                    knex('user_follow').transacting(trx)
                    .insert(follow)
                    .then(trx.commit)
                    .catch(trx.rollback);
                })
                .then(function(resp) {
                    console.log('Transaction complete.');
                    res.send(200);
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        following:function(req,res){
                knex('user_follow').count()
                .where({following:req.params.username})
                .first()
                .then(function(data){
                    data = util.setJSONParse(data);
                    res.send(data);
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                })
        },
        followerCount:function(req,res){
            var user = req.params.user;
            model.user_follow
            .where('following',user)
            .count().then(function(count){
                res.send(count);
            });
        },
       
        panel:function(req,res){
            var name = req.params.name;
            knex('users').join('user_account','users.username','=','user_account.users_name')
            .join('penjual','users.username','=','penjual.username').select('*').then(function(data){
            data = JSON.stringify(data);
            data = JSON.parse(data);
                res.render('penjual/panel_penjual', { 
                        title: 'Panel', 
                        data: data, 
                        config: req.config.get('application'),
                        session: req.session,
                        message: common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        helpers: req.handlebars.helpers,
                        show_footer: "show_footer"
                });
            });
        },
        
        dbInsert:function(req,res){
            //#region province
            var province = [{id:1,provinsi:'Bali'},
            {id:2,provinsi:'Bangka Belitung'},
            {id:3,provinsi:'Banten'},
            {id:4,provinsi:'Bengkulu'},
            {id:5,provinsi:'DI Yogyakarta'},
            {id:6,provinsi:'DKI Jakarta'},
            {id:7,provinsi:'Gorontalo'},
            {id:8,provinsi:'Jambi'},
            {id:9,provinsi:'Jawa Barat'},
            {id:10,provinsi:'Jawa Tengah'},
            {id:11,provinsi:'Jawa Timur'},
            {id:12,provinsi:'Kalimantan Barat'},
            {id:13,provinsi:'Kalimantan Selatan'},
            {id:14,provinsi:'Kalimantan Tengah'},
            {id:15,provinsi:'Kalimantan Timur'},
            {id:16,provinsi:'Kalimantan Utara'},
            {id:17,provinsi:'Kepulauan Riau'},
            {id:18,provinsi:'Lampung'},
            {id:19,provinsi:'Maluku'},
            {id:20,provinsi:'Maluku Utara'},
            {id:21,provinsi:'Nanggroe Aceh Darussalam {id:NAD}'},
            {id:22,provinsi:'Nusa Tenggara Barat {id:NTB}'},
            {id:23,provinsi:'Nusa Tenggara Timur {id:NTT}'},
            {id:24,provinsi:'Papua'},
            {id:25,provinsi:'Papua Barat'},
            {id:26,provinsi:'Riau'},
            {id:27,provinsi:'Sulawesi Barat'},
            {id:28,provinsi:'Sulawesi Selatan'},
            {id:29,provinsi:'Sulawesi Tengah'},
            {id:30,provinsi:'Sulawesi Tenggara'},
            {id:31,provinsi:'Sulawesi Utara'},
            {id:32,provinsi:'Sumatera Barat'},
            {id:33,provinsi:'Sumatera Selatan'},
            {id:34,provinsi:'Sumatera Utara'}];
            //#endregion
            
            knex.transacting(function(trx){
                return knex('province')
                .transacting(trx)
                .insert(province)
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(function(){
                res.send(200);
            })
            .catch(function(err){
                res.send(409);
            })

        },
        db:function(req,res){
               var query=req.params.query;
               knex.raw(query).then(function(data){
                   data=JSON.parse(JSON.stringify(data));
                   res.send(data.rows);
               }).catch(function(err){
                   res.send(409);
            })
        }
        


}



var express = require('express');
var common = require('./common');
var router = express.Router();
var model=require('.././model/model');
var controller=require('../controller').admin;
var knexfile=require('../knexfile');
var knex=knexfile.knex;
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var fs = require('fs');
var path = require('path');
var db=require('../controller/db').admin;
var restrict = common.restrict_admin;
router.get('/',restrict,function (req,res) {  
    res.render('admin/index', { 
        title       : 'Shop',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });});

router.get('/admin',restrict,function(req,res){
    res.render('admin/add_admin', { 
        title       : 'Admin',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });
});
router.get('/katalog',restrict,function(req,res){
    res.render('admin/katalog', { 
        title       : 'Katalog',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });
});


router.get('/pembayaran',restrict,function(req,res){
    res.render('admin/pembayaran', { 
        title       : 'Pemabayaran',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });
});

router.get('/katalog/list',restrict,function(req,res){
    knex('katalog').select('*')
    .then(function(data){
        data = db.setJSONParse(data);
        console.log(data)
        res.send(data);
    }).catch(function(err){
        res.send(409);
    })
});

router.get('/orders',restrict,function(req,res){
    knex('orders').select('*')
    .then(function(data){
        data = db.setJSONParse(data);
        console.log(data)
        res.send(data);
    }).catch(function(err){
        res.send(409);
    })
});
router.post('/orders/sukses',restrict,function(req,res){
    knex.transaction(function(trx){
        return knex('orders').transacting(trx)
        .where({id:req.body.id})
        .update({verification:true})
        .then(function(){
            return knex('order_details')
            .transacting(trx)
            .where({order_id:req.body.id})
            .update({status:2})
        })
        .catch(trx.rollback)
    }).then(function(){
        res.send(200);
    }).catch(function(err){
        console.log(err);
        res.send(409);
    });
})
router.get('/order/details/:oid',restrict,
function(req,res){

    knex('order_details as a')
    .join('products as b','a.product_id','b.id')
    .where({order_id:req.params.oid})
    .select('*').then(function(data){
        data = db.setJSONParse(data);
        res.send(data);
    }).catch(function(err){
        console.log(err);
        res.send(409);
    });
})
router.get('/auth/:id/:status',restrict,function(req,res,next){
        var params=req.params;
         var doc={
            confirmation:params.status
        };
        db.singleUpdate('user_account',doc,{id:params.id})
        .then(function(resp) {
            var message ='Confirmation Status Change Complete.'; 
            req.session.message = message;
            req.session.message_type = "success";
            res.redirect('/protected/users');
        })
        .catch(function(err) {
            console.error(err);
        });
        });
router.get('/users',restrict,function(req,res,next){
    res.render('admin/users', { 
            title       : 'User Control',
            session     : req.session,
            all         : true,
            message     : common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            config      : req.config.get('application'),
            helpers     : req.handlebars.helpers,
            page_url    : req.config.get('application').base_url,
            show_footer : "show_footer"
    });
});
router.get('/users/active',restrict,function(req,res,next){
        res.render('admin/users', { 
                title       : 'User Control',
                active      :true,
                
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
        });
   });
router.get('/users/unverified',restrict,function(req,res,next){
    res.render('admin/users', { 
            title       : 'User Control',
            session     : req.session,
            unverified  : true,
            
            message     : common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            config      : req.config.get('application'),
            helpers     : req.handlebars.helpers,
            page_url    : req.config.get('application').base_url,
            show_footer : "show_footer"
    });
});
router.get('/users/cancel',restrict,function(req,res,next){
    res.render('admin/users', { 
        title       : 'User Control',
        // results     : data,
        session     : req.session,
        cancel      : true,
        
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });
});
router.get('/users/cancel/get',restrict,function(req,res){
    db.getCancelUsers().then(function(data){
        data =db.setJSONParse(data);
        res.send(data);
    });
});

router.get('/users/edit/:id',restrict,function(req,res){
    var id = req.params.id;
    db.getUser(id).then(function(data){
        data = db.setJSONParse(data);
        res.send(data);
    });
}); //pending
router.get('/users/all/get',restrict,function(req,res){
    db.getAllUsers().then(function(data){
        data =db.setJSONParse(data);
        res.send(data);
    });
});
router.get('/users/active/get',restrict,function(req,res){
    db.getActiveUsers().then(function(data){
        data =db.setJSONParse(data);
        res.send(data);
    });});
router.get('/users/unverified/get',restrict,function(req,res){
    db.getUnverifiedUsers().then(function(data){
        data =db.setJSONParse(data);
        res.send(data);
    });});
router.route('/login').get(function(req,res){
    res.render('admin/login', { 
        title       : 'User Control',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });
}).post(function(req,res){
        db.authLogin(req.body.username,req.body.password)
        .then(function(data){
        data = db.setJSONParse(data);
        if(data){
            req.session.users_name = data.username;
            req.session.user_id    = data.id;
            req.session.user_type = 'admin';
            req.session.user      = data.username;
              res.redirect('/protected');
        }else{
            res.redirect('/protected/login');
        }

    });
});
router.post('/admin/insert',restrict,function(req,res){
                var body=req.body;
                var doc={
                    username:body.users_name,
                    fullname:body.name,
                    password:body.password
                };
                db.singleInsert('admin_account',doc)
                .then(function(resp) {
                    console.log('Transaction input admin Complete.');
                    res.redirect('/protected');
                })
                .catch(function(err) {
                    console.error(err);
                });
            });


router.get('/dashboard',restrict,function(req,res){
     res.render('admin/dashboard', { 
                title       : 'User Control',
                // results     : results,
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
        });});
router.get('/ads/banner',restrict,function(req,res){
    res.render('admin/ads_banner', { 
        title       : 'User Control',
        // results     : results,
        session     : req.session,
        message     : common.clear_session_value(req.session, "message"),
        message_type: common.clear_session_value(req.session, "message_type"),
        config      : req.config.get('application'),
        helpers     : req.handlebars.helpers,
        page_url    : req.config.get('application').base_url,
        show_footer : "show_footer"
    });});
router.get('/ads/banner/edit/:id',restrict,function(req,res){
    db.singleSelect('banner',{id:req.params.id},'*')
    .then(function(data){
        data = db.setJSONParse(data);
        res.send(data);
    });
});
router.all('/ads/banner/new',restrict,upload.single('upload_file'),function(req,res){
    if(req.method==='GET'){
        res.render('admin/ads_banner', { 
                title       : 'User Control',
                // results     : results,
                new         :true,
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
        var body=req.body;
        var id = common.generateId();
        var upload_dir = "public/uploads/banner/"+"user-"+id;
        common.check_directory_sync(upload_dir);
        var file = req.file;
        var source = fs.createReadStream(file.path);
        var pathfile =path.join(upload_dir, file.originalname.replace(/ /g,"_"));
        var dest = fs.createWriteStream(pathfile);
        source.pipe(dest);
        source.on("end", function() {});
        fs.unlink(file.path, function (err) {});
        var doc={
            id:id,
            title:body.title,
            image:'/uploads/banner/'+'user-'+id+'/'+file.originalname,
            permalink:body.permalink,
            create_by:req.session.users_name,
            featured:false
        };
        
        singleInsert('banner',doc)
        .then(function(data){
            res.redirect('/protected/ads/banner/new');    
        }).catch(function(err){
            console.log(err);
        });
    }});
router.get('/ads/banner/edit',restrict,function(req,res){
    db.singleSelect('banner',true,'*').then(function(data){
        data=db.setJSONParse(data);
          res.render('admin/ads_banner', { 
            title       : 'User Control',
            data        : data,
            edit        : true,
            new         :false,
            auth        :false,
            session     : req.session,
            message     : common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            config      : req.config.get('application'),
            helpers     : req.handlebars.helpers,
            page_url    : req.config.get('application').base_url,
            show_footer : "show_footer"
         });
    });});
router.get('/ads/banner/auth/:id/:cond',restrict,function(req,res){
    var id = req.params.id;
    var cond = req.params.cond;
    var doc = {
        featured:cond
    };
    db.singleUpdate('banner',doc,{id:id})
    .then(function(resp){
        res.send(200);
    }).catch(function(err){
        console.log(err);
        res.send(409);
    });
});
router.get('/ads/banner/auth',restrict,function(req,res){
    db.singleSelect('banner',true,'*').then(function(data){
        data=db.setJSONParse(data);
          res.render('admin/ads_banner', { 
            title       : 'User Control',
            data        : data,
            auth        : true,
            session     : req.session,
            message     : common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            config      : req.config.get('application'),
            helpers     : req.handlebars.helpers,
            page_url    : req.config.get('application').base_url,
            show_footer : "show_footer"
         });
    });});
router.post('/ads/banner/edit',restrict,upload.single('upload_file'),function(req,res){
    var body=req.body;
    var doc ={
        title:body.title,
        featured:(body.featured==='on')?true:false
    };
    db.singleUpdate('banner',doc,{id:body.id}).then(function(){
        res.redirect('/protected/ads/banner/edit');
    }).catch(function(err){
        console.log(err);
    });
});

router.get('/users/verifikasi/:users/:status',restrict,function(req,res){
    console.log(req.params.users)
    knex.transaction(function(trx) {
       return knex('user_account').transacting(trx)
        .where('username','=',req.params.users)
        .update({confirmation:req.params.status})
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            console.log('Transaction edit complete.');
            res.send(200);
        })
        .catch(function(err) {
            console.error(err);
        });
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/order/control').get(restrict,function(req,res){
    db.singleSelect('orders',true,'*')
    .then(function(data){
       data = db.setJSONParse(data);
        res.render('admin/order_control', { 
            title       : 'User Control',
            orders     : data,
            session     : req.session,
            message     : common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            config      : req.config.get('application'),
            helpers     : req.handlebars.helpers,
            page_url    : req.config.get('application').base_url,
            show_footer : "show_footer"
         });
    });
   });
router.get('/verification/:id/:cond',restrict,function(req,res){
    model.orders.where({id:req.params.id}).fetch().then(function(order){
    order=JSON.stringify(order);
    order=JSON.parse(order);
    knex.transaction(function(trx) {
        knex('orders').transacting(trx)
        .where('id','=',req.params.id)
        .update({order_verification:req.params.cond})
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            console.log('Transaction edit complete.');
            res.redirect('/protected/order/control');
        })
        .catch(function(err) {
            console.error(err);
        });
    });
});
module.exports = router;

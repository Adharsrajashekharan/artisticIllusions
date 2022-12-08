const { Router } = require('express');
var express = require('express');
const { result } = require('lodash');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
/* GET users listing. */
router.get('/', function(req, res, next) {
  
//  productHelpers.getAllProducts().then((products)=>{
 res.render('admin/admin-login')
 //res.render('admin/admin-index',{admin:true})
 // res.render('admin/view-products',{admin:true,products});
 })
 router.get('/block-user/:id',(req,res)=>{
  let userId=req.params.id
  productHelper.blockUser(userId).then((response)=>{
    res.redirect('/admin/view-users')
  })
})

router.get('/unblock-user/:id',(req,res)=>{
  let userId=req.params.id
  productHelper.unBlockUser(userId).then((response)=>{
    res.redirect('/admin/view-users')
  })
})


 router.get('/admin-index',async function(req, res, next) {
  console.log(req.session.admin);
  if(req.session.admin==true){
    let totalAmount=await productHelper.getTotalAmount()
    let totalorders=await productHelper.getAllOrders()
      res.render('admin/admin-index',{admin:true,totalorders,totalAmount})
  }
  else{
    res.redirect('/admin')
  };
})




 router.post('/',(req,res)=>{
  if(req.body.email=='adarsh@123' && req.body.password=='123456'){
    req.session.admin=true
    res.redirect('admin/admin-index')
  }else{
    res.redirect('/admin')
  }
})

router.get('/view-products',function(req,res){
  productHelpers.getAllProducts().then((products)=>{
  res.render('admin/view-products',{admin:true,products})
})
})
router.get("/view-users",function(req,res,next){
    productHelpers.getAllUsers().then((users)=>{
    res.render("admin/view-users",{admin:true,users});
  })
 })

  router.get('/add-product',function(req,res){
    res.render('admin/add-product',{admin:true})
  })
  router.post('/add-product',(req,res)=>{

    console.log(req.body);

    console.log(req.files.image)
    
productHelper.addProduct(req.body,(id)=>{
  let image=req.files.image
  image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.render("admin/add-product",{admin:true})

    }
  })
})
  })
router.get('/delete-product/:id',(req,res)=>{
         let proid=req.params.id
        console.log(proid);

        productHelpers.deleteProduct(proid).then((response)=>{
        // productHelpers.deleteProduct(proid).then((response)=>{
          res.redirect('/admin/view-products')
        })

})
router.get('/edit-product/:id',async(req,res)=>{
  let proid=req.params.id
 let product= await productHelpers.getProductDetails(proid)
 console.log(product);


   res.render('admin/edit-product',{product})
 })

 router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-products')
  })
 })
//category

router.get('/categories',(req,res)=>{
  productHelper.getCategory().then((categories)=>{
    res.render('admin/categories',{categories})
  })
})

router.get('/add-category',(req,res)=>{
  res.render('admin/add-category')
})

router.post('/add-category',(req,res)=>{
  let categoryData=req.body
  productHelper.addCategory(categoryData).then((response)=>{
    res.redirect('/admin/add-category')
  })
})

router.get('/delete-category/:id',(req,res)=>{
  let catId = req.params.id
  productHelper.deleteCategory(catId).then((response)=>{
    res.redirect('/admin/categories')
  })
})

router.get('/edit-category/:id',async(req,res)=>{
 
  let category = await productHelper.getCategoryDetails(req.params.id)

  res.render('admin/edit-category',{category})
})

router.post('/edit-category/:id',(req,res)=>{
  let catId = req.params.id
  let catDetails = req.body
  productHelper.updateCategory(catId,catDetails).then((response)=>{
    res.redirect('/admin/categories')
  })
})










 //coupon
 router.get('/add-coupon',function(req,res){
  res.render('admin/add-coupon',{admin:true})
})

router.post('/add-coupon',(req,res)=>{

  console.log(req.body);

  
productHelpers.addCoupon(req.body,(id)=>{
// let image=req.files.image
// image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
//   if(!err){
    res.render("admin/add-coupon",{admin:true})

  })
})
 

router.get("/view-coupon",function(req,res,next){
  productHelpers.getAllcoupons().then((coupons)=>{
  console.log(req.body);
  res.render("admin/view-coupons",{admin:true,coupons});
})
})
router.get('/delete-coupon/:id',(req,res)=>{
  let catId = req.params.id
  productHelper.deleteCoupon(catId).then((response)=>{
    res.redirect('/admin/view-coupon')
  })
})







router.get('/orders',async(req,res)=>{
 console.log(req.session.user);
  let orders=await productHelper.getUserOrders()
  console.log(orders);
  res.render('admin/orders',{admin:true,orders})
})

router.get('/cancel-order/:id',(req,res)=>{
  let userId=req.params.id
  productHelper.cancelOrder(userId).then((response)=>{
    res.redirect('/admin/orders')
  })
})

router.get('/place-order/:id',(req,res)=>{
  let userId=req.params.id
  productHelper.placeOrder(userId).then((response)=>{
    res.redirect('/admin/orders')
  })
})
//sales report
router.get('/sales-Report',function(req,res){
  productHelpers.getAllProducts().then((products)=>{
  res.render('admin/sales-report',{admin:true,products})
})
})





module.exports = router;

const express = require('express');

// const {response} = require("../app");

const router = express.Router();

const productHelpers = require('../helpers/product-helpers');

const userHelpers = require('../helpers/user-helpers');

// const fast2sms = require("fast-two-sms");

const verifyLogin = (req, res, next) => {
  // console.log("jhgjgj")
  if (req.session.loggedIn) {
  // console.log("gfhhgfhg")
    next();
  } else {
    // console.log("redirect")
    res.redirect('/login');
  }
};
/* GET home page. */

router.get('/', async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  let total=null
   let wishCount=null
let smallview


if (req.session.user) {
  wishCount = await userHelpers.getWishCount(req.session.user._id);
}
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then(async (products) => {
    //user passed for removing logout option
    //pass ._id
    let cartProducts
    if (req.session.user) {
     cartProducts= await userHelpers.getCartProducts(req.session.user._id)
    }
    if (req.session.user) {
      total=await userHelpers.getTotalAmount(req.session.user._id)
    }
    res.render('user/user-main',{products, user, cartCount, cartProducts, total, smallview, wishCount })
  
    // res.render('user/view-products',{products,user,cartCount});
});
});
;
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { "logerror": req.session.logerror,"Accesserr":req.session.Accesserr });
    req.session.logerror = false;

  }
});
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    userHelpers.obj.OTP = userHelpers.sendMessage(req.body.Phone);
    console.log("HIIII");
    res.redirect("/otp");
  });
});
router.post("/login", (req, res) => {
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response) => {
if(!response.status){
  req.session.logerror = "Invalid UserName or Password";
  res.redirect('/login')


}else if(!response.user.Access){
   req.session.Accesserr="You Are Blocked"
   res.redirect("/login");

}else{
  req.session.loggedIn = true;
      //checks with above req.seq .user
      req.session.user = response.user;
      console.log(req.session.user);
      res.redirect("/");
}




//     if (response.status) {
//       //session keeping
//       req.session.loggedIn = true;
//       //checks with above req.seq .user
//       req.session.user = response.user;
//       console.log(req.session.user);
//       res.redirect("/");
//     } else {
//       req.session.logerror = true;
//       res.redirect("/login");
//     }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/cart", verifyLogin, async (req, res) => {
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let products = await userHelpers.getCartProducts(req.session.user._id);
  console.log(products);
  let cartId="0";
  try{
    cartId = products[0]._id;
  }catch(err){
    cartId="0" 
  }
  const user = req.session.user._id;
  console.log(user);
  if(req.session.user){
  res.render("user/cart", { products, user, totalValue,cartId });
  }else{
       res.redirect("/login")
  }
});

router.get("/add-to-cart/:id",verifyLogin, (req, res) => {
  console.log(req.params.id + 123456);
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    //res.json({status:true})
    console.log(123456798765);
    //res.redirect("/");
  });
});
router.get('/delete-product/:id',(req,res)=>{
  let proid=req.params.id
 console.log(proid);

 userHelpers.deleteProductQuantity(proid).then((response)=>{
 // productHelpers.deleteProduct(proid).then((response)=>{
   res.redirect('/cart')

 })
})

//wishlist
// router.get('/wishlist',(req,res)=>{
//   let user=req.session.user
//   res.render("user/wishlist",{user})
// })

router.get('/add-to-wishlist/:id',verifyLogin,(req,res)=>{

  userHelpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
  })
})   
 
router.get('/wishlist',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getWishlistProducts(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products)
  if(req.session.user){
  res.render('user/wishlist',{products,user:req.session.user,total})
  }else{
    res.render("user/login")
  }
})

router.get('/delete-cart/:id',(req,res)=>{
  let proid=req.params.id
 console.log(proid);

 userHelpers.deleteWishQuantity(proid).then((response)=>{
 // productHelpers.deleteProduct(proid).then((response)=>{
   res.redirect('/wishlist')

 })
})

router.post("/delete-wish-quantity", (req, res, next) => {
  userHelpers.deleteWishQuantity(req.body).then(async (response) => {

   // response.total = await userHelpers.getTotalAmount(req.body.user_id);
    res.json(response);

  });
});











router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user_id);
    res.json(response);
  });
});


router.post("/delete-product-quantity", (req, res, next) => {
  userHelpers.deleteProductQuantity(req.body).then(async (response) => {

   // response.total = await userHelpers.getTotalAmount(req.body.user_id);
    res.json(response);

  });
});
router.post("/empty-cart", (req, res, next) => {
  userHelpers.emptyCart(req.body).then(async (response) => {

   // response.total = await userHelpers.getTotalAmount(req.body.user_id);
    res.json(response);

  });
});
 //DASHBOARD
router.get("/dashboard", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dashboard",{user});
});
router.get("/my-profile", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-my-profile",{user});
});
router.get("/address-book", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-address-book",{user});
});
router.get("/track-order", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-track-order",{user});
});
router.get("/my-orders", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-my-order",{user});
});

router.get("/my-payment-options", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-payment-option",{user});
});
router.get("/my-returns", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-cancellation",{user});
});
router.get("/edit-profile", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-edit-profile",{user});
});
router.get("/edit-address", (req, res) => {
  let user = req.session.user;
  res.render("user/dash/dash-address-edit",{user});
});
//DASHBOARD ENDS HERE

//blog
router.get("/blog",(req,res)=>{
 res.render('user/blog')
})





//listing category


router.get("/category", (req, res) => {
  let user = req.session.user;
  productHelpers.getAllProducts().then(async (products) => {
  res.render("user/shop-list-full",{user,products});
})
})
router.get("/antique", (req, res) => {
  let user = req.session.user;
  productHelpers.getAntiqueProducts().then(async (products) => {
  res.render("user/category/shop-list-antique",{user,products});
})
})
router.get("/festive", (req, res) => {
  let user = req.session.user;
  productHelpers.getFestiveProducts().then(async (products) => {
  res.render("user/category/shop-list-festive",{user,products});
})
})
router.get("/lights", (req, res) => {
  let user = req.session.user;
  productHelpers.getLightsProducts().then(async (products) => {
  res.render("user/category/shop-list-lights",{user,products});
})
})


//listing-category ends here
//contact-page

router.get("/contact", (req, res) => {
  let user = req.session.user;
  res.render("user/contact",{user});
});

// user profile

 router.post('/edit-user',(req,res)=>{
  let user = req.session.user;
  productHelpers.updateUser(user._id,req.body).then(()=>{
    res.render("user/dash/dash-edit-profile",{user});
  })
 })






//user profile ends
router.get("/otp", (req, res) => {
  res.render("user/otp");
});


router.post("/otp", (req, res) => {
  if (req.body.otp == userHelpers.obj.OTP) {
    res.redirect("/login");
  } else {
    res.send("eeeeee");
  }
});
router.get('/place-order',async (req,res)=>{
let total=await userHelpers.getTotalAmount(req.session.user._id)
let cartProducts  = await userHelpers.getCartProducts(req.session.user._id);

  res.render('user/place-order',{cartProducts,total,user:req.session.user})
}) 
router.get('/product-detail/:id',async (req,res)=>{
  const id = req.params.id
  productHelpers.getAllProducts().then(async (products) => {
  productHelpers.getSingleProducts(id).then((product) => {
  res.render('user/product-detail',{product,products})
})
})
})
router.post('/place-order',async(req,res)=>{

  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
console.log(totalPrice+"gdgdhf")

  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body.payment==='COD'){
        res.json({codSuccess:true})
      }else{
         userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
           res.json(response)

         })
      }

  })
  console.log(req.body);

})

let discountAdded;
let coupon;

router.post('/coupon-check',async(req,res)=>{
  console.log("coupon checkinggg");
  console.log(req.body);
  const userId = req.body.userId
  let totalPrice = await userHelpers.getTotalAmount(userId)
    productHelpers.getCoupon(req.body)
        .then((findcoupon)=>{
          console.log("checking then findcoupon",findcoupon);


          if (findcoupon == null) {
            res.json({ code: true, errMsg: "Invalid Coupon" });
            // console.log("no coupon");
          } else if (findcoupon.user) {
            console.log("inside loop");
            let n = 0;
            for (couponUser of findcoupon.user) {
              if (couponUser == userId) {
                n++;
              }
            }
            if (n > 0) {
              res.json({ status: true, errMsg: "Coupon already used" });
            } else {
              coupon = findcoupon.name;
              let value = parseInt(findcoupon.minvalue);
              let discount = parseInt(findcoupon.Discount);
      
              if (totalPrice > value) {
                discountAdded = totalPrice - discount;
                res.json({ discountAdded, discount, errMsg: "Coupon Applied" });
                // console.log(discountAdded);
              } else {
                res.json({ value, errMsg: "Amount is Not Enough" });
                // console.log("coupon min value is",value );
              }
            }
          }else {
            coupon = findcoupon.name;
            let value = parseInt(findcoupon.minvalue);
            let discount = parseInt(findcoupon.Discount);
    
            if (totalPrice > value) {
              discountAdded = totalPrice - discount;
              res.json({ discountAdded, discount, errMsg: "Coupon Applied" });
              // console.log(discountAdded);
            } else {
              res.json({ value, errMsg: "Amount is Not Enough" });
              // console.log("coupon min value is",value );
            }
          }
        })
})


router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  console.log("check verify");
  userHelpers.verifyPayment(req.body).then(()=>{
 userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
  console.log("payment sucessfull");
  res.json({status:true})
 })
}).catch((err)=>{
  console.log(err);
  res.json({status:false,errmsg:"errorhappened"})
})
})

module.exports = router;

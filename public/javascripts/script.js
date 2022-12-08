function addToCart(proid){
    console.log("jfgjkhfjfjhff");
    $.ajax({
        url:'/add-to-cart/'+proid,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }// alert(response)
        }
    })
}
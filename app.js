let listCartHtml = document.querySelector('.ListCart');
let IconCartSpan = document.querySelector('.Cart_amount')
let Container = document.querySelector(".Container");
let TotalCartPrice = document.getElementById('TotalCartPrice');
const CheckOutBtn = document.getElementById('CheckOut');


let Products = [];
let Carts = [];
initApp()

function showCart(){
    let CartDisplay = document.querySelector(".Cart");
    let body = document.querySelector('body');
    let Close = document.getElementById('Close');
    CartDisplay.onclick = () => {
        body.classList.toggle('ShowCart')
    }
    Close.onclick = () => {
        body.classList.toggle('ShowCart')
    }
}showCart();

function initApp(){
    fetch("json/products.json")
    .then(response => response.json())
    .then(data => {
    Products = data;
    AddDataToHtml();

    if(localStorage.getItem('cart')){
        Carts = JSON.parse(localStorage.getItem('cart'));
        AddCartToHtml();
        CalculateTotalPrice();
    }
})
}

function  AddDataToHtml(){
    Products.forEach( product => {
        let NewItem = document.createElement('a');
        let imageDiv = document.createElement('a');
        let nameDiv = document.createElement('div');
        let priceDiv = document.createElement('div');

        imageDiv.href = '/details.html?id=' + product.id;
        
        NewItem.classList.add("Product-container");
        imageDiv.classList.add("img-container");
        nameDiv.classList.add("product-name");
        priceDiv.classList.add("product-price");

        
        
        NewItem.dataset.id = product.id;
        
        imageDiv.innerHTML = `<img src="images/${product.image}" alt="${product.name}" class="original_image">`;
        nameDiv.innerHTML = `<h5>${product.name}</h5>`;
        priceDiv.innerHTML = `
            <p>${product.price}</p>
            <button class="Add_Cart_Btn" style="font-weight:600;">
                Add To Cart
                <svg class="Add_Cart_Btn width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"/>
                </svg>
            </button>
        `;
        
        NewItem.appendChild(imageDiv);
        NewItem.appendChild(nameDiv);
        NewItem.appendChild(priceDiv);
        Container.appendChild(NewItem);
    } )
}

Container.addEventListener("click", event => {
    let positionClick = event.target;
    // alert(positionClick)
    if(positionClick.classList.contains('Add_Cart_Btn')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        AddToCart(product_id);
    }
})

function AddToCart(product_id){
    let PositionThisProductInCart = Carts.findIndex((value) => value.product_id == product_id)
    if(Carts.length <=0){
        Carts = [{
            product_id: product_id,
            quantity:1
        }]
    }else if(PositionThisProductInCart < 0){
        Carts.push({
            product_id:product_id,
            quantity:1
        })
    }else{
        Carts[PositionThisProductInCart].quantity = Carts[PositionThisProductInCart].quantity + 1;
    }
    AddCartToHtml();
    AddCartToMemory();
    CalculateTotalPrice();
}

function AddCartToHtml(){
    listCartHtml.innerHTML = '';
    let TotalQuantity = 0;
    TotalQuantity = TotalQuantity + Carts.length;
    
    if(Carts.length > 0){
        Carts.forEach(cart => {
            // TotalQuantity = cart.quantity;
            let NewCart = document.createElement('div');
            NewCart.classList.add('item');
            NewCart.dataset.id = cart.product_id;
            let PositionProduct = Products.findIndex( (value) => value.id === cart.product_id);
                if(PositionProduct >= 0){
                    let info = Products[PositionProduct];
                    NewCart.innerHTML = `
                    <div class="image">
                        <img src="images/${info.image}" alt="${info.name}">
                    </div>
                    <div class="name">
                        ${info.name}
                    </div>
                    <div class="totalPrice">
                        ${info.price * cart.quantity}
                    </div>
                    <div class="Quantity">
                        <button class="Decrease">-</button>
                        <button id="ProductQuantity" >${cart.quantity}</button>
                        <button class="Increase" >+</button>
                    </div>
                    `;
                    listCartHtml.appendChild(NewCart);
                }
        });
    }
    IconCartSpan.innerText = TotalQuantity;
}

function AddCartToMemory(){
    const validCarts = Carts.filter(item => item.product_id && item.quantity && item.quantity > 0);

    localStorage.setItem('cart', JSON.stringify(validCarts));
}

listCartHtml.addEventListener("click", (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('Decrease')  || positionClick.classList.contains('Increase')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'Decrease';
        if(positionClick.classList.contains('Increase')){
            type = 'Increase';
        }
        changeQuantity(product_id,type);
    }
});

function changeQuantity(product_id,type){
    let positionItemInCart = Carts.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        switch(type){
            case 'Increase':
                Carts[positionItemInCart].quantity = Carts[positionItemInCart].quantity + 1;
                break;

            default:
                let valueChange = Carts[positionItemInCart].quantity -1;
                if(valueChange > 0){
                    Carts[positionItemInCart].quantity = valueChange;
                }else{
                    Carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    AddCartToMemory();
    AddCartToHtml();
    CalculateTotalPrice();
}

function CalculateTotalPrice(){
    let total = 0;

    Carts.forEach(cart => {
        let PositionOfPrice = Products.findIndex((product) => product.id == cart.product_id);
        
        if(PositionOfPrice >= 0){
            let price = Products[PositionOfPrice];
            total += price.price * cart.quantity;
            localStorage.setItem('Price', JSON.stringify(total));
            localStorage.setItem('Quantity', JSON.stringify(Carts.length));
        }
    });
    TotalCartPrice.innerText = `Ksh ${Number(total).toFixed(2)}`;
}

    CheckOutBtn.addEventListener('click', () => {
        if(Carts.length === 0){
            alert("Your Cart is empty. Add some products before proceeding to checkout");
            return;
        }
        const checkoutInfo = Carts.map(cart => {
            const product = Products.find(p => p.id === cart.product_id);
            return{
                name:product.name,
                image:`images/${product.image}`,
                quantity:cart.quantity,
                price:product.price * cart.quantity
            }
        })
        localStorage.setItem('checkoutInfo', JSON.stringify(checkoutInfo));
        window.location.href = 'Account.html';
    });


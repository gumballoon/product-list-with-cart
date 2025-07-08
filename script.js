const allDesserts = document.querySelector('#all-desserts');
const template = document.querySelector('template');

// populate allDesserts w/ the desserts data
desserts.forEach((d, index) => {
    // clone the template content
    const dessert = template.content.cloneNode(true);

    dessert.querySelector('.img-mobile').src = d.images.mobile;
    dessert.querySelector('.img-tablet').src = d.images.tablet;
    dessert.querySelector('.img-desktop').src = d.images.desktop;

    const defaultButton = dessert.querySelector('default-button');
    if(!d.quantity) {
        defaultButton.setAttribute('disabled', true);
        defaultButton.querySelector('.zero-stock').classList.remove('d-none');
    }

    dessert.querySelector('.category').textContent = d.category;
    dessert.querySelector('.name').textContent = d.name;
    dessert.querySelector('.price').textContent = d.price.toFixed(2);

    // hidden fields to hold info for future use
    dessert.querySelector('.quantity').value = d.quantity;
    dessert.querySelector('.img-thumbnail').value = d.images.thumbnail;

    allDesserts.appendChild(dessert);
})

const defaultButtons = document.querySelectorAll('.default-button');
const selectedButtons = document.querySelectorAll('.selected-button');
const cartEmpty = document.querySelector('#cart-empty')
const cartFull = document.querySelector('#cart-full')
const cartItems = document.querySelector('#cart-items')
const cartTotalItems = document.querySelector('#total-items');
const cartTotalPrice = document.querySelector('#total-price');
const confirmOrder = document.querySelector('#cart-full button');
const blurriedBackground = document.querySelector('#blurry');
const confirmationItems = document.querySelector('#confirmation-items');
const newOrder = document.querySelector('#confirmation button');

// to add a dessert to the cart
function addToCart(name, price, thumbnail, id) {
    const section = document.createElement('section');
    section.classList.add('fw-semibold', 'rose-400');

    // includes one hidden <inputs> w/ the thumbnail path (only to be used on the confirmation log)
    section.innerHTML = `
        <h3 class="fs-6 fw-semibold rose-900 mt-2 mb-1">${name}</h3>
        <span class="orange item-qty">1x</span>
        @
        <span class="rose-400 price">${price.toFixed(2)}</span>
        <span class="total">${price.toFixed(2)}</span>
        <svg class="img-fluid remove" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" title="remove all items of this dessert from the cart" aria-label="remove all items of this dessert from the cart"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>

        <input type="hidden" value="${thumbnail}" class="d-none img-thumbnail">
    `

    cartItems.appendChild(section);

    // to remove the dessert entry on the cart, update the totals & hide the selected button
    const removeButton = section.querySelector('.remove');
    removeButton.addEventListener('click', function(){
        for(dessert of allDesserts.children){
            const dessertName = dessert.querySelector('.name').textContent;
            const dessertSelectedButton = dessert.querySelector('.selected-button');
            if (name === dessertName){
                dessertSelectedButton.classList.add('d-none');
            }
        }
        this.parentElement.remove();
        updateCartTotal();
        isCartEmpty();
    })

    updateCartTotal();

    isCartEmpty();
}

// to update the quantity of a dessert on the cart vs. delete the entry
function updateCart(name, totalQuantity){
    for (item of cartItems.children){
        // to get the name
        const itemName = item.querySelector('h3');
        if (name === itemName.textContent){
            if (totalQuantity === 0){
                item.remove();
            } else {
                // to get the <span> w/ the quantity & its value (w/o the 'x')
                const itemQuantity = item.querySelector('.item-qty');
                // to update the item quantity value (+1 vs. -1)
                itemQuantity.textContent = totalQuantity + 'x';

                // to get the item price
                const itemPrice = parseFloat(item.querySelector('.price').textContent);
                // to get the <span> w/ the total price per item
                const totalPrice = item.querySelector('.total')
                // to update the item total price
                totalPrice.textContent = (totalQuantity * itemPrice).toFixed(2);
            }
        }
    }

    updateCartTotal();
}

// to update the total number of items in the cart & the total price of it
function updateCartTotal(){
    let totalItems = 0;
    let totalPrice = 0;

    for (item of cartItems.children){
        totalItems += parseInt(item.querySelector('.item-qty').textContent[0])
        totalPrice += parseFloat(item.querySelector('.total').textContent);
    }

    cartTotalItems.textContent = totalItems;
    cartTotalPrice.textContent = '$' + totalPrice.toFixed(2);

    isCartEmpty();
}

// to hide/show the layouts for cart empty vs. full
function isCartEmpty(){
    if (cartTotalItems.textContent === '0'){
        cartEmpty.classList.remove('d-none');
        if (!cartFull.classList.contains('d-none')){
            cartFull.classList.add('d-none');
        }
    } else {
        cartFull.classList.remove('d-none');
        if (!cartEmpty.classList.contains('d-none')){
            cartEmpty.classList.add('d-none');
        }
    }
}

// to hide the 'Add to Cart' button vs. show the selected button & update the cart
for (let button of defaultButtons){
    // to get the dessert ID (contained on id attribute of the parent <section>)
    const id = button.parentElement.id;
    // to get the associated selected-button (hidden by default)
    const selectedButton = button.nextElementSibling;

    button.addEventListener('click', function(){
        const section = this.parentElement.parentElement;
        const name = section.querySelector('.name').textContent;
        const price = parseFloat(section.querySelector('.price').textContent);
        const thumbnail = section.querySelector('.img-thumbnail').value;

        // to set the span w/ the total quantity to 1
        selectedButton.children[1].textContent = 1;

        // to add the dessert to the cart, w/ the thumbnail path & id hidden (only to be used on the confirmation log)
        addToCart(name, price, thumbnail, id);

        // to show the selected-button
        selectedButton.classList.remove('d-none');
    })
}

// get the current dessert info/stock & add DOM button events
function addButtonEvents(){
    for (button of selectedButtons){
        // get the dessert ID (contained on id attribute of the parent <section>)
        const section = button.parentElement.parentElement;
        // get the current info of the dessert (it will reflect any stock changes during the order)
        const name = section.querySelector('.name').textContent;
        const totalStock = section.querySelector('.quantity').value;

        // get the hover effect on - +
        for (symbol of button.children){
            if (symbol.classList.contains('quantity')){
                symbol.addEventListener('mouseover', function(){
                    this.children[0].setAttribute('fill', 'hsl(14, 86%, 42%)');
                })
                symbol.addEventListener('mouseout', function(){
                    this.children[0].setAttribute('fill', '#FFF');
                })
            }  

            // get the span w/ the total quantity
            const span = button.children[1];
            // get the zero-stock message
            const zeroStock = button.querySelector('.zero-stock');
    
            // update the total quantity (minus vs. plus)
            symbol.addEventListener('click', async function(){
                // get the current total quantity
                let totalQuantity = parseInt(span.textContent);
    
                // update the quantity value (+1 vs. -1) + the cart
                if (this.classList.contains('plus') && totalQuantity < totalStock){
                    totalQuantity += 1;
                } else if (this.classList.contains('minus')) {
                    totalQuantity -= 1;
                }
                updateCart(name, totalQuantity)
                span.textContent = totalQuantity;
    
                // hide the selected-button if the quantity is 0
                if (totalQuantity === 0){
                    this.parentElement.classList.add('d-none');
                    // remove the dessert from the cart
                    updateCart(name, 0);
                }
    
                // show/hide the zero-stock message
                if (totalQuantity === totalStock){
                    zeroStock.classList.remove('d-none');
                } else {
                    zeroStock.classList.add('d-none');
                }
            })
        }
    }
}
addButtonEvents();

// generate & show the CONFIRMATION log (w/ the blurried background)
confirmOrder.addEventListener('click', async function(){    
    for (let dessert of cartItems.children){
        const name = dessert.querySelector('h3').textContent;
        const itemQuantity = dessert.querySelector('.item-qty').textContent[0];
        const price = dessert.querySelector('.price').textContent;
        const total = dessert.querySelector('.total').textContent;
        const thumbnail = dessert.querySelector('.img-thumbnail').value;
        
        const section = document.createElement('section');
        section.classList.add('d-flex', 'row', 'mt-2');

        section.innerHTML = `
            <img src="${thumbnail}" alt="" class="rounded-3 col-2">
            <div class="col-8 rose-400">
                <h3 class="fs-6 rose-900 mt-2 mb-1 fw-semibold">${name}</h3>
                <span class="orange item-qty me-4 fw-semibold">${itemQuantity}x</span>
                @
                <span class="rose-400 fw-semibold price">$${price}</span>
            </div>
            <span class="total col-2 fw-semibold">$${total}</span>
        `

        confirmationItems.appendChild(section);
    }

    const orderTotal = document.createElement('p');
    orderTotal.classList.add('fs-6', 'mt-4', 'd-flex', 'justify-content-between');
    orderTotal.innerHTML = `Order Total 
        <span id="total-price" class="fs-5 fw-bold">${cartTotalPrice.textContent}</span>
    `
    confirmationItems.appendChild(orderTotal)

    blurriedBackground.classList.remove('d-none');
})

// reload the page
newOrder.addEventListener('click', function(){
    window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    window.location.reload();
})

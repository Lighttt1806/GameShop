let lastScrollTop = 0;
const header = document.getElementById('mainHeader');
let scrollTimeout;

window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout); // Clear previous timeout to avoid flickering
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling Down
    header.style.transition = 'top 0.3s ease-in-out'; // Smooth transition
    header.style.top = '-100px'; // Adjust to header's height
  } else {
    // Scrolling Up
    header.style.transition = 'top 0.3s ease-in-out';
    header.style.top = '0';
  }

  lastScrollTop = scrollTop;

  // Optional: Delay to avoid rapid triggers
  scrollTimeout = setTimeout(() => {
    if (scrollTop <= 0) {
      header.style.top = '0'; // Reset if scrolled to the top
    }
  }, 100);
});

let iconCart = document.querySelector('.iconCart');
let icons = document.querySelector('.icons');
let cart = document.querySelector('.cart');
let btnClose = document.querySelector('.close');

// Toggle cart visibility
iconCart.addEventListener('click', function() {
  if (cart.style.right == '-100%') {
    cart.style.right = '0';
    icons.style.transform = 'translate(0)';
  } else {
    cart.style.right = '-100%';
    icons.style.transform = 'translate(0)';
  }
});

btnClose.addEventListener('click', function() {
  cart.style.right = '-100%';
  icons.style.transform = 'translate(0)';
});

// Declare products globally to be used in the addCart function
let products = [];
let listCart = [];

// Fetch the products from 'index.json' and initialize the products array
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");

  fetch('index.json')  // Ensure the path to 'index.json' is correct
    .then(response => response.json())
    .then(data => {
      console.log("Fetched products:", data);  // Log the fetched data to confirm the response

      if (data.Latest && data.PreOrder && data.GiftCards && data.PlayStations && data.PS4) {
        let latestProducts = data.Latest;
        let preorderProducts = data.PreOrder;
        let giftCards = data.GiftCards;
        let playStations = data.PlayStations;
        let ps4 = data.PS4;

        // Set products globally to be used in the addCart function
        products = [...latestProducts, ...preorderProducts, ...giftCards, ...playStations, ...ps4];

        // Add Latest Products to HTML
        AddProductsToHTML(latestProducts, '.latest-products');

        // Add PreOrder Products to HTML
        AddProductsToHTML(preorderProducts, '.preorder-products');

        AddProductsToHTML(giftCards, '.giftcards-products');

        AddProductsToHTML(playStations, '.playstations-products');

        AddProductsToHTML(ps4, '.ps4-products');
      } else {
        console.error("Invalid product data structure. Missing 'Latest' or 'PreOrder'.");
      }
    })
    .catch(error => console.error('Error fetching data:', error));

  // Function to add products to HTML
  function AddProductsToHTML(products, containerClass) {
    let container = document.querySelector(containerClass);

    // Check if the container exists
    if (!container) {
      console.error(`Container with class ${containerClass} not found.`);
      return;
    }

    // Clear existing products
    container.innerHTML = '';

    // Loop through products and create HTML for each one
    products.forEach(product => {
      let newProduct = document.createElement('div');
      newProduct.classList.add('item');
      newProduct.innerHTML = `
        <div class="itemProduct">
          <img src="${product.image}" alt="${product.name}">
          <div class="game-name d-flex justify-content-between">
            <h5>${product.name}</h5>
            <i class="fa-regular fa-heart text-end"></i>
          </div>
          <div class="game-price d-flex">
            <p><strike>$${product.discount}</strike></p>
            <p class="price mx-3">$${product.price}</p>
          </div>
          <hr>
          <p class="ps">${product.ps}</p>
          <button class="button" onclick="addCart(${product.id})">
            <span>Add to Cart</span>
            <div class="container">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>
          </button>
        </div>
      `;
      container.appendChild(newProduct);
    });
  }
});

// Function to check the cart data from cookies
function checkCart() {
  const cookieValue = document.cookie
    .split(';')
    .find(row => row.startsWith('listCart='));

  if (cookieValue) {
    try {
      const decodedValue = decodeURIComponent(cookieValue.split('=')[1]);
      listCart = JSON.parse(decodedValue);

      if (!Array.isArray(listCart)) {
        listCart = [];
      }
    } catch (error) {
      console.error('Error parsing cart data:', error);
      document.cookie = "listCart=[]; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/;";
      listCart = [];
    }
  } else {
    listCart = [];
  }
}
checkCart();

// Function to add a product to the cart
function addCart(productId) {
  let product = products.find(p => p.id === productId);

  if (!product) {
    console.error("Product not found with ID:", productId);
    return;
  }

  // If the product is not already in the cart, add it; otherwise, increase its quantity
  if (!listCart[productId]) {
    listCart[productId] = { ...product, quantity: 1 };
  } else {
    listCart[productId].quantity++;
  }

  // Save the updated cart to a cookie
  document.cookie = "listCart=" + encodeURIComponent(JSON.stringify(listCart)) + "; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/;";
  addCartToHTML();
}

// Function to render the cart to HTML
function addCartToHTML() {
  let listCartHTML = document.querySelector('.listCart');
  let totalHTML = document.querySelector('.totalQuantity');
  let totalPriceHTML = document.querySelector('.totalPrice');
  let totalQuantity = 0;
  let totalPrice = 0;

  // Clear existing cart HTML
  listCartHTML.innerHTML = '';

  // Render cart items and calculate total quantity and price
  listCart.forEach((product, index) => {
    if (product) {
      let newCartItem = document.createElement('div');
      newCartItem.classList.add('item');
      newCartItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="content">
          <div class="name">${product.name}</div>
          <div class="price">$${product.price}</div>
        </div>
        <div class="quantity">
          <button onclick="changeQuantity(${index}, '-')"><i class="fa-solid fa-minus"></i></button>
          <span class="value">${product.quantity}</span>
          <button onclick="changeQuantity(${index}, '+')"><i class="fa-solid fa-plus"></i></button>
        </div>
      `;
      listCartHTML.appendChild(newCartItem);
      totalQuantity += product.quantity;
      totalPrice += (product.quantity * product.price);
    }
  });

  // Update the total quantity and price in the HTML
  totalHTML.innerText = totalQuantity;
  totalPriceHTML.innerText = totalPrice + '$';
}

// Function to change the quantity of a product in the cart
function changeQuantity(productIndex, action) {
  let product = listCart[productIndex];

  if (!product) {
    return;
  }

  if (action === '+') {
    product.quantity++;
  } else if (action === '-' && product.quantity > 1) {
    product.quantity--;
  } else if (action === '-' && product.quantity === 1) {
    delete listCart[productIndex];
  }

  // Update the cart in the cookie
  document.cookie = "listCart=" + encodeURIComponent(JSON.stringify(listCart)) + "; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/;";
  addCartToHTML();
}

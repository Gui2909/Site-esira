// script.js - Interactivity & Simulated POS for Esira PDV Landing Page

// --- Mobile Navigation Menu ---
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// --- Active Nav Link on Scroll ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current) && current !== '') {
            link.classList.add('active');
        }
    });
});

// --- Interactive PDV Simulator Data & Logic ---

const PRODUCTS = [
    { id: 1, name: 'Bolo de Pote Ninho e Nutella', price: 14.50, category: 'doces' },
    { id: 2, name: 'Brigadeiro Gourmet Tradicional', price: 4.50, category: 'doces' },
    { id: 3, name: 'Fatia de Bolo Red Velvet', price: 16.00, category: 'doces' },
    { id: 4, name: 'Coxinha de Frango com Catupiry', price: 8.50, category: 'salgados' },
    { id: 5, name: 'Empada de Palmito', price: 7.50, category: 'salgados' },
    { id: 6, name: 'Pão de Queijo Recheado', price: 6.00, category: 'salgados' },
    { id: 7, name: 'Café Expresso Blend', price: 5.00, category: 'bebidas' },
    { id: 8, name: 'Suco Natural de Laranja 400ml', price: 9.00, category: 'bebidas' },
    { id: 9, name: 'Refrigerante Lata 350ml', price: 6.00, category: 'bebidas' }
];

let cart = [];
let activeCategory = 'todos';

// Render Catalog
function renderCatalog() {
    const catalogContainer = document.getElementById('catalogItems');
    if (!catalogContainer) return;

    catalogContainer.innerHTML = '';
    
    const filteredProducts = activeCategory === 'todos' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === activeCategory);

    filteredProducts.forEach(product => {
        const itemEl = document.createElement('div');
        itemEl.className = 'product-item';
        itemEl.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            <button class="btn-add" onclick="addToCart(${product.id})">Adicionar +</button>
        `;
        catalogContainer.appendChild(itemEl);
    });
}

// Filter Catalog
function filterCatalog(category) {
    activeCategory = category;
    
    // Update active category chips
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach(chip => {
        chip.classList.remove('active');
        if (chip.textContent.toLowerCase() === category || (category === 'todos' && chip.textContent.toLowerCase() === 'todos')) {
            chip.classList.add('active');
        }
    });

    renderCatalog();
}

// Add to Cart
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();
}

// Quantity Adjustments
function changeQty(productId, amount) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCartUI();
}

// Clear Cart
function clearCart() {
    cart = [];
    updateCartUI();
}

// Update Cart View
function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p>O carrinho está vazio. Adicione produtos ao lado para iniciar!</p>
            </div>
        `;
        document.getElementById('subtotalValue').textContent = 'R$ 0,00';
        document.getElementById('totalValue').textContent = 'R$ 0,00';
        return;
    }

    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-row';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(itemEl);
    });

    updateTotals();
}

// Calculate totals
function updateTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountInput = document.getElementById('discountInput');
    const discountVal = discountInput && discountInput.value ? parseFloat(discountInput.value) : 0;
    
    const finalTotal = Math.max(0, subtotal - discountVal);

    document.getElementById('subtotalValue').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalValue').textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
}

// Simulate Order Checkout
function checkoutSimulatedOrder() {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar a simulação!');
        return;
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountInput = document.getElementById('discountInput');
    const discountVal = discountInput && discountInput.value ? parseFloat(discountInput.value) : 0;
    const finalTotal = Math.max(0, subtotal - discountVal);
    
    // Generate Receipt Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    const orderNum = Math.floor(Math.random() * 9000) + 1000;

    // Build Receipt HTML
    let receiptHTML = `
        <div style="text-align: center; font-weight: bold;">*** ESIRA PDV DEMO ***</div>
        <div style="text-align: center;">Doceria e Cafe Pixel</div>
        <div style="text-align: center;">Rua Central, 123 - Centro</div>
        <div class="receipt-line"></div>
        <div>DATA: ${dateStr}   HORA: ${timeStr}</div>
        <div>PEDIDO: #${orderNum}</div>
        <div>CAIXA: 01 (OPERADOR ADMIN)</div>
        <div class="receipt-line"></div>
        <div style="font-weight: bold; display: flex; justify-content: space-between;">
            <span>ITEM / QTD</span>
            <span>TOTAL</span>
        </div>
    `;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        receiptHTML += `
            <div class="receipt-item-row" style="margin-top: 5px;">
                <span>${item.name} (${item.quantity}x)</span>
                <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    });

    receiptHTML += `
        <div class="receipt-line"></div>
        <div class="receipt-item-row">
            <span>SUBTOTAL:</span>
            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="receipt-item-row">
            <span>DESCONTO:</span>
            <span>R$ ${discountVal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="receipt-item-row" style="font-weight: bold; font-size: 1rem;">
            <span>TOTAL GERAL:</span>
            <span>R$ ${finalTotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="receipt-line"></div>
        <div style="text-align: center; font-weight: bold; margin-top: 10px;">OBRIGADO PELA PREFERENCIA!</div>
        <div style="text-align: center; font-size: 0.75rem; color: #555;">Desenvolvido por Esira Tecnologia</div>
    `;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('receiptModal').classList.add('active');
}

// Modal handling
function closeModal() {
    document.getElementById('receiptModal').classList.remove('active');
    clearCart();
    const discountInput = document.getElementById('discountInput');
    if (discountInput) discountInput.value = '';
}

// --- Contact Form Formatter & Redirect ---
function handleLeadSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const business = document.getElementById('business').value;
    const whatsapp = document.getElementById('whatsapp').value;
    
    const targetPhone = '5511942299178'; // Support / Sales number
    
    // Construct message
    const message = `Olá! Meu nome é ${name}, tenho a empresa "${business}" e gostaria de saber mais informações sobre a contratação do Esira PDV. Contato: ${whatsapp}`;
    const encodedMessage = encodeURIComponent(message);
    
    // Redirect to Whatsapp
    const whatsappURL = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// --- Real Screens Gallery Tab Switcher ---
const GALLERY_DATA = {
    dashboard: {
        title: 'Painel de Métricas (Dashboard)',
        src: 'assets/dashboard_real.png'
    },
    sales: {
        title: 'Frente de Caixa e Lançamento de Comandas',
        src: 'assets/sales_real.png'
    },
    stock: {
        title: 'Controle de Estoque e Insumos',
        src: 'assets/stock_real.png'
    },
    cash: {
        title: 'Fluxo e Turnos de Caixa (Abertura/Fechamento)',
        src: 'assets/cash_real.png'
    },
    orders: {
        title: 'Gerenciamento de Pedidos e Histórico',
        src: 'assets/orders_real.png'
    }
};

function switchGalleryTab(tabKey) {
    const data = GALLERY_DATA[tabKey];
    if (!data) return;

    // Update active tab class
    const tabs = document.querySelectorAll('.gallery-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(tabKey)) {
            tab.classList.add('active');
        }
    });

    // Update image and title
    const imgEl = document.getElementById('galleryImage');
    const titleEl = document.getElementById('galleryMockupTitle');
    
    if (imgEl && titleEl) {
        imgEl.style.opacity = '0';
        setTimeout(() => {
            imgEl.src = data.src;
            titleEl.textContent = data.title;
            imgEl.style.opacity = '1';
        }, 150);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
});


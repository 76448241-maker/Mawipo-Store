// ==========================================
// 1. INICIALIZACIÓN Y ESTADO DEL CARRITO
// ==========================================
if (window.lucide) {
    lucide.createIcons();
}

// Cargar estado del Carrito desde LocalStorage (Persistente)
let cart = JSON.parse(localStorage.getItem('mawipo_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});

// Guardar en LocalStorage
function saveCart() {
    localStorage.setItem('mawipo_cart', JSON.stringify(cart));
}

// ==========================================
// 2. FUNCIONES DEL CARRITO SIDEBAR
// ==========================================
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function addToCart(title, price) {
    // Buscar si el producto ya está en el carrito
    const itemExistente = cart.find(item => item.title === title);
    if (itemExistente) {
        itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
    } else {
        cart.push({ title, price: parseFloat(price), cantidad: 1 });
    }
    saveCart();
    updateCartUI();
    
    // Abrir el sidebar si no está activo
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar && !sidebar.classList.contains('active')) {
        toggleCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');

    if (!cartCount || !cartItems || !cartTotal) return;

    let totalItems = 0;
    cart.forEach(item => totalItems += (item.cantidad || 1));
    cartCount.innerText = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-msg">Tu carrito está vacío</p>';
        cartTotal.innerText = 'S/ 0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const cantidad = item.cantidad || 1;
        const subtotal = item.price * cantidad;
        total += subtotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:8px;';
        itemElement.innerHTML = `
            <div>
                <strong>${item.title}</strong>
                <p>S/ ${item.price.toFixed(2)} (x${cantidad})</p>
            </div>
            <button onclick="removeFromCart(${index})" style="color:red; border:none; background:none; cursor:pointer; font-size:1.2rem;">&times;</button>
        `;
        cartItems.appendChild(itemElement);
    });

    cartTotal.innerText = `S/ ${total.toFixed(2)}`;
}

// ==========================================
// 3. CHECKOUT Y PASARELA A WHATSAPP
// ==========================================
function abrirCheckout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Por favor, agrega productos antes de generar tu pedido.");
        return;
    }

    // Ocultar la barra lateral del carrito
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    // Cargar dinámicamente los productos agregados en el modal
    const contenedorResumen = document.getElementById('resumen-productos-checkout');
    let total = 0;
    
    if (contenedorResumen) {
        contenedorResumen.innerHTML = '';
        cart.forEach(item => {
            const cantidad = item.cantidad || 1;
            const subtotal = item.price * cantidad;
            total += subtotal;

            contenedorResumen.innerHTML += `
                <p style="display:flex; justify-content:space-between; margin:6px 0; font-size:14px;">
                    <span>${item.title} (x${cantidad})</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                </p>
            `;
        });
    }

    // Actualizar el total dinámico
    const totalCheckout = document.getElementById('total-checkout');
    if (totalCheckout) {
        totalCheckout.innerText = total.toFixed(2);
    }

    // Asegurar vista del Paso 1
    const paso1 = document.getElementById('checkout-paso-1');
    const paso2 = document.getElementById('checkout-paso-2');
    if (paso1) paso1.style.display = 'block';
    if (paso2) paso2.style.display = 'none';

    // Abrir el modal flotante
    const modalCheckout = document.getElementById('modal-checkout');
    if (modalCheckout) {
        modalCheckout.style.display = 'flex';
    }
}

function cerrarCheckout() {
    const modalCheckout = document.getElementById('modal-checkout');
    if (modalCheckout) {
        modalCheckout.style.display = 'none';
    }
    
    const paso1 = document.getElementById('checkout-paso-1');
    const paso2 = document.getElementById('checkout-paso-2');
    if (paso1) paso1.style.display = 'block';
    if (paso2) paso2.style.display = 'none';
}

function procesarPago(event) {
    if (event) event.preventDefault();

    // 📱 Teléfono de WhatsApp MAWIPO con código Perú (51)
    const miTelefono = "51920455888"; 

    // Capturar datos del formulario
    const form = document.getElementById('form-envio');
    const inputs = form ? form.querySelectorAll('input[type="text"], input[type="tel"]') : [];
    
    const nombre = inputs[0] ? inputs[0].value : "Cliente";
    const telefono = inputs[1] ? inputs[1].value : "No especificado";
    const direccion = inputs[2] ? inputs[2].value : "No especificada";

    const metodoPagoElement = document.querySelector('input[name="pago"]:checked');
    const metodoPago = metodoPagoElement ? metodoPagoElement.value : "Yape / Plin";

    // Armar lista de productos
    let listaProductos = "";
    let total = 0;

    cart.forEach(item => {
        const cantidad = item.cantidad || 1;
        const subtotal = item.price * cantidad;
        total += subtotal;
        listaProductos += `• ${item.title} (x${cantidad}) - S/ ${subtotal.toFixed(2)}\n`;
    });

    const numPedido = Math.floor(100000 + Math.random() * 900000);

    // Formatear mensaje para WhatsApp
    const mensaje = 
`🐾 *NUEVO PEDIDO EN MAWIPO* 🐾
*Pedido #MW-${numPedido}*

👤 *Datos del Cliente:*
• *Nombre:* ${nombre}
• *Teléfono:* ${telefono}
• *Dirección:* ${direccion}
• *Método de Pago:* ${metodoPago}

🛍️ *Detalle del Pedido:*
${listaProductos}
💰 *Total a Pagar:* S/ ${total.toFixed(2)}

----------------------------------
_Hola MAWIPO, acabo de realizar este pedido desde la web._`;

    // Abrir WhatsApp en nueva pestaña
    const enlaceWhatsApp = `https://wa.me/${miTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(enlaceWhatsApp, '_blank');

    // Cambiar a pantalla de confirmación
    const paso1 = document.getElementById('checkout-paso-1');
    const paso2 = document.getElementById('checkout-paso-2');
    const numPedidoSpan = document.getElementById('num-pedido');

    if (numPedidoSpan) numPedidoSpan.innerText = numPedido;
    if (paso1) paso1.style.display = 'none';
    if (paso2) paso2.style.display = 'block';

    // Vaciar carrito
    cart = [];
    saveCart();
    updateCartUI();
}

function finalizarTodo() {
    cerrarCheckout();
}

function showNotification(mensaje) {
    console.log(mensaje);
}

function handleNewsletter(event) {
    if (event) event.preventDefault();
    alert("¡Gracias por suscribirte a Mawipo!");
}
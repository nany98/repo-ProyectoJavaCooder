
const PRODUCTS_URL = "data/products.json";
const STORAGE_CART = "pf_cart_v1";
let products = [];
let cart = JSON.parse(localStorage.getItem(STORAGE_CART)) || [];

function formatCurrency(n){ return Number(n).toLocaleString('es-AR',{style:'currency',currency:'ARS'}); }

async function loadProducts(){
  try{
    const res = await fetch(PRODUCTS_URL);
    products = await res.json();
    renderCatalog();
    updateCartCount();
  }catch(e){
    Swal.fire('Error','No se pudieron cargar los productos.','error');
  }
}

function renderCatalog(){
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';
  products.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${p.img}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">${p.desc}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <strong>${formatCurrency(p.price)}</strong>
            <button class="btn btn-primary btn-add" data-id="${p.id}">Agregar</button>
          </div>
        </div>
      </div>`;
    catalog.appendChild(col);
  });
  document.querySelectorAll('.btn-add').forEach(b=> b.addEventListener('click', addToCartHandler));
}

function addToCartHandler(e){
  const id = parseInt(e.target.dataset.id);
  const prod = products.find(x=>x.id===id);
  if(!prod) return;
  const found = cart.find(x=>x.id===id);
  if(found){ found.qty += 1; } else { cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1}); }
  saveCart();
  Swal.fire({ icon:'success', title:'Agregado', text: prod.name, timer:1000, showConfirmButton:false });
  updateCartCount();
}

function saveCart(){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); }

function updateCartCount(){ document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0); }

document.getElementById('btnViewCart').addEventListener('click', ()=>{
  const section = document.getElementById('cartSection');
  section.classList.toggle('d-none');
  renderCart();
});

function renderCart(){
  const list = document.getElementById('cartList');
  if(cart.length===0){ list.innerHTML = '<p class="text-muted">Carrito vacío.</p>'; return; }
  let html = '<ul class="list-group">';
  cart.forEach(item=>{
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <div><strong>${item.name}</strong><div class="small text-muted">Cant: ${item.qty} · Precio unit: ${formatCurrency(item.price)}</div></div>
      <div>
        <button class="btn btn-sm btn-outline-secondary btn-dec" data-id="${item.id}">-</button>
        <button class="btn btn-sm btn-outline-secondary btn-inc" data-id="${item.id}">+</button>
        <button class="btn btn-sm btn-danger btn-rm" data-id="${item.id}">Eliminar</button>
      </div>
    </li>`;
  });
  html += '</ul>';
  list.innerHTML = html;
  list.querySelectorAll('.btn-inc').forEach(b=> b.addEventListener('click', e=> changeQty(e,1)));
  list.querySelectorAll('.btn-dec').forEach(b=> b.addEventListener('click', e=> changeQty(e,-1)));
  list.querySelectorAll('.btn-rm').forEach(b=> b.addEventListener('click', removeItem));
}

function changeQty(e,delta){
  const id = parseInt(e.target.dataset.id);
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
  saveCart();
  renderCart();
  updateCartCount();
}

function removeItem(e){
  const id = parseInt(e.target.dataset.id);
  cart = cart.filter(x=>x.id!==id);
  saveCart();
  renderCart();
  updateCartCount();
}

document.getElementById('btnClearCart').addEventListener('click', ()=>{
  if(cart.length===0){ Swal.fire('Info','El carrito ya está vacío.','info'); return; }
  Swal.fire({
    title:'¿Vaciar carrito?',
    showCancelButton:true,
    confirmButtonText:'Sí, vaciar',
  }).then(res=>{
    if(res.isConfirmed){ cart=[]; saveCart(); renderCart(); updateCartCount(); Swal.fire('Vaciado','Carrito vaciado.','success'); }
  });
});

document.getElementById('btnCheckout').addEventListener('click', ()=>{
  if(cart.length===0){ Swal.fire('Info','No hay productos en el carrito.','info'); return; }
  const modalEl = document.getElementById('checkoutModal');
  const modal = new bootstrap.Modal(modalEl);
  document.getElementById('buyerName').value = 'Santiago Castaño';
  document.getElementById('buyerEmail').value = 'santiago@example.com';
  document.getElementById('buyerAddress').value = 'Calle Falsa 123';
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  document.getElementById('orderSummary').innerText = `Total a pagar: ${formatCurrency(total)}`;
  modal.show();
});

document.getElementById('checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('buyerName').value.trim();
  const email = document.getElementById('buyerEmail').value.trim();
  const address = document.getElementById('buyerAddress').value.trim();
  if(!name || !email || !address){ Swal.fire('Error','Complete todos los campos.','error'); return; }
  const order = {
    id: 'ORD_' + Date.now(),
    buyer:{name,email,address},
    items: cart.slice(),
    total: cart.reduce((s,i)=>s + i.price*i.qty,0),
    createdAt: new Date().toISOString()
  };
  const orders = JSON.parse(localStorage.getItem('pf_orders_v1') || '[]');
  orders.push(order);
  localStorage.setItem('pf_orders_v1', JSON.stringify(orders));
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
  Swal.fire('Compra realizada','Tu orden fue registrada correctamente','success');
});

loadProducts();

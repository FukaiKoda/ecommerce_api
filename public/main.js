/**
 * main.js
 * -------
 * Handles all API communication with the backend.
 * No client-side validation — the backend (Joi) owns that responsibility.
 * Auth state is tracked via a localStorage flag; the real session lives in
 * an httpOnly cookie managed by express-session / Redis.
 */

const API_BASE = ''   // same origin — Express serves both API and static files

// ─────────────────────────────────────────────────
//  Generic API helpers
// ─────────────────────────────────────────────────

async function apiFetch(method, endpoint, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    }
    if (body !== undefined) opts.body = JSON.stringify(body)

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, opts)

        let json
        try { json = await res.json() }
        catch { json = null }

        logRequest(method, endpoint, res.status, json)
        console.log(`[API] ${method} ${endpoint} → ${res.status}`, json)

        if (!res.ok) {
            console.error(`[API Error] ${endpoint}:`, json)
            return { error: json?.error || json?.message || `${res.status} error — check log` }
        }

        return { data: json }
    } catch (err) {
        console.error(`[API] Network error on ${endpoint}:`, err)
        logRequest(method, endpoint, 'ERR', null)
        return { error: 'Could not reach the server. Is it running?' }
    }
}

const apiGet    = (endpoint)        => apiFetch('GET',    endpoint)
const apiPost   = (endpoint, body)  => apiFetch('POST',   endpoint, body)
const apiPut    = (endpoint, body)  => apiFetch('PUT',    endpoint, body)
const apiPatch  = (endpoint, body)  => apiFetch('PATCH',  endpoint, body)
const apiDelete = (endpoint)        => apiFetch('DELETE', endpoint)

// ─────────────────────────────────────────────────
//  Response Log
// ─────────────────────────────────────────────────

function logRequest(method, path, status, json) {
    const container = document.getElementById('log-entries')
    if (!container) return

    // Remove empty placeholder
    const empty = container.querySelector('.log-empty')
    if (empty) empty.remove()

    const ok = typeof status === 'number' && status < 400
    const methodColors = { GET:'#4ade80', POST:'#60a5fa', PUT:'#facc15', PATCH:'#fb923c', DELETE:'#f87171' }

    const entry = document.createElement('div')
    entry.className = 'log-entry'
    entry.innerHTML = `
        <span class="log-method" style="color:${methodColors[method] || '#a1a1aa'}">${method}</span>
        <span class="log-path">${path}</span>
        <span class="log-status ${ok ? 'status-ok' : 'status-err'}">${status}</span>
    `
    container.prepend(entry)
}

// ─────────────────────────────────────────────────
//  UI Helpers
// ─────────────────────────────────────────────────

function showAlert(el, message, type = 'error') {
    el.className = `alert alert-${type} visible animate-fade-in`
    el.textContent = message
}

function hideAlert(el) {
    el.className = 'alert'
    el.textContent = ''
}

function setInputError(input, hasError) {
    input.classList.toggle('error', hasError)
}

function setLoading(btn, isLoading) {
    btn.classList.toggle('loading', isLoading)
    btn.disabled = isLoading
}

// ─────────────────────────────────────────────────
//  Cart Helpers
// ─────────────────────────────────────────────────

function getCart() {
    const raw = localStorage.getItem('shopapi_cart')
    return raw ? JSON.parse(raw) : []
}

function saveCart(cart) {
    localStorage.setItem('shopapi_cart', JSON.stringify(cart))
    updateCartBadge()
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count')
    if (badge) {
        const cart = getCart()
        const count = cart.reduce((acc, item) => acc + item.quantity, 0)
        badge.textContent = count
    }
}

// ─────────────────────────────────────────────────
//  Session helpers (localStorage flag only)
// ─────────────────────────────────────────────────

function saveSession({ role, userId }) {
    localStorage.setItem('shopapi_session', JSON.stringify({ loggedIn: true, role, userId }))
}

function getSession() {
    const raw = localStorage.getItem('shopapi_session')
    return raw ? JSON.parse(raw) : null
}

function clearSession() {
    localStorage.removeItem('shopapi_session')
}

function isAdmin() {
    return getSession()?.role === 'ADMIN'
}

// ─────────────────────────────────────────────────
//  Sign-up page
// ─────────────────────────────────────────────────

function initSignUp() {
    const form = document.getElementById('signup-form')
    if (!form) return

    const alertEl   = document.getElementById('signup-alert')
    const submitBtn = document.getElementById('signup-submit')
    const inputs    = form.querySelectorAll('.input')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        hideAlert(alertEl)
        inputs.forEach(i => setInputError(i, false))

        const name     = document.getElementById('signup-name').value
        const username = document.getElementById('signup-username').value
        const email    = document.getElementById('signup-email').value
        const password = document.getElementById('signup-password').value

        setLoading(submitBtn, true)
        const { data, error } = await apiPost('/auth/signup', { name, username, email, password })
        setLoading(submitBtn, false)

        if (error) {
            showAlert(alertEl, error, 'error')
            return
        }

        showAlert(alertEl, 'Account created! Redirecting to login…', 'success')
        setTimeout(() => { window.location.href = '/login.html' }, 1500)
    })
}

// ─────────────────────────────────────────────────
//  Log-in page
// ─────────────────────────────────────────────────

function initLogIn() {
    const form = document.getElementById('login-form')
    if (!form) return

    const alertEl   = document.getElementById('login-alert')
    const submitBtn = document.getElementById('login-submit')
    const inputs    = form.querySelectorAll('.input')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        hideAlert(alertEl)
        inputs.forEach(i => setInputError(i, false))

        const username = document.getElementById('login-username').value
        const password = document.getElementById('login-password').value

        setLoading(submitBtn, true)
        const { data, error } = await apiPost('/auth/login', { username, password })
        setLoading(submitBtn, false)

        if (error) {
            showAlert(alertEl, error, 'error')
            inputs.forEach(i => setInputError(i, true))
            return
        }

        // Store the role and userId returned from the backend
        saveSession({ role: data?.role || 'CUSTOMER', userId: data?.userId })

        showAlert(alertEl, 'Signed in! Redirecting to products…', 'success')
        setTimeout(() => { window.location.href = '/product.html' }, 1000)
    })
}

// ─────────────────────────────────────────────────
//  Home page
// ─────────────────────────────────────────────────

function initHome() {
    // Guard: only run on the home page (index.html has .hero, other pages don't)
    if (!document.querySelector('.hero')) return

    // If already logged in, redirect straight to products
    const session = getSession()
    if (session?.loggedIn) {
        window.location.href = '/product.html'
    }
}

// ─────────────────────────────────────────────────
//  Products page
// ─────────────────────────────────────────────────

function initProducts() {
    const container = document.getElementById('products-container')
    if (!container) return

    // Guard: must be logged in
    const session = getSession()
    if (!session?.loggedIn) {
        window.location.href = '/login.html'
        return
    }

    const admin = isAdmin()

    const navActions = document.getElementById('nav-actions')
    if (navActions) {
        navActions.innerHTML = `
            <a href="/cart.html" class="btn btn-ghost btn-sm" style="display:inline-flex;align-items:center;gap:0.35rem">
                🛒 Cart <span id="cart-count" style="background:#3b82f6;color:#fff;border-radius:10px;padding:0.1rem 0.4rem;font-size:0.7rem;line-height:1">0</span>
            </a>
            <button class="btn btn-outline btn-sm" id="nav-logout">Log out</button>
        `
        updateCartBadge()
        document.getElementById('nav-logout').addEventListener('click', async () => {
            await apiPost('/auth/logout', {})
            clearSession()
            window.location.href = '/login.html'
        })
    }

    // ── Role badge ────────────────────────────────
    const badgeContainer = document.getElementById('role-badge-container')
    if (badgeContainer) {
        badgeContainer.innerHTML = `
            <span class="role-badge ${admin ? 'admin' : 'customer'}">
                ${admin ? '🔑 Admin' : '👤 Customer'}
            </span>
        `
    }

    // ── Admin panel visibility ────────────────────
    const adminPanel = document.getElementById('admin-panel')
    if (admin && adminPanel) adminPanel.classList.add('visible')

    // Refresh role badge without a page reload
    function refreshRoleBadge() {
        const a = isAdmin()
        if (badgeContainer) {
            badgeContainer.innerHTML = `
                <span class="role-badge ${a ? 'admin' : 'customer'}">
                    ${a ? '🔑 Admin' : '👤 Customer'}
                </span>
            `
        }
        if (adminPanel) adminPanel.classList.toggle('visible', a)
        renderAdminActions()
    }

    // ── Debug role switcher ───────────────────────
    document.getElementById('btn-role-admin')?.addEventListener('click', () => switchRole('ADMIN'))
    document.getElementById('btn-role-customer')?.addEventListener('click', () => switchRole('CUSTOMER'))

    async function switchRole(role) {
        const pageAlert = document.getElementById('page-alert')
        const userId    = session.userId

        if (!userId) {
            showAlert(pageAlert, 'No userId in session — log out and log in again.', 'error')
            return
        }

        const { data, error } = await apiPost(`/user/${role}/${userId}`, {})

        if (error) {
            showAlert(pageAlert, `Role switch failed: ${error}`, 'error')
            return
        }

        const s = getSession()
        s.role = role
        localStorage.setItem('shopapi_session', JSON.stringify(s))

        showAlert(pageAlert, `Role switched to ${role}. UI updated.`, 'success')
        refreshRoleBadge()
    }

    // ── Clear log ─────────────────────────────────
    document.getElementById('btn-clear-log')?.addEventListener('click', () => {
        const logEl = document.getElementById('log-entries')
        if (logEl) logEl.innerHTML = '<div class="log-empty">Log cleared.</div>'
    })

    // ── Products grid ─────────────────────────────
    let currentProducts = []

    async function loadProducts() {
        container.innerHTML = '<div class="state-box"><div class="state-icon">⏳</div><p>Loading products…</p></div>'

        const { data, error } = await apiGet('/products')

        if (error) {
            container.innerHTML = `
                <div class="state-box">
                    <div class="state-icon">⚠️</div>
                    <p>${error}</p>
                </div>`
            return
        }

        currentProducts = data || []
        renderProducts(currentProducts)
    }

    function renderProducts(products) {
        const countEl = document.getElementById('products-count')
        if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`

        if (products.length === 0) {
            container.innerHTML = `
                <div class="state-box">
                    <div class="state-icon">📦</div>
                    <p>No products yet.${isAdmin() ? ' Add one above.' : ''}</p>
                </div>`
            return
        }

        container.innerHTML = `<div class="products-grid">${products.map(productCard).join('')}</div>`
        attachCardListeners()
    }

    function productCard(p) {
        const price = parseFloat(p.price).toFixed(2)
        const stockClass = p.stock <= 5 ? 'low' : ''
        return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-card-header">
                <div>
                    <div class="product-title">${escHtml(p.title)}</div>
                    <div class="product-id">#${p.id}</div>
                </div>
            </div>
            <div class="product-desc">${escHtml(p.description)}</div>
            <div class="product-meta">
                <span class="product-price">$${price}</span>
                <span class="product-stock ${stockClass}">Stock: ${p.stock}</span>
            </div>
            <div class="product-admin-actions" id="admin-actions-${p.id}">
                <button class="btn btn-outline btn-sm btn-edit" data-id="${p.id}">Edit</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${p.id}">Delete</button>
            </div>
            <div class="product-customer-actions" style="margin-top:0.75rem;">
                <button class="btn btn-primary btn-sm btn-add-cart" style="width:100%" data-id="${p.id}" data-title="${escHtml(p.title)}" data-price="${p.price}" ${p.stock <= 0 ? 'disabled' : ''}>
                    ${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>`
    }

    function renderAdminActions() {
        document.querySelectorAll('.product-admin-actions').forEach(el => {
            el.classList.toggle('visible', isAdmin())
        })
    }

    function attachCardListeners() {
        renderAdminActions()

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)))
        })

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)))
        })

        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id)
                const title = btn.dataset.title
                const price = parseFloat(btn.dataset.price)
                
                const cart = getCart()
                const existing = cart.find(item => item.productId === id)
                
                if (existing) {
                    existing.quantity += 1
                } else {
                    cart.push({ productId: id, title, price, quantity: 1 })
                }
                
                saveCart(cart)
                
                const originalText = btn.textContent
                btn.textContent = 'Added! ✓'
                setTimeout(() => { btn.textContent = originalText }, 1000)
            })
        })
    }

    // ── Add product form ──────────────────────────
    const addForm = document.getElementById('add-product-form')
    addForm?.addEventListener('submit', async (e) => {
        e.preventDefault()
        const pageAlert = document.getElementById('page-alert')
        hideAlert(pageAlert)

        const submitBtn = document.getElementById('add-submit')
        setLoading(submitBtn, true)

        const { data, error } = await apiPost('/products', {
            title:       document.getElementById('add-title').value,
            description: document.getElementById('add-description').value,
            price:       parseFloat(document.getElementById('add-price').value),
            stock:       parseInt(document.getElementById('add-stock').value),
        })

        setLoading(submitBtn, false)

        if (error) {
            showAlert(pageAlert, error, 'error')
            return
        }

        showAlert(pageAlert, 'Product added successfully!', 'success')
        addForm.reset()
        loadProducts()
    })

    // ── Delete ────────────────────────────────────
    async function deleteProduct(id) {
        const pageAlert = document.getElementById('page-alert')
        if (!confirm(`Delete product #${id}?`)) return

        const { error } = await apiDelete(`/products/${id}`)

        if (error) {
            showAlert(pageAlert, error, 'error')
            return
        }

        showAlert(pageAlert, `Product #${id} deleted.`, 'success')
        loadProducts()
    }

    // ── Edit modal ────────────────────────────────
    let editProductId = null
    let editMode = 'PATCH'  // 'PATCH' | 'PUT'

    const modal        = document.getElementById('edit-modal')
    const modalClose   = document.getElementById('modal-close')
    const modalCancel  = document.getElementById('modal-cancel')
    const tabPatch     = document.getElementById('tab-patch')
    const tabPut       = document.getElementById('tab-put')
    const modalNote    = document.getElementById('modal-note')
    const editForm     = document.getElementById('edit-form')
    const modalAlert   = document.getElementById('modal-alert')

    function openEditModal(id) {
        const product = currentProducts.find(p => p.id === id)
        if (!product) return

        editProductId = id
        editMode = 'PATCH'

        document.getElementById('modal-product-id').textContent = `#${id}`
        document.getElementById('edit-title').value        = product.title
        document.getElementById('edit-description').value  = product.description
        document.getElementById('edit-price').value        = parseFloat(product.price).toFixed(2)
        document.getElementById('edit-stock').value        = product.stock

        setTab('PATCH')
        hideAlert(modalAlert)
        modal.classList.add('open')
    }

    function closeModal() {
        modal.classList.remove('open')
        editProductId = null
    }

    function setTab(mode) {
        editMode = mode
        tabPatch.classList.toggle('active', mode === 'PATCH')
        tabPut.classList.toggle('active',   mode === 'PUT')
        tabPatch.setAttribute('aria-selected', mode === 'PATCH')
        tabPut.setAttribute('aria-selected',   mode === 'PUT')
        modalNote.textContent = mode === 'PATCH'
            ? 'Fill only the fields you want to update (partial update).'
            : 'All fields are required for a full replacement (PUT).'
    }

    tabPatch?.addEventListener('click', () => setTab('PATCH'))
    tabPut?.addEventListener('click',   () => setTab('PUT'))
    modalClose?.addEventListener('click', closeModal)
    modalCancel?.addEventListener('click', closeModal)
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal() })

    editForm?.addEventListener('submit', async (e) => {
        e.preventDefault()
        hideAlert(modalAlert)

        const body = {
            title:       document.getElementById('edit-title').value       || undefined,
            description: document.getElementById('edit-description').value || undefined,
            price:       document.getElementById('edit-price').value       ? parseFloat(document.getElementById('edit-price').value) : undefined,
            stock:       document.getElementById('edit-stock').value       ? parseInt(document.getElementById('edit-stock').value)    : undefined,
        }

        // For PUT, keep undefined fields as empty strings (full replace expects all fields)
        const payload = editMode === 'PUT'
            ? { title: body.title || '', description: body.description || '', price: body.price || 0, stock: body.stock || 0 }
            : Object.fromEntries(Object.entries(body).filter(([,v]) => v !== undefined))

        const submitBtn = document.getElementById('edit-submit')
        setLoading(submitBtn, true)

        const fn = editMode === 'PUT' ? apiPut : apiPatch
        const { data, error } = await fn(`/products/${editProductId}`, payload)

        setLoading(submitBtn, false)

        if (error) {
            showAlert(modalAlert, error, 'error')
            return
        }

        closeModal()
        showAlert(document.getElementById('page-alert'), 'Product updated successfully!', 'success')
        loadProducts()
    })

    // ── Kick off ──────────────────────────────────
    loadProducts()
}

// ─────────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────────

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

// ─────────────────────────────────────────────────
//  Cart & Orders page
// ─────────────────────────────────────────────────

function initCart() {
    const container = document.getElementById('cart-items-container')
    const historyContainer = document.getElementById('order-history-container')
    if (!container) return

    const session = getSession()
    if (!session?.loggedIn) {
        window.location.href = '/login.html'
        return
    }

    // Nav bar setup
    const navActions = document.getElementById('nav-actions')
    if (navActions) {
        navActions.innerHTML = `
            <a href="/product.html" class="btn btn-ghost btn-sm">Products</a>
            <button class="btn btn-outline btn-sm" id="nav-logout">Log out</button>
        `
        document.getElementById('nav-logout').addEventListener('click', async () => {
            await apiPost('/auth/logout', {})
            clearSession()
            window.location.href = '/login.html'
        })
    }

    renderCart()
    loadOrderHistory()

    // Render cart items
    function renderCart() {
        const cart = getCart()
        const totalEl = document.getElementById('cart-total')
        const placeOrderBtn = document.getElementById('btn-place-order')

        if (cart.length === 0) {
            container.innerHTML = '<div class="state-box"><div class="state-icon">🛒</div><p>Your cart is empty.</p></div>'
            if (totalEl) totalEl.textContent = '$0.00'
            if (placeOrderBtn) placeOrderBtn.disabled = true
            return
        }

        let html = ''
        let total = 0

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity
            total += itemTotal
            html += `
                <div class="log-entry" style="grid-template-columns: 2fr 1fr 1fr auto; align-items: center;">
                    <div style="font-weight:600">${escHtml(item.title)}</div>
                    <div>$${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                    <div style="font-weight:700">$${itemTotal.toFixed(2)}</div>
                    <div style="display:flex;gap:0.25rem;">
                        <button class="btn btn-sm btn-outline btn-dec" data-id="${item.productId}">-</button>
                        <button class="btn btn-sm btn-outline btn-inc" data-id="${item.productId}">+</button>
                        <button class="btn btn-sm btn-danger btn-remove" data-id="${item.productId}">✕</button>
                    </div>
                </div>
            `
        })

        container.innerHTML = html
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`
        if (placeOrderBtn) placeOrderBtn.disabled = false

        // Attach listeners
        document.querySelectorAll('.btn-inc').forEach(btn => {
            btn.addEventListener('click', () => changeQuantity(parseInt(btn.dataset.id), 1))
        })
        document.querySelectorAll('.btn-dec').forEach(btn => {
            btn.addEventListener('click', () => changeQuantity(parseInt(btn.dataset.id), -1))
        })
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)))
        })
    }

    function changeQuantity(id, delta) {
        let cart = getCart()
        const item = cart.find(i => i.productId === id)
        if (item) {
            item.quantity += delta
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.productId !== id)
            }
            saveCart(cart)
            renderCart()
        }
    }

    function removeFromCart(id) {
        let cart = getCart()
        cart = cart.filter(i => i.productId !== id)
        saveCart(cart)
        renderCart()
    }

    document.getElementById('btn-place-order')?.addEventListener('click', async () => {
        const cart = getCart()
        if (cart.length === 0) return

        const payload = {
            items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
        }

        const btn = document.getElementById('btn-place-order')
        setLoading(btn, true)

        const { data, error } = await apiPost('/orders', payload)
        setLoading(btn, false)

        const alertEl = document.getElementById('page-alert')
        if (error) {
            showAlert(alertEl, error, 'error')
            return
        }

        showAlert(alertEl, 'Order placed successfully!', 'success')
        localStorage.removeItem('shopapi_cart')
        renderCart()
        loadOrderHistory()
    })

    async function loadOrderHistory() {
        if (!historyContainer) return
        historyContainer.innerHTML = '<div class="state-box"><p>Loading history...</p></div>'

        const endpoint = isAdmin() ? '/orders' : '/orders/my-orders'
        const { data, error } = await apiGet(endpoint)

        if (error) {
            historyContainer.innerHTML = `<div class="state-box"><p>${error}</p></div>`
            return
        }

        if (!data || data.length === 0) {
            historyContainer.innerHTML = '<div class="state-box"><p>No orders found.</p></div>'
            return
        }

        let html = ''
        data.forEach(order => {
            let total = 0
            const itemsHtml = order.items.map(i => {
                total += parseFloat(i.price) * i.quantity
                return `<li>${i.quantity}x ${escHtml(i.product.title)} ($${i.price})</li>`
            }).join('')

            html += `
                <div class="product-card" style="margin-bottom:1rem">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:0.5rem; margin-bottom:0.5rem">
                        <div style="font-weight:600">Order #${order.id}</div>
                        <div style="font-size:0.8rem; padding:0.2rem 0.5rem; background:var(--ghost-hover); border-radius:5px">${order.status}</div>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-subtle); margin-bottom:0.5rem">
                        Date: ${new Date(order.createdAt).toLocaleString()}
                        ${isAdmin() ? `<br>User ID: ${order.userId}` : ''}
                    </div>
                    <ul style="font-size:0.85rem; padding-left:1.2rem; margin:0 0 0.5rem 0">
                        ${itemsHtml}
                    </ul>
                    <div style="font-weight:700; text-align:right">Total: $${total.toFixed(2)}</div>
                </div>
            `
        })
        historyContainer.innerHTML = html
    }
}

// ─────────────────────────────────────────────────
//  Bootstrap — runs on every page
// ─────────────────────────────────────────────────

initHome()
initSignUp()
initLogIn()
initProducts()
initCart()

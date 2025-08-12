addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const API_KEY = "326952bf-0944-4ce7-a1cf-8c0b80f9017f"
const API_URL = "https://jagoanpedia.com/api/sosmed"

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname.toLowerCase()

  if (request.method === 'GET') {
    // Render UI page untuk tiap endpoint form dan hasil
    if (pathname === "/" || pathname === "/services") {
      return renderServicesPage()
    }
    if (pathname === "/order") {
      return renderOrderPage()
    }
    if (pathname === "/status") {
      return renderStatusPage()
    }
    return notFound()
  }

  if (request.method === 'POST') {
    if (pathname === "/services") {
      return handleServices()
    }
    if (pathname === "/order") {
      return handleOrder(request)
    }
    if (pathname === "/status") {
      return handleStatus(request)
    }
  }

  return methodNotAllowed()
}

// =====================
// HANDLE API CALLS
// =====================

async function handleServices() {
  const postData = {
    key: API_KEY,
    action: "services"
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData)
  })
  const data = await response.json()

  if (data.success) {
    return jsonResponse(data)
  } else {
    return jsonResponse({ success: false, error: data.error || "Unknown error" }, 400)
  }
}

async function handleOrder(request) {
  const body = await request.json().catch(() => null)
  if (!body || !body.service || !body.target || !body.quantity) {
    return jsonResponse({ success: false, error: "Missing parameter(s)" }, 400)
  }

  const postData = {
    key: API_KEY,
    action: "order",
    service: body.service,
    target: body.target,
    quantity: body.quantity.toString()
  }

  // Optional parameters
  if (body.custom_comments) postData.custom_comments = body.custom_comments
  if (body.username) postData.username = body.username

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData)
  })

  const data = await response.json()
  if (data.success) {
    return jsonResponse(data)
  } else {
    return jsonResponse({ success: false, error: data.error || "Unknown error" }, 400)
  }
}

async function handleStatus(request) {
  const body = await request.json().catch(() => null)
  if (!body || !body.order_id) {
    return jsonResponse({ success: false, error: "Missing order_id parameter" }, 400)
  }

  const postData = {
    key: API_KEY,
    action: "status",
    order_id: body.order_id
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData)
  })

  const data = await response.json()
  if (data.success) {
    return jsonResponse(data)
  } else {
    return jsonResponse({ success: false, error: data.error || "Unknown error" }, 400)
  }
}

// =====================
// RENDER HTML PAGES
// =====================

function renderLayout(title, bodyContent) {
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  /* Reset and base */
  * {
    box-sizing: border-box;
  }
  body {
    margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background: #f5f7fa;
    color: #222;
    min-height: 100vh;
    display: flex; flex-direction: column;
  }
  header {
    background: #004080;
    color: white;
    padding: 1rem 2rem;
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: 0.05em;
    user-select: none;
  }
  main {
    flex: 1;
    max-width: 800px;
    margin: 2rem auto;
    background: white;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 0 20px rgb(0 0 0 / 0.1);
  }
  footer {
    text-align: center;
    padding: 1rem;
    font-size: 0.85rem;
    color: #666;
    user-select:none;
  }
  nav a {
    color: #eee;
    margin-right: 1rem;
    text-decoration: none;
    font-weight: 600;
  }
  nav a:hover, nav a.active {
    color: #ffcc00;
  }
  h1 {
    margin-bottom: 1rem;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  form label {
    display: block;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.3rem;
  }
  input[type=text], input[type=number], textarea, select {
    width: 100%;
    padding: 0.6rem 0.8rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1.5px solid #ccc;
    transition: border-color 0.3s ease;
  }
  input[type=text]:focus, input[type=number]:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #004080;
  }
  button {
    margin-top: 1.5rem;
    background-color: #004080;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.25s ease;
  }
  button:hover {
    background-color: #003366;
  }
  pre {
    background: #f0f0f0;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    margin-top: 1rem;
  }
  .response {
    margin-top: 1rem;
    background: #e0f7e9;
    border: 1px solid #00a152;
    padding: 1rem;
    border-radius: 8px;
    color: #006622;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .error {
    background: #fdecea;
    border: 1px solid #e53935;
    color: #b71c1c;
  }
</style>
</head>
<body>
<header>
  <nav>
    <a href="/services" class="${title === 'Services' ? 'active' : ''}">Services</a>
    <a href="/order" class="${title === 'Order'} ? 'active' : ''">Order</a>
    <a href="/status" class="${title === 'Status'} ? 'active' : ''">Status</a>
  </nav>
</header>
<main>
${bodyContent}
</main>
<footer>
  &copy; 2025 Jagoanpedia API Integration Worker
</footer>
</body>
</html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  })
}

function renderServicesPage() {
  return renderLayout("Services", `
    <h1>Daftar Layanan Sosmed</h1>
    <p>Klik tombol di bawah untuk ambil daftar layanan dari API JagoanPedia.</p>
    <button onclick="fetchServices()">Muat Layanan</button>
    <pre id="result"></pre>

    <script>
    async function fetchServices() {
      const resultEl = document.getElementById('result')
      resultEl.textContent = "Memuat..."
      try {
        const res = await fetch('/services', { method: 'POST' })
        const data = await res.json()
        if(data.success) {
          let html = ""
          if(Array.isArray(data.data)) {
            html = data.data.map(s => 
              \`ID: \${s.id}\\nNama: \${s.name}\\nMinimal: \${s.min}\\nMaksimal: \${s.max}\\nHarga: \${s.price}\\nStatus: \${s.status}\\nCatatan: \${s.note}\\n---\`).join('\\n')
          } else {
            html = \`ID: \${data.data.id}\\nNama: \${data.data.name}\\nMinimal: \${data.data.min}\\nMaksimal: \${data.data.max}\\nHarga: \${data.data.price}\\nStatus: \${data.data.status}\\nCatatan: \${data.data.note}\`
          }
          resultEl.textContent = html
        } else {
          resultEl.textContent = "Error: " + (data.error || "Gagal mengambil data")
        }
      } catch(e) {
        resultEl.textContent = "Error: " + e.message
      }
    }
    </script>
  `)
}

function renderOrderPage() {
  return renderLayout("Order", `
    <h1>Pesan Layanan Sosmed</h1>
    <form id="orderForm">
      <label for="service">ID Layanan</label>
      <input type="text" id="service" name="service" placeholder="Misal: 1234" required />

      <label for="target">Target (username/url/id)</label>
      <input type="text" id="target" name="target" placeholder="Misal: https://instagram.com/xx" required />

      <label for="quantity">Jumlah Pesan</label>
      <input type="number" id="quantity" name="quantity" min="1" required />

      <label for="custom_comments">Komentar Custom (opsional)</label>
      <textarea id="custom_comments" name="custom_comments" rows="3" placeholder="Pisahkan dengan enter"></textarea>

      <label for="username">Username Target (hanya untuk like komentar Instagram, opsional)</label>
      <input type="text" id="username" name="username" placeholder="Misal: username_ig" />

      <button type="submit">Pesan Sekarang</button>
    </form>

    <pre id="result"></pre>

    <script>
    const form = document.getElementById('orderForm')
    const resultEl = document.getElementById('result')
    form.addEventListener('submit', async e => {
      e.preventDefault()
      resultEl.textContent = "Mengirim pesanan..."
      const data = {
        service: form.service.value.trim(),
        target: form.target.value.trim(),
        quantity: form.quantity.value.trim(),
        custom_comments: form.custom_comments.value.trim() || undefined,
        username: form.username.value.trim() || undefined
      }
      try {
        const res = await fetch('/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (json.success) {
          resultEl.textContent = "Pesanan berhasil:\n" + JSON.stringify(json.data, null, 2)
        } else {
          resultEl.textContent = "Gagal: " + (json.error || "Error tak diketahui")
        }
      } catch (err) {
        resultEl.textContent = "Error: " + err.message
      }
    })
    </script>
  `)
}

function renderStatusPage() {
  return renderLayout("Status", `
    <h1>Cek Status Pesanan</h1>
    <form id="statusForm">
      <label for="order_id">ID Pesanan</label>
      <input type="text" id="order_id" name="order_id" placeholder="Misal: 1234" required />
      <button type="submit">Cek Status</button>
    </form>
    <pre id="result"></pre>

    <script>
    const form = document.getElementById('statusForm')
    const resultEl = document.getElementById('result')
    form.addEventListener('submit', async e => {
      e.preventDefault()
      resultEl.textContent = "Memeriksa status..."
      const data = { order_id: form.order_id.value.trim() }
      try {
        const res = await fetch('/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (json.success) {
          resultEl.textContent = "Status pesanan:\n" + JSON.stringify(json.data, null, 2)
        } else {
          resultEl.textContent = "Gagal: " + (json.error || "Error tak diketahui")
        }
      } catch (err) {
        resultEl.textContent = "Error: " + err.message
      }
    })
    </script>
  `)
}

// =====================
// UTILITIES
// =====================

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function notFound() {
  return new Response("404 Not Found", { status: 404 })
}

function methodNotAllowed() {
  return new Response("405 Method Not Allowed", { status: 405 })
}

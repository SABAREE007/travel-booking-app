document.addEventListener('DOMContentLoaded', () => {
  const productsRow = document.getElementById('productsRow');
  const bookingModalEl = document.getElementById('bookingModal');
  const bookingModal = new bootstrap.Modal(bookingModalEl);
  const bookingForm = document.getElementById('bookingForm');
  const productIdInput = document.getElementById('productId');
  const feedback = document.getElementById('bookingFeedback');

  // load products
  fetch('/api/products')
    .then(r => r.json())
    .then(products => {
      productsRow.innerHTML = products.map(p => cardHtml(p)).join('');
      document.querySelectorAll('.btn-book').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const title = e.currentTarget.dataset.title;
          productIdInput.value = id;
          bookingModalEl.querySelector('.modal-title').textContent = `Book: ${title}`;
          feedback.textContent = '';
          feedback.classList.remove('text-danger');
          bookingForm.reset();
          bookingModal.show();
        });
      });
    })
    .catch(err => {
      console.error(err);
      productsRow.innerHTML = '<p class="text-danger">Failed to load products.</p>';
    });

  // submit booking
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      productId: productIdInput.value,
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      date: document.getElementById('date').value,
      seats: Number(document.getElementById('seats').value)
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : r.json().then(x => Promise.reject(x)))
      .then(data => {
        feedback.classList.remove('text-danger');
        feedback.textContent = 'Booking successful! ID: ' + (data.booking?._id || '');
        bookingForm.reset();
        setTimeout(() => bookingModal.hide(), 1000);
      })
      .catch(err => {
        console.error(err);
        feedback.classList.add('text-danger');
        feedback.textContent = err?.error || 'Booking failed';
      });
  });

  function cardHtml(p) {
    return `
      <div class="col-md-4">
        <div class="card h-100">
          <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.title)}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${escapeHtml(p.title)}</h5>
            <p class="card-text small text-muted">${escapeHtml(p.duration)} • $${p.price}</p>
            <p class="card-text flex-grow-1">${escapeHtml(p.description)}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <button class="btn btn-primary btn-book" data-id="${p.id}" data-title="${escapeHtml(p.title)}">Book</button>
              <small class="text-muted">Price: $${p.price}</small>
            </div>
          </div>
        </div>
      </div>`;
  }

  function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
});

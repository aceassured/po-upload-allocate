(async () => {
  const items = JSON.parse(localStorage.getItem('poItems') || '[]');
  const boxes = ['box1','box2','box3'];
  const container = document.getElementById('summaryGrid');

  for (let i = 0; i < boxes.length; i++) {
    const key = boxes[i];
    const list = items.map(it => ({ name: it.name, qty: it.boxes[key] || 0 })).filter(x => x.qty > 0);
    if (!list.length) continue;

    const payload = { box: i+1, items: list, total: list.reduce((s,x)=>s+x.qty,0) };

    const t0 = performance.now();
    const res = await fetch('/api/qr', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ data: JSON.stringify(payload) })
    });
    const blob = await res.blob();
    const t1 = performance.now();
    console.log(`QR Box ${i+1} in ${(t1-t0).toFixed(2)} ms`);

    const qrURL = URL.createObjectURL(blob);
    container.innerHTML += `
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow text-center w-60">
        <h3 class="font-semibold mb-2">Box ${i+1}</h3>
        <ul class="text-sm mb-2 space-y-1 text-left">
          ${list.map(x=>`<li>${x.name}: ${x.qty}</li>`).join('')}
        </ul>
        <p class="font-medium">Total: ${payload.total}</p>
        <img src="${qrURL}" alt="QR Code" class="mx-auto mt-3 w-24 h-24"/>
      </div>`;
  }
})();

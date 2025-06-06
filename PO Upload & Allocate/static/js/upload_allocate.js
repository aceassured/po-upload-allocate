window.addEventListener('load', () => {
  localStorage.removeItem('poItems');
  document.getElementById('dropZone').classList.remove('hidden');
  document.getElementById('pdfPreviewContainer').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');
  document.getElementById('allocateBody').innerHTML = '';
});

const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const allocateTb= document.getElementById('allocateBody');
const nextBtn   = document.getElementById('nextBtn');
const previewCt = document.getElementById('pdfPreviewContainer');
const previewFr = document.getElementById('pdfPreview');

browseBtn.onclick = () => fileInput.click();
fileInput.onchange = () => handleFiles(fileInput.files);

['dragenter','dragover'].forEach(evt =>
  dropZone.addEventListener(evt, ev => { ev.preventDefault(); dropZone.classList.add('border-blue-400'); })
);
['dragleave','drop'].forEach(evt =>
  dropZone.addEventListener(evt, ev => {
    ev.preventDefault();
    dropZone.classList.remove('border-blue-400');
    if (evt === 'drop') handleFiles(ev.dataTransfer.files);
  })
);

async function handleFiles(files) {
  const file = files[0];
  if (!file || file.type !== 'application/pdf') return alert('Please upload a PDF.');

  const t0 = performance.now();
  const form = new FormData(); form.append('file', file);
  const res  = await fetch('/api/upload', { method:'POST', body: form });
  const t1 = performance.now();

  const { items, pdf_url, error } = await res.json();
  if (error) return alert(error);

  console.log(`PDF processed in ${(t1 - t0).toFixed(2)} ms`);

  dropZone.classList.add('hidden');
  previewFr.src = pdf_url;
  previewCt.classList.remove('hidden');

  allocateTb.innerHTML = items.map((it,i) => `
    <tr>
      <td class="py-2">${it.name}</td>
      <td>${it.number}</td>
      <td>${it.requested}</td>
      <td>
        <input
          type="number"
          id="alloc_${i}"
          min="0" max="${it.requested}"
          value="${it.requested}"
          class="bg-blue-50 border border-blue-300 px-3 py-2 rounded-lg w-28 text-sm text-gray-800"
        />
      </td>
    </tr>
  `).join('');

  localStorage.setItem('poItems', JSON.stringify(items));
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => {
    const data = JSON.parse(localStorage.getItem('poItems'));
    data.forEach((it,i) => it.allocated = +document.getElementById(`alloc_${i}`).value);
    localStorage.setItem('poItems', JSON.stringify(data));
    window.location.href = '/distribute';
  };
}

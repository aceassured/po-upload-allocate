document.getElementById('uploadBtn').onclick = async () => {
  const f = document.getElementById('fileInput').files[0];
  if (!f) return alert('Select a PDF first');
  const fd = new FormData(); fd.append('file', f);
  const res = await fetch('/api/upload', { method:'POST', body:fd });
  const payload = await res.json();
  if (payload.error) return alert(payload.error);
  localStorage.setItem('poItems', JSON.stringify(payload.items));
  location.href = '/allocate';
};

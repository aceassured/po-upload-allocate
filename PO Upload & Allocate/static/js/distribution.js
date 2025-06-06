const data = JSON.parse(localStorage.getItem('poItems') || '[]');
const distBody = document.getElementById('distBody');

data.forEach((it,i) => {
  distBody.innerHTML += `
    <tr>
      <td class="py-2">${it.name} | ${it.number}</td>
      <td>${it.requested}</td>
      <td>${it.allocated}</td>
      <td><input id="box1_${i}" type="number" min="0" max="${it.allocated}" value="${Math.floor(it.allocated/2)}" class="bg-blue-50 border border-blue-300 px-3 py-2 rounded-lg w-20 text-sm"/></td>
      <td><input id="box2_${i}" type="number" min="0" max="${it.allocated}" value="0" class="bg-blue-50 border border-blue-300 px-3 py-2 rounded-lg w-20 text-sm"/></td>
      <td><input id="box3_${i}" type="number" min="0" max="${it.allocated}" value="0" class="bg-blue-50 border border-blue-300 px-3 py-2 rounded-lg w-20 text-sm"/></td>
    </tr>`;
});

document.getElementById('nextDist').onclick = () => {
  data.forEach((it,i) => {
    it.boxes = {
      box1: +document.getElementById(`box1_${i}`).value,
      box2: +document.getElementById(`box2_${i}`).value,
      box3: +document.getElementById(`box3_${i}`).value,
    };
  });
  localStorage.setItem('poItems', JSON.stringify(data));
  window.location.href = '/summary';
};

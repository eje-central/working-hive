// const Etapa = require('../models/etapa');

document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

var dropdown = document.querySelector('.dropdown');

dropdown.addEventListener('click', function(event) {
  event.stopPropagation();
  dropdown.classList.toggle('is-active');
});

$(".showModal").click(function() {
  $(".modal").addClass("is-active");  
});

$(".modal-close").click(function() {
   $(".modal").removeClass("is-active");
});

$(function() {
  $("#resp").change(function() {
      $("#respID")[0].selectedIndex = $(this)[0].selectedIndex;
  });
});

$(function() {
  $("#respID").change(function() {
      $("#resp")[0].selectedIndex = $(this)[0].selectedIndex;
  });
});

document.getElementById("etapaBoton").onclick = function() {
  let etapa = document.getElementById('etapa');
  let responsable = document.getElementById('respID');
  let text = etapa.value;
  let resp = responsable.value;
  

  let etapas = document.getElementById('tags');
  etapas.innerHTML += `<span class="tag is-warning">${text}</span>`
  etapas.innerHTML += `<input style="display:none" name="etapa" value="${text}">`
  etapas.innerHTML += `<input style="display:none" name="resp" value="${resp}">`

  document.getElementById('etapa').value = "";
  document.getElementById('resp').value = "";
  document.getElementById('respID').value = "";
  event.preventDefault();

  // agregarAPI(text);
 } 

//  function agregarAPI(etapa){
//    let nuevaEtapa = {
//      nombre:etapa,
//      responsable:[]
//    }
//    console.log(nuevaEtapa);
//    axios.post('http://localhost:3000/nuevo', nuevaEtapa)
//     .then((response) => {
//       console.log(response); 
//         console.log(response.data);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//  }


document.addEventListener(
  "DOMContentLoaded",
  () => { 
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }
    function closeModals() {
      rootEl.classList.remove("is-clipped");
      $modals.forEach(function ($el) {
        $el.classList.remove("is-active");
      });
    }
    var rootEl = document.documentElement;
    var $modals = getAll('.modal');
    var $modalButtons = getAll('.modal-button');
    var $modalCloses = getAll(
      ".modal-background, .modal-close, .modal-card-head, .cancel"
    );
    if ($modalCloses.length > 0) {
      $modalCloses.forEach(function ($el) {
        $el.addEventListener("click", function () {
          closeModals();
        });
      });
    }
    var dropdown = document.querySelector(".dropdown");

    dropdown.addEventListener("click", function(event) {
      event.stopPropagation();
      dropdown.classList.toggle("is-active");
    });

    $("#showModal").click(function() {
      $(".modal").addClass("is-active");
    });

    function deleteUser(id) {
      axios
        .delete(`/user/delete/${id}`)
        .then(responseFromAPI => { 
          $(".modal").removeClass("is-active");
          window.location.href = "/usuarios";
        })
        .catch(err => {
          console.log("Error is: ", err);
        });
    }

    function getUserData(id) {
      axios.get(`/user/${id}`)
        .then(res => {  
          if(res.data.success){
            $("#username").val(res.data.user.username);
            $("#name").val(res.data.user.name);
            $(`#rol`).val(res.data.user.rol[0]); 
            $("#salary").val(res.data.user.salary);
            $("#pm").prop("checked", res.data.user.pm); 
          }else{
            alert("Error al obtener datos del usuario");
          }
        })
        .catch(err => {
          console.log('Error is: ', err);
        })
    }

    function addUser(){
      axios
        .post("/user/add", {
          username: $("#username").val(),
          name: $("#name").val(),
          rol: $("#rol").val(),
          salary: $("#salary").val(),
          pm: $("#pm").prop("checked")
        })
        .then(responseFromAPI => { 
          if (responseFromAPI.data.success===false){
            alert(responseFromAPI.data.message);
            $("#modal-guardar-usuario").removeClass("is-loading");
          }
          else{
              alert('El usuario se agregó correctamente')          
              $(".modal").removeClass("is-active");
            $("#modal-guardar-usuario").removeClass("is-loading");
              window.location.href = "/usuarios";
              }
          
        })
        .catch(err => {
          console.log(err);
        });
    }

    $(".eliminar-usuario").click(function() {
      $(".modal").addClass("is-active");
      $("#modal-guardar-usuario").attr("style", "display: none");
      $("#modal-actualizar").attr("style", "display: none");
      $("#modal-eliminar").attr("style", "display: block");
      $(".modal-card-title").html("Eliminar usuario");
      $(".modal-card-body").html(
        "El usuario <b>" +
          $("." + this.id).html() +
          "</b> será eliminado, ¿Deseas continuar?"
      );
      $("#userToDelete").val(this.id);
    });
    $("#modal-eliminar").click(function () { 
      deleteUser($("#userToDelete").val()); 
    });

    $("#btnAgregarUsuario").click( function () {
      $(".modal").addClass("is-active");
      $("#modal-guardar-usuario").attr("style", "display: block");
      $("#modal-eliminar").attr("style", "display: none");
      $("#modal-actualizar").attr("style", "display: none");
      $(".modal-card-title").html("Agregar nuevo usuario"); 
      $(".modal-card-body").html($("#nuevoUsuario").html());
    });
    $("#modal-guardar-usuario").click(function () {  
      if(validaInputsUser()){
        $("#modal-guardar-usuario").addClass("is-loading");
        addUser();
      }
      
    });
    function validaInputsUser() {
      if ($("#username").val().trim() == "" || $("#name").val().trim() == "" || $("#salary").val().trim() == "") {
        alert("Debes de llenar todos los campos para guardar el nuevo usuario")
        return false;
      }
      return true;
    }
    $(".editar-usuario").click(function () { 
      $("#modal-guardar-usuario").attr("style", "display: none");
      $("#modal-eliminar").attr("style", "display: none");
      $("#modal-actualizar").attr("style", "display: block");

      $("#modal-actualizar").addClass("is-loading");
      getUserData(this.id);
      $("#modal-actualizar").removeClass("is-loading");
      $(".modal").addClass("is-active");  
      $(".modal-card-title").html("Editar usuario");
      $(".modal-card-body").html($("#nuevoUsuario").html());
    });
    $("#modal-actualizar").click(function () {
      if (validaInputsUser()) { 
        updateUser();
      }
      
    })
    function updateUser() {
      axios.put("/user/update",{
        username: $("#username").val(),
        name: $("#name").val(),
        rol: $("#rol").val(),
        salary: $("#salary").val(),
        pm: $("#pm").prop("checked")
      })
      .then(res =>{ 
        if (res.data.success){
          alert(`El usuario ` +$("#username").val()+` se actualizó correctamente`);
          window.location.href = "/usuarios";
        }else{
          alert("Error al actualizar intentalo mas tarde");
        }
      })
      .catch(err =>{
        alert("Error al actualizar intentalo mas tarde");
      })
    }

    $(".showModal").click(function () {
      $(".modal").addClass("is-active");
    });

    $(".modal-close").click(function () {
      $(".modal").removeClass("is-active");
    });

    $(function () {
      $("#resp").change(function () {
        $("#respID")[0].selectedIndex = $(this)[0].selectedIndex;
      });
    });

    $(function () {
      $("#respID").change(function () {
        $("#resp")[0].selectedIndex = $(this)[0].selectedIndex;
      });
    });



    document.getElementById("etapaBoton").onclick = function () {
      let etapa = document.getElementById('etapa');
      let responsable = document.getElementById('resp');
      let grado = document.getElementById('grado');
      let text = etapa.value;
      let resp = responsable.value;
      let money = grado.value;


      let etapas = document.getElementById('tags');
      etapas.innerHTML += `<span class="tag is-warning">${text}</span>`
      etapas.innerHTML += `<input style="display:none" name="etapa" value="${text}">`
      etapas.innerHTML += `<input style="display:none" name="resp" value="${resp}">`
      etapas.innerHTML += `<input style="display:none" type="number" name="grado" value="${money}">`

      document.getElementById('etapa').value = "";
      document.getElementById('resp').value = "";
      document.getElementById('grado').value = "";
      event.preventDefault();

      
    }



    function addTarea(){
      axios
        .post("/home-tarea", {
          nom: $("#tarea").val(),
          responsable: $("#respTarea").val(),
          fechaI: '',
          fechaC: '',
          fechaF: '',
          finalizada: 'false', 
          grado: $("#gradoTarea").val(),
          creador: req.user.id

          // username: $("#username").val(),
          // name: $("#name").val(),
          // rol: $("#rol").val(),
          // salary: $("#salary").val(),
          // pm: $("#pm").prop("checked")
        })
        .then(responseFromAPI => {
          console.log(
            "Response from API is:",
            responseFromAPI,
            responseFromAPI.data.message
          );
          if (responseFromAPI.data.success===false){
            alert(responseFromAPI.data.message);
            $("#modal-guardar-usuario").removeClass("is-loading");
          }
          else{
              alert('El usuario se agregó correctamente')          
              $(".modal").removeClass("is-active");
            $("#modal-guardar-usuario").removeClass("is-loading");
              window.location.href = "/users";
              }
          
        })
        .catch(err => {
          console.log(err);
        });
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

  window.onload = function() {
    mensaje = decodeURIComponent(window.location.search)
    document.getElementById('mensaje').innerHTML = mensaje.substring(60,3);

  }

  },
  false
);


document.getElementById("tareaBoton").onclick = function () {
  let tarea = document.getElementById('tarea');
  let responsable = document.getElementById('respTarea');
  let grado = document.getElementById('gradoTarea');
  let id = document.getElementById('etapaId');
  let user = document.getElementById('userId');
  let text = tarea.value;
  let resp = responsable.value;
  let money = grado.value;
  let etId = id.innerHTML

  

  let etapas = document.getElementById('tagsTarea');
  etapas.innerHTML += `<span class="tag is-warning">${text}</span>`
  etapas.innerHTML += `<input style="display:none" name="tarea" value="${text}">`
  etapas.innerHTML += `<input style="display:none" name="resp" value="${resp}">`
  etapas.innerHTML += `<input style="display:none" type="number" name="gradox" value="${money}">`
  //etapas.innerHTML += `<input style="display:none" type="number" name="idEt" value="${etId}">`

  document.getElementById('tarea').value = "";
  document.getElementById('respTarea').value = "";
  document.getElementById('gradoTarea').value = "";
  event.preventDefault();      
}
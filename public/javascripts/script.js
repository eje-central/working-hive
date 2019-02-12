document.addEventListener(
  "DOMContentLoaded",
  () => {
    //console.log("IronGenerator JS imported successfully!");

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
        .delete("/user/delete/"+id)
        .then(responseFromAPI => {
          console.log("Response from API is: ", responseFromAPI.data);
          $(".modal").removeClass("is-active");
          window.location.href = "/users";
        })
        .catch(err => {
          console.log("Error is: ", err);
        });
    }
    function addUser(){
      axios
        .post("/user/add", {
          username: $("#username").val(),
          name: $("#name").val(),
          rol_id: $("#rol").val(),
          salary: $("#salary").val(),
          pm: $("#pm").prop("checked")
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
    $(".eliminar-usuario").click(function() {
      $(".modal").addClass("is-active");
      $("#modal-guardar-usuario").attr("style", "display: none");
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
      $(".modal-card-title").html("Agregar nuevo usuario"); 
      $(".modal-card-body").html($("#nuevoUsuario").html());
    });
    $("#modal-guardar-usuario").click(function () {  
      if ($("#username").val().trim() == "" || $("#name").val().trim() == "" || $("#salary").val().trim()=="" ) {
        alert("Debes de llenar todos los campos para guardar el nuevo usuario")
        return;
      }
      $("#modal-guardar-usuario").addClass("is-loading");
      addUser();
    });

    $(".editar-usuario").click(function () { 
      $(".modal").addClass("is-active");
      $("#modal-guardar-usuario").attr("style", "display: block");
      $("#modal-eliminar").attr("style", "display: none");
      $(".modal-card-title").html("Editar usuario");
      $(".modal-card-body").html($("#nuevoUsuario").html());

    });

  },
  false
);
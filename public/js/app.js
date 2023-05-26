import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    //Limpiar las alertas
    let alertas = document.querySelector('.alertas');

    if(alertas) {
        limpiarAlertas();
    }

    if(skills) {
        skills.addEventListener('click', agregarSkills);

        //Una vez que estamos en editar llamar la funcion
        skillsSellecionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');

    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesLIstado);
    }
})
const skills = new Set();

const agregarSkills = (event) => {
    if(event.target.tagName === 'LI') {

       if (event.target.classList.contains('activo')) {
        //quitarlo del set y quitar la clase
            skills.delete(event.target.textContent);
            event.target.classList.remove('activo');

       }else {
        //agregarlo al set y agregar a la clase
            skills.add(event.target.textContent);
            event.target.classList.add('activo');
       }
   
    }
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;

}

const skillsSellecionados = () => {
    const seleccionadas =Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(selleccionada  => {
        skills.add(selleccionada.textContent)
    })

    //Inyectarlo en el hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas')
    const interval = setInterval(() => {
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        }else if(alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval)
        }
    }, 2000);
}

//Eliminar vacantes

const accionesLIstado = e => {
    e.preventDefault();
    if(e.target.dataset.eliminar) {
        //eliminar por medio de axios
        
        Swal.fire({
            title: 'Desea eliminar?',
            text: "Una vez eliminada no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar!',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {

                //Enviar la peticion con Axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                //Axios para eliminar el registro
                axios.delete(url, { params: {url} })
                    .then(function(resp){ 
                        if(resp.status === 200) {
                           Swal.fire(
                             'Eliminado!',
                              resp.data,
                             'success'
                           );

                           //eliminar del DOM

                           console.log(e.target.parentElement.parentElement.parentElement.removeChild
                            (e.target.parentElement.parentElement));
                        }
                    }).catch(() => {
                        Swal.fire({
                            type:'error',
                            title: 'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    })

            
            }
          })
    }else if(e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
}
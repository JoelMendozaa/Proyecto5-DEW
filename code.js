// Arreglo principal que contendrá todos los apartados y sub-apartados
let listaApartados = [];

// Objeto base para un apartado, usado como plantilla para crear nuevos apartados
const objApartado = {
    id: '',                 // Identificador único del apartado
    nombre: '',             // Nombre del apartado
    subApartados: []        // Arreglo de sub-apartados
}

// Referencias a elementos del DOM para manipulación
const formulario = document.querySelector('#formulario'); // Formulario de entrada
const nombreInput = document.querySelector('#nombre');    // Campo de texto para el nombre del apartado
const boton = document.querySelector('#btnAgregar');      // Botón de agregar apartado
const buscadorInput = document.querySelector('#buscador');// Campo de búsqueda de apartados

// Eventos
formulario.addEventListener('submit', validarFormulario); // Maneja el evento de envío del formulario
buscadorInput.addEventListener('input', buscarApartados); // Maneja el evento de entrada en el buscador

// Valida el formulario cuando se envía
function validarFormulario(e) {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    // Verifica si el campo de nombre está vacío
    if (nombreInput.value === '') {
        alert('Debes rellenar el campo');
        return;
    }
    
    // Verifica si ya existe un apartado con el mismo nombre en el nivel actual
    if (nombreExisteEnNivel(listaApartados, nombreInput.value)) {
        alert('Ya existe un apartado con ese nombre en este nivel');
        return;
    }
    
    // Asigna un nuevo ID y establece los valores del objeto 'objApartado'
    objApartado.id = Date.now();
    objApartado.nombre = nombreInput.value;
    objApartado.subApartados = [];
    
    agregarApartado(); // Llama a la función para agregar el apartado
}

// Agrega el apartado a la lista y lo muestra en el DOM
function agregarApartado() {
    listaApartados.push({...objApartado}); // Agrega una copia del objeto 'objApartado' al arreglo
    mostrarApartados(); // Muestra los apartados actualizados
    formulario.reset(); // Resetea el formulario
    limpiarObjeto();    // Limpia los valores del objeto 'objApartado'
}

// Limpia los valores del objeto 'objApartado'
function limpiarObjeto() {
    objApartado.id = '';
    objApartado.nombre = '';
    objApartado.subApartados = [];
}

// Muestra los apartados en el DOM, usando apartados filtrados si se proporcionan
function mostrarApartados(apartadosFiltrados = null) {
    limpiarHTML(); // Limpia el HTML previo
    const divApartados = document.querySelector('.div-apartados'); // Contenedor principal de los apartados
    renderizarApartados(apartadosFiltrados || listaApartados, divApartados, 0); // Renderiza los apartados
}

function ocultarApartados(){
        
}

// Renderiza los apartados y sub-apartados en el DOM
function renderizarApartados(apartados, contenedor, nivel) {
    apartados.forEach(apartado => {
        const {id, nombre, subApartados} = apartado;

        // Crea un elemento div para cada apartado
        const apartadoDiv = document.createElement('div');
        apartadoDiv.classList.add('apartado-item');
        apartadoDiv.dataset.id = id;
        apartadoDiv.style.marginLeft = `${nivel * 20}px`; // Aumenta el margen según el nivel

        // Crea un span para mostrar el nombre del apartado
        const nombreSpan = document.createElement('span');
        nombreSpan.textContent = nombre;
        nombreSpan.classList.add('apartado-nombre');

        // Crea un contenedor para los botones de acción
        const botonesDiv = document.createElement('div');
        botonesDiv.classList.add('apartado-botones');

        // Botón para eliminar el apartado
        const eliminarBoton = document.createElement('button');
        eliminarBoton.onclick = () => eliminarApartado(id); // Evento de click
        eliminarBoton.textContent = '-';
        eliminarBoton.classList.add('btn', 'btn-eliminar');
        eliminarBoton.disabled = subApartados.length > 0; // Desactiva el botón si hay sub-apartados

        // Botón para agregar un sub-apartado
        const agregarSubApartadoBoton = document.createElement('button');
        agregarSubApartadoBoton.onclick = () => agregarSubApartado(id); // Evento de click
        agregarSubApartadoBoton.textContent = '+';
        agregarSubApartadoBoton.classList.add('btn', 'btn-agregar-sub');

        // Añade los botones al contenedor de botones
        botonesDiv.appendChild(eliminarBoton);
        botonesDiv.appendChild(agregarSubApartadoBoton);

        // Añade el nombre y los botones al div del apartado
        apartadoDiv.appendChild(nombreSpan);
        apartadoDiv.appendChild(botonesDiv);

        // Añade el div del apartado al contenedor
        contenedor.appendChild(apartadoDiv);

        // Si hay sub-apartados, crea un sub-contenedor y los renderiza
        if (subApartados.length > 0) {
            const subContenedor = document.createElement('div');
            subContenedor.classList.add('sub-apartados');
            contenedor.appendChild(subContenedor);
            renderizarApartados(subApartados, subContenedor, nivel + 1);
        }
    });
}

// Elimina un apartado si no tiene sub-apartados
function eliminarApartado(id) {
    const apartado = encontrarApartadoPorId(listaApartados, id);
    if (apartado && apartado.subApartados.length === 0) {
        listaApartados = eliminarApartadoRecursivo(listaApartados, id);
        mostrarApartados(); // Actualiza la vista
    } else {
        alert('No se puede eliminar un apartado que contiene subapartados');
    }
}

// Elimina un apartado y sus sub-apartados de forma recursiva
function eliminarApartadoRecursivo(apartados, id) {
    return apartados.filter(apartado => {
        if (apartado.id === id) {
            return false; // Filtra el apartado a eliminar
        }
        // Elimina recursivamente en sub-apartados
        apartado.subApartados = eliminarApartadoRecursivo(apartado.subApartados, id);
        return true;
    });
}

// Agrega un sub-apartado al apartado padre
function agregarSubApartado(parentId) {
    const nuevoNombre = prompt('Ingrese el nombre del sub-apartado:');
    if (nuevoNombre) {
        const apartadoPadre = encontrarApartadoPorId(listaApartados, parentId);
        if (apartadoPadre && !nombreExisteEnNivel(apartadoPadre.subApartados, nuevoNombre)) {
            const nuevoSubApartado = {
                id: Date.now(),
                nombre: nuevoNombre,
                subApartados: []
            };
            agregarSubApartadoRecursivo(listaApartados, parentId, nuevoSubApartado);
            mostrarApartados(); // Actualiza la vista
        } else {
            alert('Ya existe un sub-apartado con ese nombre en este nivel');
        }
    }
}

// Agrega un sub-apartado de forma recursiva al árbol de apartados
function agregarSubApartadoRecursivo(apartados, parentId, nuevoSubApartado) {
    for (let apartado of apartados) {
        if (apartado.id === parentId) {
            apartado.subApartados.push(nuevoSubApartado);
            return true;
        }
        if (agregarSubApartadoRecursivo(apartado.subApartados, parentId, nuevoSubApartado)) {
            return true;
        }
    }
    return false;
}

// Verifica si un nombre de apartado existe en el nivel actual
function nombreExisteEnNivel(apartados, nombre) {
    return apartados.some(apartado => apartado.nombre.toLowerCase() === nombre.toLowerCase());
}

// Encuentra un apartado por su ID de forma recursiva
function encontrarApartadoPorId(apartados, id) {
    for (let apartado of apartados) {
        if (apartado.id === id) {
            return apartado;
        }
        const encontrado = encontrarApartadoPorId(apartado.subApartados, id);
        if (encontrado) {
            return encontrado;
        }
    }
    return null;
}

// Busca apartados por término de búsqueda
function buscarApartados() {
    const terminoBusqueda = buscadorInput.value.toLowerCase();
    if (terminoBusqueda === '') {
        mostrarApartados();
        return;
    }

    // Filtra los apartados por el término de búsqueda
    const apartadosFiltrados = filtrarApartados(listaApartados, terminoBusqueda);
    mostrarApartados(apartadosFiltrados);
}

// Filtra los apartados y sus sub-apartados por el término de búsqueda
function filtrarApartados(apartados, terminoBusqueda) {
    return apartados.reduce((acc, apartado) => {
        if (apartado.nombre.toLowerCase().includes(terminoBusqueda)) {
            acc.push({...apartado, subApartados: filtrarApartados(apartado.subApartados, terminoBusqueda)});
        } else {
            const subApartadosFiltrados = filtrarApartados(apartado.subApartados, terminoBusqueda);
            if (subApartadosFiltrados.length > 0) {
                acc.push({...apartado, subApartados: subApartadosFiltrados});
            }
        }
        return acc;
    }, []);
}

// Limpia el contenido HTML del contenedor de apartados
function limpiarHTML() {
    const divApartados = document.querySelector('.div-apartados');
    while(divApartados && divApartados.firstChild) {
        divApartados.removeChild(divApartados.firstChild);
    }
}

// Inicializa la vista de los apartados
mostrarApartados();
let listaApartados = [];

const objApartado = {
    id: '',
    nombre: '',
    subApartados: []
}

const formulario = document.querySelector('#formulario');
const nombreInput = document.querySelector('#nombre');
const boton = document.querySelector('#btnAgregar');

formulario.addEventListener('submit', validarFormulario);

function validarFormulario(e) {
    e.preventDefault();

    if(nombreInput.value === '') {
        alert('Debes rellenar el campo');
        return;
    }
    
    if(nombreExisteEnNivel(listaApartados, nombreInput.value)) {
        alert('Ya existe un apartado con ese nombre en este nivel');
        return;
    }
    
    objApartado.id = Date.now();
    objApartado.nombre = nombreInput.value;
    objApartado.subApartados = [];
    
    agregarApartado();
}

function agregarApartado() {
    listaApartados.push({...objApartado});
    mostrarApartados();
    formulario.reset();
    limpiarObjeto();
}

function limpiarObjeto() {
    objApartado.id = '';
    objApartado.nombre = '';
    objApartado.subApartados = [];
}

function mostrarApartados() {
    limpiarHTML();
    const divApartados = document.querySelector('.div-apartados');
    renderizarApartados(listaApartados, divApartados, 0);
}

function renderizarApartados(apartados, contenedor, nivel) {
    apartados.forEach(apartado => {
        const {id, nombre, subApartados} = apartado;

        const apartadoDiv = document.createElement('div');
        apartadoDiv.classList.add('apartado-item');
        apartadoDiv.dataset.id = id;
        apartadoDiv.style.marginLeft = `${nivel * 20}px`;

        const nombreSpan = document.createElement('span');
        nombreSpan.textContent = nombre;
        nombreSpan.classList.add('apartado-nombre');

        const botonesDiv = document.createElement('div');
        botonesDiv.classList.add('apartado-botones');

        const eliminarBoton = document.createElement('button');
        eliminarBoton.onclick = () => eliminarApartado(id);
        eliminarBoton.textContent = 'Borrar';
        eliminarBoton.classList.add('btn', 'btn-eliminar');
        eliminarBoton.disabled = subApartados.length > 0;

        const agregarSubApartadoBoton = document.createElement('button');
        agregarSubApartadoBoton.onclick = () => agregarSubApartado(id);
        agregarSubApartadoBoton.textContent = 'Agregar Sub';
        agregarSubApartadoBoton.classList.add('btn', 'btn-agregar-sub');

        botonesDiv.appendChild(eliminarBoton);
        botonesDiv.appendChild(agregarSubApartadoBoton);

        apartadoDiv.appendChild(nombreSpan);
        apartadoDiv.appendChild(botonesDiv);

        contenedor.appendChild(apartadoDiv);

        if (subApartados.length > 0) {
            const subContenedor = document.createElement('div');
            subContenedor.classList.add('sub-apartados');
            contenedor.appendChild(subContenedor);
            renderizarApartados(subApartados, subContenedor, nivel + 1);
        }
    });
}

function eliminarApartado(id) {
    const apartado = encontrarApartadoPorId(listaApartados, id);
    if (apartado && apartado.subApartados.length === 0) {
        listaApartados = eliminarApartadoRecursivo(listaApartados, id);
        mostrarApartados();
    } else {
        alert('No se puede eliminar un apartado que contiene subapartados');
    }
}

function eliminarApartadoRecursivo(apartados, id) {
    return apartados.filter(apartado => {
        if (apartado.id === id) {
            return false;
        }
        apartado.subApartados = eliminarApartadoRecursivo(apartado.subApartados, id);
        return true;
    });
}

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
            mostrarApartados();
        } else {
            alert('Ya existe un sub-apartado con ese nombre en este nivel');
        }
    }
}

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

function nombreExisteEnNivel(apartados, nombre) {
    return apartados.some(apartado => apartado.nombre.toLowerCase() === nombre.toLowerCase());
}

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

function limpiarHTML() {
    const divApartados = document.querySelector('.div-apartados');
    while(divApartados && divApartados.firstChild) {
        divApartados.removeChild(divApartados.firstChild);
    }
}
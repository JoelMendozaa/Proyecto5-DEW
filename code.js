let listaApartados = [];

const objApartado = {
    id: '',
    nombre: '',
    tipo: 'carpeta', // 'carpeta' o 'archivo'
    subApartados: [],
    visible: true
}

const formulario = document.querySelector('#formulario');
const nombreInput = document.querySelector('#nombre');
const boton = document.querySelector('#btnAgregar');
const buscadorInput = document.querySelector('#buscador');
const toggleAllApartadosCheckbox = document.querySelector('#toggleAllApartados');

formulario.addEventListener('submit', validarFormulario);
buscadorInput.addEventListener('input', buscarApartados);
toggleAllApartadosCheckbox.addEventListener('change', toggleAllApartados);

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
    objApartado.tipo = esArchivo(nombreInput.value) ? 'archivo' : 'carpeta';
    objApartado.subApartados = [];
    objApartado.visible = true;
    
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
    objApartado.tipo = 'carpeta';
    objApartado.subApartados = [];
    objApartado.visible = true;
}

function mostrarApartados(apartadosFiltrados = null) {
    limpiarHTML();
    const divApartados = document.querySelector('.div-apartados');
    renderizarApartados(apartadosFiltrados || listaApartados, divApartados, 0);
}

function renderizarApartados(apartados, contenedor, nivel) {
    apartados.forEach(apartado => {
        const {id, nombre, tipo, subApartados, visible} = apartado;

        const apartadoDiv = document.createElement('div');
        apartadoDiv.classList.add('apartado-item');
        apartadoDiv.dataset.id = id;
        apartadoDiv.style.marginLeft = `${nivel * 20}px`;

        if (tipo === 'carpeta') {
            const checkboxLabel = document.createElement('label');
            checkboxLabel.classList.add('container');
            checkboxLabel.innerHTML = `
                <input type="checkbox" class="toggle-apartado" ${visible ? 'checked' : ''}>
                <span class="checkmark"></span>
            `;
            checkboxLabel.querySelector('input').addEventListener('change', () => toggleApartado(id));
            apartadoDiv.appendChild(checkboxLabel);
        }

        const nombreSpan = document.createElement('span');
        nombreSpan.textContent = nombre;
        nombreSpan.classList.add('apartado-nombre');
        apartadoDiv.appendChild(nombreSpan);

        const botonesDiv = document.createElement('div');
        botonesDiv.classList.add('apartado-botones');

        const eliminarBoton = document.createElement('button');
        eliminarBoton.onclick = () => eliminarApartado(id);
        eliminarBoton.textContent = '-';
        eliminarBoton.classList.add('btn', 'btn-eliminar');
        eliminarBoton.disabled = tipo === 'carpeta' && subApartados.length > 0;
        botonesDiv.appendChild(eliminarBoton);

        if (tipo === 'carpeta') {
            const agregarSubApartadoBoton = document.createElement('button');
            agregarSubApartadoBoton.onclick = () => agregarSubApartado(id);
            agregarSubApartadoBoton.textContent = '+';
            agregarSubApartadoBoton.classList.add('btn', 'btn-agregar-sub');
            botonesDiv.appendChild(agregarSubApartadoBoton);
        }

        apartadoDiv.appendChild(botonesDiv);
        contenedor.appendChild(apartadoDiv);

        if (tipo === 'carpeta' && subApartados.length > 0 && visible) {
            const subContenedor = document.createElement('div');
            subContenedor.classList.add('sub-apartados');
            contenedor.appendChild(subContenedor);
            renderizarApartados(subApartados, subContenedor, nivel + 1);
        }
    });
}

function eliminarApartado(id) {
    const apartado = encontrarApartadoPorId(listaApartados, id);
    if (apartado && (apartado.tipo === 'archivo' || apartado.subApartados.length === 0)) {
        listaApartados = eliminarApartadoRecursivo(listaApartados, id);
        mostrarApartados();
    } else {
        alert('No se puede eliminar una carpeta que contiene subapartados');
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
    const nuevoNombre = prompt('Ingrese el nombre del sub-apartado (use una extensión para archivos, ej: .pdf, .html):');
    if (nuevoNombre) {
        const apartadoPadre = encontrarApartadoPorId(listaApartados, parentId);
        if (apartadoPadre && !nombreExisteEnNivel(apartadoPadre.subApartados, nuevoNombre)) {
            const nuevoSubApartado = {
                id: Date.now(),
                nombre: nuevoNombre,
                tipo: esArchivo(nuevoNombre) ? 'archivo' : 'carpeta',
                subApartados: [],
                visible: true
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

function buscarApartados() {
    const terminoBusqueda = buscadorInput.value.toLowerCase();
    if (terminoBusqueda === '') {
        mostrarApartados();
        return;
    }

    const apartadosFiltrados = filtrarApartados(listaApartados, terminoBusqueda);
    mostrarApartados(apartadosFiltrados);
}

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

function toggleApartado(id) {
    const apartado = encontrarApartadoPorId(listaApartados, id);
    if (apartado && apartado.tipo === 'carpeta') {
        apartado.visible = !apartado.visible;
        mostrarApartados();
    }
}

function toggleAllApartados() {
    const isChecked = toggleAllApartadosCheckbox.checked;
    toggleAllApartadosRecursivo(listaApartados, isChecked);
    mostrarApartados();
}

function toggleAllApartadosRecursivo(apartados, isVisible) {
    apartados.forEach(apartado => {
        if (apartado.tipo === 'carpeta') {
            apartado.visible = isVisible;
            if (apartado.subApartados.length > 0) {
                toggleAllApartadosRecursivo(apartado.subApartados, isVisible);
            }
        }
    });
}

function esArchivo(nombre) {
    // Lista de extensiones de archivo comunes
    const extensiones = ['.txt', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.mp4', '.avi', '.mov', '.zip', '.rar', '.html', '.css', '.js', '.php', '.py', '.java', '.c', '.cpp', '.htaccess'];
    return extensiones.some(ext => nombre.toLowerCase().endsWith(ext));
}

function limpiarHTML() {
    const divApartados = document.querySelector('.div-apartados');
    while(divApartados && divApartados.firstChild) {
        divApartados.removeChild(divApartados.firstChild);
    }
}

// Inicialización
mostrarApartados();
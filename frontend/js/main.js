(() => {
  const mainNav = document.getElementById('mainNav');
  const timelineWrap = document.getElementById('timelineWrap');
  const timelineEl = document.getElementById('timeline');
  const timelineFillEl = document.getElementById('timelineFill');
  const phaseEyebrow = document.getElementById('phaseEyebrow');
  const phaseTitle = document.getElementById('phaseTitle');
  const phaseDesc = document.getElementById('phaseDesc');

  const documentosView = document.getElementById('documentosView');
  const plantillasView = document.getElementById('plantillasView');
  const equipoView = document.getElementById('equipoView');

  const dropzone = document.getElementById('dropzone');
  const dropzoneIcon = document.getElementById('dropzoneIcon');
  const dropzoneTitle = document.getElementById('dropzoneTitle');
  const dropzoneHint = document.getElementById('dropzoneHint');
  const fileInput = document.getElementById('fileInput');

  const uploadForm = document.getElementById('uploadForm');
  const fieldNombre = document.getElementById('fieldNombre');
  const fieldAutor = document.getElementById('fieldAutor');
  const fieldVersion = document.getElementById('fieldVersion');
  const fieldObservaciones = document.getElementById('fieldObservaciones');
  const submitBtn = document.getElementById('submitBtn');
  const docList = document.getElementById('docList');

  const dropzonePlantilla = document.getElementById('dropzonePlantilla');
  const dropzonePlantillaIcon = document.getElementById('dropzonePlantillaIcon');
  const dropzonePlantillaTitle = document.getElementById('dropzonePlantillaTitle');
  const dropzonePlantillaHint = document.getElementById('dropzonePlantillaHint');
  const fileInputPlantilla = document.getElementById('fileInputPlantilla');

  const plantillaForm = document.getElementById('plantillaForm');
  const fieldNombrePlantilla = document.getElementById('fieldNombrePlantilla');
  const fieldFasePlantilla = document.getElementById('fieldFasePlantilla');
  const fieldDescripcionPlantilla = document.getElementById('fieldDescripcionPlantilla');
  const submitPlantillaBtn = document.getElementById('submitPlantillaBtn');
  const plantillaList = document.getElementById('plantillaList');
  const filtroFasePlantilla = document.getElementById('filtroFasePlantilla');

  const teamGrid = document.getElementById('teamGrid');
  const statusBanner = document.getElementById('statusBanner');
  const toastStack = document.getElementById('toastStack');
  const previewPanel = document.getElementById('previewPanel');
  const previewBody = document.getElementById('previewBody');

  let activeIndex = 0;
  let activeSection = 'documentos';
  let counts = {};
  let archivoSeleccionado = null;
  let plantillaSeleccionada = null;
  let docSeleccionadoId = null;

  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type ? `toast--${type}` : ''}`;
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function formatoTamano(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatoFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function extension(nombre) {
    const parts = nombre.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase().slice(0, 4) : 'DOC';
  }

  function iniciales(nombre) {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  function etiquetaFase(key) {
    const fase = PHASES.find(p => p.key === key);
    return fase ? fase.label : key;
  }

  function llenarSelectFases(select, incluirGeneral) {
    PHASES.forEach(phase => {
      const opt = document.createElement('option');
      opt.value = phase.key;
      opt.textContent = phase.label;
      select.appendChild(opt);
    });
  }

  function renderTimeline() {
    [...timelineEl.querySelectorAll('.phase-node')].forEach(n => n.remove());
    PHASES.forEach((phase, i) => {
      const btn = document.createElement('button');
      btn.className = 'phase-node';
      btn.dataset.index = i;
      btn.innerHTML = `
        <span class="phase-node__dot">${String(i + 1).padStart(2, '0')}</span>
        <span class="phase-node__label">${phase.label}</span>
        <span class="phase-node__count">${counts[phase.key] ?? 0}</span>
      `;
      btn.addEventListener('click', () => seleccionarFase(i));
      timelineEl.appendChild(btn);
    });
    actualizarEstadoNodos();
  }

  function actualizarEstadoNodos() {
    const nodes = [...timelineEl.querySelectorAll('.phase-node')];
    nodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === activeIndex);
      const key = PHASES[i].key;
      node.classList.toggle('has-files', (counts[key] ?? 0) > 0);
      node.querySelector('.phase-node__count').textContent = counts[key] ?? 0;
    });
    if (nodes.length > 1) {
      const pct = (activeIndex / (nodes.length - 1)) * 100;
      timelineFillEl.style.height = `${pct}%`;
    }
  }

  function renderTeam() {
    teamGrid.innerHTML = '';
    TEAM.forEach(persona => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <div class="team-card__avatar">${iniciales(persona.nombre)}</div>
        <div class="team-card__name">${persona.nombre}</div>
        <span class="team-card__role">${persona.rol}</span>
        <p class="team-card__bio">${persona.bio}</p>
      `;
      teamGrid.appendChild(card);
    });
  }

  function cambiarSeccion(seccion) {
    activeSection = seccion;
    [...mainNav.querySelectorAll('.nav-item')].forEach(item => {
      item.classList.toggle('is-active', item.dataset.section === seccion);
    });
    documentosView.hidden = seccion !== 'documentos';
    plantillasView.hidden = seccion !== 'plantillas';
    equipoView.hidden = seccion !== 'equipo';
    timelineWrap.hidden = seccion !== 'documentos';
    previewPanel.hidden = seccion === 'equipo';
    limpiarVistaPrevia();

    if (seccion === 'plantillas') cargarPlantillas();
  }

  async function seleccionarFase(i) {
    activeIndex = i;
    const phase = PHASES[i];
    phaseEyebrow.textContent = `Fase ${String(i + 1).padStart(2, '0')} / ${String(PHASES.length).padStart(2, '0')}`;
    phaseTitle.textContent = phase.label;
    phaseDesc.textContent = phase.desc;
    limpiarFormularioDocumento();
    limpiarVistaPrevia();
    actualizarEstadoNodos();
    await cargarDocumentos(phase.key);
  }

  function renderListaArchivos(contenedor, docs, vacio, mostrarFase) {
    contenedor.innerHTML = '';
    if (!docs.length) {
      contenedor.innerHTML = `<li class="empty-state">${vacio}</li>`;
      return;
    }
    docs.forEach(doc => {
      const nombreMostrado = doc.nombreDocumento && doc.nombreDocumento.trim()
        ? doc.nombreDocumento : doc.nombreOriginal;

      const metaPartes = [formatoTamano(doc.tamano), `subido el ${formatoFecha(doc.fechaSubida)}`];
      if (doc.autor) metaPartes.push(`por ${doc.autor}`);
      if (doc.version) metaPartes.push(`versión ${doc.version}`);

      const li = document.createElement('li');
      li.className = 'doc-card';
      li.dataset.id = doc.id;
      li.classList.toggle('is-selected', doc.id === docSeleccionadoId);
      li.innerHTML = `
        <div class="doc-card__row">
          <div class="doc-card__icon">${extension(doc.nombreOriginal)}</div>
          <div class="doc-card__info">
            <div class="doc-card__name" title="${doc.nombreOriginal}">${nombreMostrado}${mostrarFase ? `<span class="doc-card__phase-tag">${doc.fase ? etiquetaFase(doc.fase) : 'General'}</span>` : ''}</div>
            <div class="doc-card__meta">${metaPartes.join(' · ')}</div>
          </div>
          <div class="doc-card__actions">
            <a class="icon-btn" title="Descargar" href="${API.urlDescarga(doc.id)}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
            </a>
            <button class="icon-btn icon-btn--danger" title="Eliminar" data-id="${doc.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
        ${doc.observaciones ? `<div class="doc-card__note">${doc.observaciones}</div>` : ''}
      `;
      li.querySelector('.icon-btn--danger').addEventListener('click', () => eliminarArchivo(doc.id, contenedor === docList ? 'documento' : 'plantilla'));
      li.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        mostrarVistaPrevia(doc);
      });
      contenedor.appendChild(li);
    });
  }

  function iconoDocumentoVacio() {
    return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;
  }

  function construirVisor(doc) {
    const tipo = doc.tipoContenido || '';
    const url = API.urlVistaPrevia(doc.id);
    if (tipo.startsWith('image/')) {
      return `<img src="${url}" alt="${doc.nombreOriginal}">`;
    }
    if (tipo === 'application/pdf') {
      return `<iframe src="${url}" title="${doc.nombreOriginal}"></iframe>`;
    }
    return `
      <div class="preview-doc__placeholder">
        <div class="preview-doc__placeholder-icon">${extension(doc.nombreOriginal)}</div>
        <p>Vista previa no disponible para este tipo de archivo</p>
      </div>
    `;
  }

  function mostrarVistaPrevia(doc) {
    docSeleccionadoId = doc.id;
    const nombreMostrado = doc.nombreDocumento && doc.nombreDocumento.trim()
      ? doc.nombreDocumento : doc.nombreOriginal;
    previewBody.innerHTML = `
      <div class="preview-doc">
        <div class="preview-doc__viewer">${construirVisor(doc)}</div>
        <div class="preview-doc__name">${nombreMostrado}</div>
        <div class="preview-doc__meta">
          <div class="preview-doc__row"><span>Archivo</span><span>${doc.nombreOriginal}</span></div>
          <div class="preview-doc__row"><span>Tamaño</span><span>${formatoTamano(doc.tamano)}</span></div>
          <div class="preview-doc__row"><span>Subido</span><span>${formatoFecha(doc.fechaSubida)}</span></div>
          ${doc.autor ? `<div class="preview-doc__row"><span>Autor</span><span>${doc.autor}</span></div>` : ''}
          ${doc.version ? `<div class="preview-doc__row"><span>Versión</span><span>${doc.version}</span></div>` : ''}
          ${doc.fase ? `<div class="preview-doc__row"><span>Fase</span><span>${etiquetaFase(doc.fase)}</span></div>` : ''}
        </div>
        ${doc.observaciones ? `<div class="preview-doc__note">${doc.observaciones}</div>` : ''}
        <div class="preview-doc__actions">
          <a class="btn btn--primary" href="${API.urlDescarga(doc.id)}">Descargar archivo</a>
        </div>
      </div>
    `;
    [...document.querySelectorAll('.doc-card')].forEach(li => {
      li.classList.toggle('is-selected', Number(li.dataset.id) === docSeleccionadoId);
    });
  }

  function limpiarVistaPrevia() {
    docSeleccionadoId = null;
    previewBody.innerHTML = `
      <div class="preview-empty">
        ${iconoDocumentoVacio()}
        <p>Selecciona un documento para previsualizarlo</p>
      </div>
    `;
  }

  async function cargarDocumentos(faseKey) {
    try {
      const docs = await API.listarPorFase(faseKey, 'DOCUMENTO');
      renderListaArchivos(docList, docs, 'Aún no hay archivos en esta fase. Sube el primero arriba.', false);
      setOffline(false);
    } catch (e) {
      setOffline(true);
      renderListaArchivos(docList, [], 'Aún no hay archivos en esta fase. Sube el primero arriba.', false);
    }
  }

  async function cargarPlantillas() {
    const faseFiltro = filtroFasePlantilla.value || null;
    try {
      const docs = await API.listarPlantillas(faseFiltro);
      renderListaArchivos(plantillaList, docs, 'Todavía no hay plantillas cargadas.', true);
      setOffline(false);
    } catch (e) {
      setOffline(true);
      renderListaArchivos(plantillaList, [], 'Todavía no hay plantillas cargadas.', true);
    }
  }

  async function cargarResumen() {
    try {
      counts = await API.resumen('DOCUMENTO');
      setOffline(false);
    } catch (e) {
      counts = {};
      setOffline(true);
    }
    actualizarEstadoNodos();
  }

  function setOffline(isOffline) {
    statusBanner.classList.toggle('is-visible', isOffline);
  }

  function iconoCheck() {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  }

  function iconoSubida() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2.5"/><path d="M8.5 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2"/></svg>`;
  }

  function chipArchivo(file, alQuitar) {
    const chip = document.createElement('span');
    chip.className = 'dropzone__file';
    chip.innerHTML = `${extension(file.name)} · ${file.name} (${formatoTamano(file.size)}) `;
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.textContent = '✕';
    quitar.addEventListener('click', (e) => { e.stopPropagation(); alQuitar(); });
    chip.appendChild(quitar);
    return chip;
  }

  function seleccionarArchivo(file) {
    archivoSeleccionado = file;
    dropzoneTitle.textContent = 'Archivo listo para subir';
    dropzoneHint.innerHTML = '';
    dropzoneHint.appendChild(chipArchivo(file, limpiarFormularioDocumento));
    dropzoneIcon.innerHTML = iconoCheck();
    if (!fieldNombre.value) fieldNombre.value = file.name.replace(/\.[^/.]+$/, '');
    submitBtn.disabled = false;
  }

  function limpiarFormularioDocumento() {
    archivoSeleccionado = null;
    fileInput.value = '';
    dropzoneTitle.textContent = 'Arrastra un archivo aquí';
    dropzoneHint.textContent = 'o selecciónalo desde tu equipo · PDF, DOCX, XLSX, PNG, ZIP';
    dropzoneIcon.innerHTML = iconoSubida();
    uploadForm.reset();
    submitBtn.disabled = true;
  }

  function seleccionarPlantilla(file) {
    plantillaSeleccionada = file;
    dropzonePlantillaTitle.textContent = 'Plantilla lista para subir';
    dropzonePlantillaHint.innerHTML = '';
    dropzonePlantillaHint.appendChild(chipArchivo(file, limpiarFormularioPlantilla));
    dropzonePlantillaIcon.innerHTML = iconoCheck();
    if (!fieldNombrePlantilla.value) fieldNombrePlantilla.value = file.name.replace(/\.[^/.]+$/, '');
    submitPlantillaBtn.disabled = false;
  }

  function limpiarFormularioPlantilla() {
    plantillaSeleccionada = null;
    fileInputPlantilla.value = '';
    dropzonePlantillaTitle.textContent = 'Arrastra una plantilla aquí';
    dropzonePlantillaHint.textContent = 'o selecciónala desde tu equipo · DOCX, XLSX, PPTX, PDF';
    dropzonePlantillaIcon.innerHTML = iconoSubida();
    plantillaForm.reset();
    submitPlantillaBtn.disabled = true;
  }

  async function subirArchivoSeleccionado() {
    if (!archivoSeleccionado) return;
    const faseKey = PHASES[activeIndex].key;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo…';
    try {
      await API.subir(faseKey, archivoSeleccionado, {
        nombreDocumento: fieldNombre.value.trim(),
        autor: fieldAutor.value.trim(),
        version: fieldVersion.value.trim(),
        observaciones: fieldObservaciones.value.trim()
      }, 'DOCUMENTO');
      toast(`"${archivoSeleccionado.name}" subido correctamente`, 'success');
      limpiarFormularioDocumento();
      await cargarResumen();
      await cargarDocumentos(faseKey);
    } catch (e) {
      toast(e.message || 'Error al subir el archivo', 'error');
    } finally {
      submitBtn.textContent = 'Subir documento';
      submitBtn.disabled = !archivoSeleccionado;
    }
  }

  async function subirPlantillaSeleccionada() {
    if (!plantillaSeleccionada) return;
    submitPlantillaBtn.disabled = true;
    submitPlantillaBtn.textContent = 'Subiendo…';
    try {
      await API.subir(fieldFasePlantilla.value || null, plantillaSeleccionada, {
        nombreDocumento: fieldNombrePlantilla.value.trim(),
        observaciones: fieldDescripcionPlantilla.value.trim()
      }, 'PLANTILLA');
      toast(`Plantilla "${plantillaSeleccionada.name}" subida correctamente`, 'success');
      limpiarFormularioPlantilla();
      await cargarPlantillas();
    } catch (e) {
      toast(e.message || 'Error al subir la plantilla', 'error');
    } finally {
      submitPlantillaBtn.textContent = 'Subir plantilla';
      submitPlantillaBtn.disabled = !plantillaSeleccionada;
    }
  }

  async function eliminarArchivo(id, tipo) {
    try {
      await API.eliminar(id);
      toast(tipo === 'documento' ? 'Archivo eliminado' : 'Plantilla eliminada', 'success');
      if (docSeleccionadoId === id) limpiarVistaPrevia();
      if (tipo === 'documento') {
        const faseKey = PHASES[activeIndex].key;
        await cargarResumen();
        await cargarDocumentos(faseKey);
      } else {
        await cargarPlantillas();
      }
    } catch (e) {
      toast(e.message || 'Error al eliminar el archivo', 'error');
    }
  }

  mainNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;
    cambiarSeccion(btn.dataset.section);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) seleccionarArchivo(e.target.files[0]);
  });

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragover'); });
  });
  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 1) toast('Puedes subir un archivo a la vez, se tomó el primero');
    if (files.length) seleccionarArchivo(files[0]);
  });

  fileInputPlantilla.addEventListener('change', (e) => {
    if (e.target.files.length) seleccionarPlantilla(e.target.files[0]);
  });
  ['dragenter', 'dragover'].forEach(evt => {
    dropzonePlantilla.addEventListener(evt, (e) => { e.preventDefault(); dropzonePlantilla.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropzonePlantilla.addEventListener(evt, (e) => { e.preventDefault(); dropzonePlantilla.classList.remove('is-dragover'); });
  });
  dropzonePlantilla.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 1) toast('Puedes subir un archivo a la vez, se tomó el primero');
    if (files.length) seleccionarPlantilla(files[0]);
  });

  uploadForm.addEventListener('submit', (e) => { e.preventDefault(); subirArchivoSeleccionado(); });
  plantillaForm.addEventListener('submit', (e) => { e.preventDefault(); subirPlantillaSeleccionada(); });
  filtroFasePlantilla.addEventListener('change', () => cargarPlantillas());

  async function init() {
    renderTimeline();
    renderTeam();
    llenarSelectFases(fieldFasePlantilla);
    llenarSelectFases(filtroFasePlantilla);
    await cargarResumen();
    await seleccionarFase(0);
  }

  init();
})();

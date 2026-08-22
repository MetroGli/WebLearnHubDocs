const API = (() => {
  // En local (Live Server / python -m http.server) apunta directo al backend
  // en el puerto 8080. En producción, el frontend se sirve detrás del mismo
  // dominio que la API (proxy inverso), así que se usa una ruta relativa.
  const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const BASE_URL = esLocal ? 'http://localhost:8080/api' : `${window.location.origin}/api`;

  async function listarPorFase(fase, tipo = 'DOCUMENTO') {
    const res = await fetch(`${BASE_URL}/documentos?fase=${fase}&tipo=${tipo}`);
    if (!res.ok) throw new Error('No fue posible listar los documentos');
    return res.json();
  }

  async function listarPlantillas(fase) {
    const query = fase ? `?tipo=PLANTILLA&fase=${fase}` : '?tipo=PLANTILLA';
    const res = await fetch(`${BASE_URL}/documentos${query}`);
    if (!res.ok) throw new Error('No fue posible listar las plantillas');
    return res.json();
  }

  async function resumen(tipo = 'DOCUMENTO') {
    const res = await fetch(`${BASE_URL}/documentos/resumen?tipo=${tipo}`);
    if (!res.ok) throw new Error('No fue posible obtener el resumen');
    return res.json();
  }

  async function subir(fase, file, metadatos = {}, tipo = 'DOCUMENTO') {
    const formData = new FormData();
    if (fase) formData.append('fase', fase);
    formData.append('archivo', file);
    formData.append('tipo', tipo);
    if (metadatos.nombreDocumento) formData.append('nombreDocumento', metadatos.nombreDocumento);
    if (metadatos.autor) formData.append('autor', metadatos.autor);
    if (metadatos.version) formData.append('version', metadatos.version);
    if (metadatos.observaciones) formData.append('observaciones', metadatos.observaciones);
    const res = await fetch(`${BASE_URL}/documentos`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.mensaje || 'No fue posible subir el archivo');
    }
    return res.json();
  }

  async function eliminar(id) {
    const res = await fetch(`${BASE_URL}/documentos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No fue posible eliminar el archivo');
  }

  function urlDescarga(id) {
    return `${BASE_URL}/documentos/${id}/descargar`;
  }

  function urlVistaPrevia(id) {
    return `${BASE_URL}/documentos/${id}/vista-previa`;
  }

  return { listarPorFase, listarPlantillas, resumen, subir, eliminar, urlDescarga, urlVistaPrevia };
})();

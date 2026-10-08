// Campo de formulario reutilizable: etiqueta, control y mensaje de error con las clases
// de Bootstrap. Lo usan el formulario de contacto y el de videojuegos.
// - id: identificador en la página; nombre: clave del valor en el formulario.
// - tipo: 'text', 'email', 'number', 'url', 'textarea' o 'select' (este último con opciones).
function Campo({ id, nombre, etiqueta, tipo = 'text', valor, error, ayuda, opciones, onCambiar, onSalir, ref, ...atributos }) {
    const idAyuda = ayuda ? id + '-ayuda' : null;
    const idError = error ? id + '-error' : null;
    const descripcion = [idAyuda, idError].filter(Boolean).join(' ') || undefined;

    const propiedades = {
        id,
        name: nombre,
        ref,
        className: (tipo === 'select' ? 'form-select' : 'form-control') + (error ? ' is-invalid' : ''),
        value: valor,
        onChange: (evento) => onCambiar(nombre, evento.target.value),
        onBlur: () => onSalir(nombre),
        'aria-invalid': error ? true : undefined,
        'aria-describedby': descripcion,
        ...atributos,
    };

    let control;
    if (tipo === 'textarea') {
        control = <textarea {...propiedades} />;
    } else if (tipo === 'select') {
        control = (
            <select {...propiedades}>
                {opciones.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>
                ))}
            </select>
        );
    } else {
        control = <input type={tipo} {...propiedades} />;
    }

    return (
        <div className="mb-3">
            <label className="form-label" htmlFor={id}>{etiqueta}</label>
            {control}
            {ayuda && <div className="form-text" id={idAyuda}>{ayuda}</div>}
            {/* Renderizado condicional: el mensaje solo aparece si hay error */}
            {error && <div className="invalid-feedback" id={idError}>{error}</div>}
        </div>
    );
}

export default Campo;

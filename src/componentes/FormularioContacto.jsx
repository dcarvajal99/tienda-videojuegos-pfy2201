// Formulario de contacto con nombre, correo y mensaje. JavaScript lo valida antes de
// enviar; si hay errores, cada campo explica qué corregir y el foco va al primero.
// El envío es simulado (no hay servidor): muestra «Enviando…» y luego la confirmación.
import { useState, useRef, useEffect } from 'react';
import Campo from './Campo.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { validarContacto, LARGO_MENSAJE } from '../utilidades/validaciones.js';

const INICIALES = { nombre: '', email: '', mensaje: '' };
const ORDEN = ['nombre', 'email', 'mensaje']; // Orden en pantalla, para enfocar el primer error.
const DEMORA_ENVIO = 900;

function FormularioContacto() {
    const formulario = useFormulario(INICIALES, validarContacto);
    const [estado, setEstado] = useState('editando'); // 'editando', 'enviando' o 'enviado'
    const [mostrarResumen, setMostrarResumen] = useState(false);
    const [confirmacion, setConfirmacion] = useState(null);

    // Referencias a los controles, para mover el foco al primer campo con error.
    const refNombre = useRef(null);
    const refEmail = useRef(null);
    const refMensaje = useRef(null);
    const referencias = { nombre: refNombre, email: refEmail, mensaje: refMensaje };

    // Si el formulario desaparece durante el envío simulado, se cancela el temporizador.
    const temporizador = useRef(null);
    useEffect(() => () => clearTimeout(temporizador.current), []);

    const enviando = estado === 'enviando';
    const camposConError = ORDEN.filter((campo) => formulario.errores[campo]);

    function cambiar(nombre, valor) {
        if (estado === 'enviado') setEstado('editando'); // Al escribir otro mensaje, se oculta la confirmación.
        formulario.cambiar(nombre, valor);
    }

    function enviar(evento) {
        evento.preventDefault(); // Sin servidor: el formulario no recarga la página.
        if (enviando) return;     // Evita un doble envío.

        const errores = formulario.validarTodo();
        const conError = ORDEN.filter((campo) => errores[campo]);
        if (conError.length > 0) {
            setMostrarResumen(true);
            referencias[conError[0]].current.focus();
            return;
        }

        setMostrarResumen(false);
        setEstado('enviando');
        const { nombre, email } = formulario.valores;
        temporizador.current = setTimeout(() => {
            setConfirmacion({ nombre: nombre.trim().split(/\s+/)[0], email: email.trim() });
            setEstado('enviado');
            formulario.reiniciar();
        }, DEMORA_ENVIO);
    }

    return (
        <form className="formulario-contacto" noValidate onSubmit={enviar} aria-labelledby="tituloFormularioContacto">
            <h3 className="h5 mb-3" id="tituloFormularioContacto">Escríbenos</h3>

            {/* Renderizado condicional: resumen de errores o confirmación del envío */}
            {mostrarResumen && camposConError.length > 0 && (
                <div className="alert alert-danger py-2" role="alert">
                    {camposConError.length === 1
                        ? 'Revisa el campo marcado en rojo.'
                        : 'Revisa los ' + camposConError.length + ' campos marcados en rojo.'}
                </div>
            )}
            <div role="status">
                {estado === 'enviado' && confirmacion && (
                    <div className="alert alert-success py-2">
                        Gracias, {confirmacion.nombre}. Recibimos tu mensaje y te responderemos a {confirmacion.email}.
                    </div>
                )}
            </div>

            <Campo
                id="contacto-nombre"
                nombre="nombre"
                etiqueta="Nombre"
                valor={formulario.valores.nombre}
                error={formulario.errores.nombre}
                onCambiar={cambiar}
                onSalir={formulario.salir}
                ref={refNombre}
                autoComplete="name"
                maxLength={60}
            />
            <Campo
                id="contacto-email"
                nombre="email"
                etiqueta="Correo electrónico"
                tipo="email"
                valor={formulario.valores.email}
                error={formulario.errores.email}
                onCambiar={cambiar}
                onSalir={formulario.salir}
                ref={refEmail}
                autoComplete="email"
                maxLength={100}
            />
            <Campo
                id="contacto-mensaje"
                nombre="mensaje"
                etiqueta="Mensaje"
                tipo="textarea"
                valor={formulario.valores.mensaje}
                error={formulario.errores.mensaje}
                ayuda={formulario.valores.mensaje.length + ' de ' + LARGO_MENSAJE.maximo + ' caracteres'}
                onCambiar={cambiar}
                onSalir={formulario.salir}
                ref={refMensaje}
                rows={5}
                maxLength={LARGO_MENSAJE.maximo}
            />

            <button className="btn btn-dark" type="submit" aria-disabled={enviando}>
                {enviando ? (
                    <span className="d-inline-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        Enviando…
                    </span>
                ) : 'Enviar mensaje'}
            </button>
        </form>
    );
}

export default FormularioContacto;

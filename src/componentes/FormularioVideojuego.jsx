// Formulario para agregar un videojuego al catálogo. Usa las mismas piezas que el de
// contacto (Campo y useFormulario) y entrega el juego nuevo a App con onAgregar, así la
// lista, las cifras de la portada y el filtro se actualizan solos.
import { useState, useRef } from 'react';
import Campo from './Campo.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { validarVideojuego, PRECIO, LARGO_DESCRIPCION } from '../utilidades/validaciones.js';
import { crearVideojuego } from '../utilidades/catalogo.js';

const INICIALES = { nombre: '', categoria: '', precio: '', descripcion: '', desarrollador: '', imagen: '' };
const ORDEN = ['nombre', 'categoria', 'precio', 'descripcion', 'desarrollador', 'imagen'];

function FormularioVideojuego({ categorias, nombresExistentes, onAgregar }) {
    const formulario = useFormulario(INICIALES, (valores) => validarVideojuego(valores, nombresExistentes));
    const [mostrarResumen, setMostrarResumen] = useState(false);
    const [agregado, setAgregado] = useState('');
    const elFormulario = useRef(null);

    const camposConError = ORDEN.filter((campo) => formulario.errores[campo]);
    const opciones = [{ valor: '', texto: 'Elige una categoría' }]
        .concat(categorias.map((categoria) => ({ valor: categoria, texto: categoria })));

    function cambiar(nombre, valor) {
        setAgregado(''); // Al empezar otro juego se oculta la confirmación anterior.
        formulario.cambiar(nombre, valor);
    }

    function enviar(evento) {
        evento.preventDefault();
        const errores = formulario.validarTodo();
        const primero = ORDEN.find((campo) => errores[campo]);
        if (primero) {
            setMostrarResumen(true);
            // El formulario guarda sus controles por nombre: se enfoca el primero con error.
            elFormulario.current.elements.namedItem(primero).focus();
            return;
        }

        const videojuego = crearVideojuego(formulario.valores);
        onAgregar(videojuego);
        setAgregado(videojuego.nombre);
        setMostrarResumen(false);
        formulario.reiniciar();
    }

    // Props comunes a todos los campos de este formulario.
    const comunes = (nombre) => ({
        id: 'juego-' + nombre,
        nombre,
        valor: formulario.valores[nombre],
        error: formulario.errores[nombre],
        onCambiar: cambiar,
        onSalir: formulario.salir,
    });

    return (
        <form ref={elFormulario} noValidate onSubmit={enviar} aria-labelledby="tituloFormularioJuego">
            <h3 className="h5 mb-3" id="tituloFormularioJuego">Agregar un videojuego</h3>

            {mostrarResumen && camposConError.length > 0 && (
                <div className="alert alert-danger py-2" role="alert">
                    {camposConError.length === 1
                        ? 'Revisa el campo marcado en rojo.'
                        : 'Revisa los ' + camposConError.length + ' campos marcados en rojo.'}
                </div>
            )}
            <div role="status">
                {agregado && (
                    <div className="alert alert-success py-2">
                        Agregaste {agregado} al catálogo. <a href="#catalogo">Verlo en el catálogo</a>
                    </div>
                )}
            </div>

            <div className="row gx-3">
                <div className="col-md-7">
                    <Campo {...comunes('nombre')} etiqueta="Nombre" maxLength={60} />
                </div>
                <div className="col-md-5">
                    <Campo {...comunes('categoria')} etiqueta="Categoría" tipo="select" opciones={opciones} />
                </div>
                <div className="col-md-5">
                    <Campo
                        {...comunes('precio')}
                        etiqueta="Precio en pesos"
                        tipo="number"
                        inputMode="numeric"
                        min={PRECIO.minimo}
                        max={PRECIO.maximo}
                        step={10}
                        placeholder="Ej.: 39990"
                    />
                </div>
                <div className="col-md-7">
                    <Campo {...comunes('desarrollador')} etiqueta="Desarrollador (opcional)" maxLength={60} />
                </div>
            </div>
            <Campo
                {...comunes('descripcion')}
                etiqueta="Descripción corta"
                tipo="textarea"
                rows={3}
                maxLength={LARGO_DESCRIPCION.maximo}
                ayuda={formulario.valores.descripcion.length + ' de ' + LARGO_DESCRIPCION.maximo + ' caracteres'}
            />
            <Campo
                {...comunes('imagen')}
                etiqueta="Dirección de la portada (opcional)"
                tipo="url"
                placeholder="https://"
                ayuda="Si la dejas vacía o no carga, se usa una portada genérica."
            />

            <button className="btn btn-dark" type="submit">Agregar al catálogo</button>
        </form>
    );
}

export default FormularioVideojuego;

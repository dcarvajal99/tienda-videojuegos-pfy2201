// Estado de un formulario: valores, errores y si ya se intentó enviar.
// Los errores aparecen al salir de un campo que se escribió o al intentar enviar;
// desde ese momento se revalidan mientras la persona corrige.
import { useState } from 'react';

export function useFormulario(iniciales, validar) {
    const [valores, setValores] = useState(iniciales);
    const [errores, setErrores] = useState({});
    const [intentado, setIntentado] = useState(false);

    function cambiar(nombre, valor) {
        const nuevos = { ...valores, [nombre]: valor };
        setValores(nuevos);
        // Si el campo ya mostraba un error (o ya se intentó enviar), se revalida al escribir.
        if (intentado || errores[nombre]) {
            const encontrados = validar(nuevos);
            setErrores((anteriores) => ({ ...anteriores, [nombre]: encontrados[nombre] }));
        }
    }

    function salir(nombre) {
        // Pasar por un campo vacío sin escribir no muestra error hasta que se intente enviar.
        if (!intentado && String(valores[nombre]).trim() === '') return;
        const encontrados = validar(valores);
        setErrores((anteriores) => ({ ...anteriores, [nombre]: encontrados[nombre] }));
    }

    // Valida todo; devuelve los errores para que el formulario decida qué hacer.
    function validarTodo() {
        const encontrados = validar(valores);
        setErrores(encontrados);
        setIntentado(true);
        return encontrados;
    }

    function reiniciar() {
        setValores(iniciales);
        setErrores({});
        setIntentado(false);
    }

    return { valores, errores, cambiar, salir, validarTodo, reiniciar };
}

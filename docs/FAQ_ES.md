# Preguntas frecuentes

## ¿Debo escribir mi contraseña?

No. Inicia sesión normalmente en Instagram y ejecuta el script dentro de esa pestaña. El proyecto no incluye un formulario de inicio de sesión.

## ¿El autor recibe mi lista?

No. El escáner no contiene una función para enviar resultados al autor. Los datos permanecen en la pestaña hasta que cierres la interfaz o recargues.

## ¿Deja de seguir personas automáticamente?

No. El proyecto es deliberadamente de solo lectura.

## ¿Por qué se ejecuta en la consola?

La consola permite ejecutar el código dentro de tu propia sesión de Instagram sin instalar una extensión con permisos permanentes.

## ¿Es una herramienta oficial?

No. No está afiliada con Instagram ni Meta y utiliza una respuesta interna de Instagram Web.

## ¿Los resultados son 100 % exactos?

No se puede garantizar. Instagram puede entregar datos incompletos, cambiar la relación durante el escaneo o modificar su respuesta interna. Verifica manualmente una muestra.

## ¿Por qué existe la categoría “Incierto”?

Porque inventar una respuesta sería peor que reconocer que faltan datos. Cuando `follows_viewer` no es booleano, la cuenta se separa para revisión manual.

## ¿Funciona en teléfonos?

No es el uso recomendado. Las consolas móviles son limitadas y más difíciles de revisar. Usa un navegador de escritorio.

## ¿Puedo hacerlo con una cuenta privada?

Sí, siempre que sea tu cuenta y tengas una sesión web iniciada. La privacidad de tu propia cuenta no impide consultar a quién sigues.

## ¿Cuánto tarda?

Depende de cuántas cuentas sigues, de las pausas configuradas y de la respuesta de Instagram. El proyecto prioriza estabilidad sobre velocidad.

## ¿Qué hago con HTTP 429?

Detén el proceso y no lo repitas inmediatamente. Es un límite temporal aplicado por Instagram.

## ¿Puedo reducir todas las pausas?

Técnicamente sí, pero no es recomendable. Aumenta la posibilidad de errores y límites temporales.

## ¿Por qué no se incluye unfollow automático?

Porque modifica la cuenta, aumenta el riesgo de acciones equivocadas y dificulta comprobar si Instagram aceptó realmente cada operación.

## ¿Qué archivo debo compartir para reportar un error?

Comparte únicamente el texto del registro después de eliminar usuarios, identificadores y datos privados. Nunca publiques cookies, tokens o contraseñas.

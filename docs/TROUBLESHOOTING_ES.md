# Solución de problemas

## La página pública muestra 404

GitHub Pages puede tardar unos minutos después de activarse o después de un cambio. Confirma en `Settings → Pages` que la fuente sea `main` y `/(root)`.

## El botón “Copiar script” no funciona

Descarga el archivo `.js` desde la página o abre `src/instagram-no-followback-readonly.js` en GitHub y cópialo manualmente. Algunos navegadores bloquean el portapapeles si la página no tiene foco o permisos.

## El navegador no me deja pegar en la consola

Es una protección contra ataques de ingeniería social. Lee la advertencia del navegador y continúa únicamente después de revisar el código. No sigas instrucciones de terceros que te pidan pegar versiones modificadas.

## La interfaz no aparece

Comprueba:

1. La URL debe ser `https://www.instagram.com/`.
2. Debes haber iniciado sesión.
3. Pegaste el archivo completo.
4. No hay un error de sintaxis anterior en la consola.
5. Recargaste la página antes de volver a intentarlo.

## “No se encontró la cookie ds_user_id”

Recarga Instagram, cierra y vuelve a iniciar sesión. Algunas configuraciones de privacidad o bloqueo de cookies pueden impedir que la sesión esté disponible.

## HTTP 401

Instagram no considera válida la sesión. Vuelve a iniciar sesión antes de repetir.

## HTTP 403

Instagram rechazó la consulta. Detén el escaneo, revisa la sesión y no continúes con reintentos repetidos.

## HTTP 429

Instagram aplicó un límite temporal. No reduzcas las pausas y no reinicies inmediatamente.

## “Estructura no reconocida”

Instagram cambió o no entregó la estructura esperada. Exporta el JSON y conserva el registro, pero elimina datos privados antes de reportarlo.

## El progreso supera o no alcanza el total esperado

El total puede cambiar durante el escaneo o Instagram puede devolver duplicados. La herramienta deduplica por ID y usa el total esperado solo como referencia.

## Una persona aparece como “No te sigue”, pero sí me sigue

1. Abre el perfil y confirma manualmente.
2. Revisa si cambió su nombre de usuario.
3. Comprueba si la relación cambió después de iniciar el escaneo.
4. Conserva el JSON para diagnosticar el valor original.
5. Reporta el problema sin publicar datos personales.

## Faltan cuentas

Puede deberse a una respuesta incompleta, un límite temporal, un cursor inválido o un cambio interno. Revisa el registro. No combines automáticamente resultados de ejecuciones incompletas.

## La interfaz sigue abierta después de terminar

Pulsa **Cerrar** o recarga la pestaña.

## Cómo reportar un error

Incluye:

- Navegador y versión.
- Versión del script.
- Mensaje de error.
- Paso donde ocurrió.
- Registro sanitizado.

No incluyas contraseñas, cookies, tokens, IDs o listas de usuarios.

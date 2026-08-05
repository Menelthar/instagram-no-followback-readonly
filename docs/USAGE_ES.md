# Guía de uso

## Antes de comenzar

Este script se ejecuta dentro de una sesión iniciada en `www.instagram.com`. No escribas tu contraseña dentro del script ni la compartas con nadie.

La herramienta es de solo lectura:

- Realiza solicitudes `GET`.
- No contiene acciones de *unfollow*.
- No envía resultados a servicios externos.
- Se detiene ante límites o errores críticos.

## Ejecución

1. Abre `https://www.instagram.com/`.
2. Inicia sesión normalmente.
3. Abre la consola del navegador:
   - Chrome/Edge en Windows: `Ctrl + Shift + J`
   - Firefox en Windows: `Ctrl + Shift + K`
   - Chrome en macOS: `⌘ + ⌥ + J`
4. Abre el archivo `src/instagram-no-followback-readonly.js` desde este repositorio.
5. Revisa el código y copia su contenido completo.
6. Pégalo en la consola.
7. Presiona `Enter`.
8. Pulsa **Iniciar escaneo**.

## Advertencia de autoprotección de la consola

Algunos navegadores impiden pegar código en la consola para protegerte contra engaños. Sigue únicamente las instrucciones mostradas por tu propio navegador y solo después de haber revisado el código.

Nunca ejecutes una versión que:

- Solicite tu contraseña.
- Pida copiar cookies o tokens.
- Envíe datos a dominios distintos de Instagram.
- Oculte o minimice código de procedencia desconocida.
- Prometa evitar por completo los límites de Instagram.

## Ajustes

Los valores predeterminados priorizan estabilidad, no velocidad.

- **Espera mínima/máxima:** pausa entre páginas.
- **Pausa larga cada N páginas:** descanso adicional periódico.
- **Reintentos máximos:** evita ciclos infinitos ante fallos temporales.
- **Filas por página:** solo afecta la tabla local.

No reduzcas agresivamente las pausas. Una respuesta HTTP `429` significa que debes detenerte y no repetir inmediatamente el escaneo.

## Resultados

### No te siguen

Cuentas con `follows_viewer === false`.

### Mutuos

Cuentas con `follows_viewer === true`.

### Inciertos

Registros sin un valor booleano confiable en `follows_viewer`. No deben interpretarse automáticamente como no seguidores.

### Todos

Lista completa obtenida durante el escaneo.

## Exportación

- **Copiar lista visible:** copia los usuarios filtrados.
- **CSV visible:** exporta la pestaña y búsqueda actuales.
- **JSON completo:** incluye todos los usuarios, clasificación, metadatos básicos y registro del escaneo.

## Verificación recomendada

Antes de dejar de seguir manualmente a alguien:

1. Abre su perfil desde el enlace del resultado.
2. Comprueba la relación directamente en Instagram.
3. Repite la comprobación con una muestra de al menos 10–20 cuentas.
4. Conserva el JSON si necesitas diagnosticar discrepancias.

## Detención por errores

La herramienta se detiene ante:

- `401`: sesión no autorizada.
- `403`: acceso rechazado.
- `429`: límite temporal.
- Estructura de respuesta desconocida.
- Cursor repetido.
- Falta de cursor cuando Instagram indica otra página.

Esto evita continuar con resultados potencialmente incompletos o inventados.

# Guía de uso en español

## Resumen

Esta herramienta revisa las cuentas que sigues en Instagram y clasifica la relación que Instagram devuelve para cada una. Se ejecuta dentro de tu navegador y no realiza cambios en tu cuenta.

## Requisitos

- Computadora con Chrome, Edge o Firefox.
- Sesión iniciada en `https://www.instagram.com/`.
- Permiso para abrir las herramientas de desarrollador del navegador.
- Tiempo suficiente para que el escaneo termine sin repetirlo varias veces.

No necesitas instalar extensiones, Node.js ni aplicaciones móviles.

## Antes de ejecutar

1. Cierra pestañas duplicadas de Instagram.
2. Recarga la pestaña principal.
3. Confirma que puedes abrir tu perfil normalmente.
4. No uses simultáneamente otras herramientas que automaticen acciones en Instagram.
5. Lee el código antes de pegarlo.

## Ejecución paso a paso

1. Abre `https://www.instagram.com/` e inicia sesión.
2. Abre la página del proyecto:
   `https://menelthar.github.io/instagram-no-followback-readonly/`
3. Pulsa **Copiar script**.
4. Regresa a la pestaña de Instagram.
5. Abre la consola:
   - Chrome/Edge, Windows: `Ctrl + Shift + J`
   - Firefox, Windows: `Ctrl + Shift + K`
   - Chrome, macOS: `⌘ + ⌥ + J`
6. Pega el código completo.
7. Presiona `Enter`.
8. Se abrirá una interfaz sobre Instagram.
9. Mantén los tiempos predeterminados y pulsa **Iniciar escaneo**.

## Protección contra pegar código

Algunos navegadores muestran una advertencia para evitar que una persona te engañe y te haga pegar código peligroso.

Solo continúa cuando:

- Abriste el código desde este repositorio.
- Revisaste que no solicite contraseñas o cookies.
- Confirmaste que las solicitudes se dirigen a Instagram.
- Entiendes que el proyecto no es oficial.

Nunca copies cookies, tokens, cabeceras o contraseñas en un issue público.

## Controles del escáner

- **Iniciar escaneo:** borra el resultado anterior y comienza desde la primera página.
- **Pausar:** detiene temporalmente nuevas consultas.
- **Reanudar:** continúa desde el cursor actual.
- **Detener:** cancela la consulta activa y conserva lo ya procesado.
- **Cerrar:** elimina la interfaz de la página.

## Ajustes

Los valores predeterminados priorizan estabilidad.

### Espera mínima y máxima

Pausa aleatoria entre páginas. No conviene reducirla agresivamente.

### Pausa larga

Descanso adicional después de varias páginas.

### Reintentos máximos

Número limitado de intentos ante fallos temporales. Los errores críticos no se reintentan.

### Filas por página

Solo cambia cuántos resultados muestra la tabla local. No cambia la velocidad del escaneo.

## Interpretación

### No te siguen

Instagram devolvió `follows_viewer === false`.

### Mutuos

Instagram devolvió `follows_viewer === true`.

### Inciertos

Instagram no devolvió un valor booleano confiable. No asumas que estas cuentas no te siguen.

### Todos

Todas las cuentas obtenidas durante el escaneo.

## Exportación

- **Copiar lista visible:** copia los usuarios de la pestaña y filtro actuales.
- **CSV visible:** descarga la vista actual.
- **JSON completo:** conserva todos los usuarios, clasificación y registro técnico.

Los archivos exportados pueden contener nombres de usuario. Guárdalos de forma privada.

## Verificación recomendada

Antes de dejar de seguir manualmente a una persona:

1. Abre su perfil desde la tabla.
2. Comprueba la relación directamente.
3. Verifica al menos 10–20 resultados aleatorios.
4. Revisa especialmente las cuentas privadas, renombradas o con solicitudes pendientes.
5. No realices grandes cantidades de acciones en poco tiempo.

## Al terminar

Pulsa **Cerrar** o recarga Instagram. Los resultados en memoria desaparecerán, salvo lo que hayas exportado.

Consulta también:

- [Preguntas frecuentes](FAQ_ES.md)
- [Solución de problemas](TROUBLESHOOTING_ES.md)
- [Privacidad](PRIVACY.md)

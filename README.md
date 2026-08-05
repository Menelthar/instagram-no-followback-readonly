# Instagram No-Follow-Back — Read Only

[![Validate](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml/badge.svg)](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)

Escáner de **solo lectura** para identificar qué cuentas de Instagram sigues y no te siguen de vuelta.

No solicita contraseñas, no incluye funciones de *unfollow*, no realiza solicitudes `POST` y no envía resultados a servidores externos.

> [!WARNING]
> Este proyecto utiliza un endpoint interno de la versión web de Instagram, no una API pública ni oficialmente soportada. Instagram puede cambiarlo, limitar las consultas o mostrar advertencias de actividad automatizada. Utilízalo con moderación y bajo tu responsabilidad.

## Características

- Consulta paginada de las cuentas que sigues.
- Clasificación mediante el campo `follows_viewer` devuelto por Instagram.
- Resultados separados en:
  - No te siguen.
  - Seguimiento mutuo.
  - Resultado incierto.
  - Todas las cuentas procesadas.
- Deduplicación mediante el identificador interno de usuario.
- Pausar, reanudar y detener.
- Reintentos limitados.
- Detención automática ante HTTP `401`, `403` o `429`.
- Protección contra cursores repetidos y ciclos infinitos.
- Búsqueda, paginación y enlaces de comprobación manual.
- Exportación CSV y JSON.
- Interfaz aislada mediante Shadow DOM.
- Sin dependencias externas.

## Uso rápido

1. Abre [Instagram Web](https://www.instagram.com/) e inicia sesión.
2. Abre las herramientas de desarrollador:
   - Windows/Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + J`
3. Abre [`src/instagram-no-followback-readonly.js`](src/instagram-no-followback-readonly.js).
4. Copia todo el contenido.
5. Pégalo en la consola y presiona `Enter`.
6. Pulsa **Iniciar escaneo**.
7. Revisa manualmente una muestra de los resultados antes de tomar decisiones.

La guía detallada está en [`docs/USAGE_ES.md`](docs/USAGE_ES.md).

## Cómo interpreta los resultados

| Campo recibido | Clasificación |
|---|---|
| `follows_viewer === false` | No te sigue de vuelta |
| `follows_viewer === true` | Seguimiento mutuo |
| Campo ausente o no booleano | Resultado incierto |

La herramienta **no compara archivos exportados**. Consulta la relación disponible en la sesión web en el momento del escaneo.

## Privacidad

Las solicitudes se realizan desde tu navegador hacia `www.instagram.com`. Los resultados permanecen en memoria mientras la herramienta está abierta y solo se guardan cuando tú eliges exportarlos.

Consulta [`docs/PRIVACY.md`](docs/PRIVACY.md) para más detalles.

## Limitaciones

- No es una integración oficial de Meta.
- El endpoint interno puede cambiar sin previo aviso.
- Instagram puede entregar datos incompletos o temporalmente inconsistentes.
- Una cuenta puede cambiar su relación contigo después del escaneo.
- Las cuentas desactivadas, renombradas, restringidas o pendientes pueden producir resultados inesperados.
- La comprobación manual sigue siendo recomendable.

## Desarrollo

No se requieren dependencias.

```bash
npm run check
```

También puedes comprobarlo directamente:

```bash
node --check src/instagram-no-followback-readonly.js
```

## GitHub Pages

Este repositorio incluye una página estática para mostrar y copiar el script.

Una vez habilitada GitHub Pages desde la rama `main` y la carpeta raíz, estará disponible en:

`https://menelthar.github.io/instagram-no-followback-readonly/`

Consulta [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## Seguridad

No pegues en la consola código que no hayas revisado. Verifica que estés utilizando este repositorio oficial y revisa el historial de cambios antes de ejecutar una versión nueva.

SHA-256 de la versión inicial del script:

```text
8ffc1e6ea599545c080867f39375a561d258839e0f04c5a96618990630011a22
```

Consulta [`SECURITY.md`](SECURITY.md) para reportar vulnerabilidades.

## Créditos

Proyecto independiente inspirado conceptualmente por
[`davidarroyo1234/InstagramUnfollowers`](https://github.com/davidarroyo1234/InstagramUnfollowers).

Esta implementación fue reescrita con un objetivo distinto: **análisis de solo lectura**, validación estricta de respuestas y ausencia total de automatización de *unfollow*.

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).

---

## English

An English usage guide is available at [`docs/USAGE_EN.md`](docs/USAGE_EN.md).

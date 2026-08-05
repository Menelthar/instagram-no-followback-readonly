# Instagram No-Follow-Back — Read Only

[![Validate](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml/badge.svg)](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml)
[![Open web app](https://img.shields.io/badge/Open-GitHub%20Pages-2ea44f)](https://menelthar.github.io/instagram-no-followback-readonly/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](CHANGELOG.md)

**Identifica las cuentas que sigues en Instagram y no te siguen de vuelta, sin entregar tu contraseña ni automatizar unfollows.**

La herramienta se ejecuta dentro de Instagram Web y mantiene los resultados en tu navegador. No solicita credenciales, no carga datos a servidores externos y no contiene acciones para modificar tu cuenta.

<p align="center">
  <a href="https://menelthar.github.io/instagram-no-followback-readonly/"><strong>Abrir la página del proyecto</strong></a>
  · <a href="docs/USAGE_ES.md">Guía en español</a>
  · <a href="docs/USAGE_EN.md">English guide</a>
  · <a href="docs/TROUBLESHOOTING_ES.md">Solucionar problemas</a>
</p>

> [!IMPORTANT]
> Es un proyecto independiente y no oficial. Utiliza un endpoint interno de Instagram Web, que puede cambiar o aplicar límites sin previo aviso. Comprueba manualmente una muestra de los resultados antes de tomar decisiones.

## Qué mejora la versión 1.1.0

- **Lector estricto:** prioriza rutas conocidas y rechaza respuestas ambiguas en lugar de elegir una lista parecida.
- **Diagnóstico de integridad:** muestra esperados, recibidos, únicos, duplicados, inválidos e inciertos.
- **Estados honestos:** distingue entre completado, completado con advertencias, incompleto y error.
- **Timeout por solicitud:** cancela consultas que permanecen colgadas.
- **Política HTTP explícita:** solo reintenta errores recuperables; se detiene ante sesión rechazada, límite o incompatibilidad.
- **Cancelación inmediata:** las pausas y reintentos pueden interrumpirse con **Detener**.
- **CSV protegido:** neutraliza valores que Excel podría interpretar como fórmulas.
- **Exportaciones privadas por defecto:** no incluye IDs internos ni URLs de foto salvo que el usuario lo marque.
- **Diagnóstico seguro:** copia información técnica sin nombres de usuario ni IDs personales.
- **Interfaz bilingüe:** español e inglés.
- **Accesibilidad:** navegación por teclado, control de foco y cierre con `Escape`.
- **Pruebas automatizadas:** parser, relaciones, cursores, HTTP, integridad y CSV.

## Uso rápido

1. Abre [Instagram Web](https://www.instagram.com/) e inicia sesión.
2. Abre la [página del proyecto](https://menelthar.github.io/instagram-no-followback-readonly/).
3. Revisa y copia el script.
4. Abre la consola del navegador:
   - Windows/Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + J`
5. Pega el script y presiona `Enter`.
6. Pulsa **Iniciar escaneo**.
7. Revisa el panel **Integridad** al terminar.
8. Verifica manualmente varias cuentas antes de dejar de seguirlas.

## Cómo interpreta la relación

| Valor entregado por Instagram | Resultado |
|---|---|
| `follows_viewer === false` | No te sigue de vuelta |
| `follows_viewer === true` | Seguimiento mutuo |
| Campo ausente o no booleano | Incierto |

Los resultados inciertos nunca se mezclan con “No te siguen”.

## Qué significa “Integridad: revisar”

No significa automáticamente que toda la lista sea incorrecta. Indica que ocurrió al menos una de estas condiciones:

- El contador inicial no coincide con los usuarios únicos.
- Instagram repitió registros entre páginas.
- Se descartó un registro sin ID o nombre de usuario.
- Algún registro no incluyó una relación confiable.
- El contador remoto cambió durante el escaneo.

El botón **Copiar diagnóstico** genera un reporte técnico sin incluir usuarios ni IDs.

## Privacidad y seguridad

- El script solo realiza consultas `GET` a Instagram.
- No solicita tu contraseña.
- No copia cookies ni tokens fuera de la página.
- No incluye trackers ni dependencias ejecutables remotas.
- No ejecuta follow, unfollow, likes o mensajes.
- Los IDs internos y fotos están excluidos de la exportación por defecto.

Consulta [PRIVACY.md](docs/PRIVACY.md) y [SECURITY.md](SECURITY.md).

## Desarrollo

La versión pegable se genera desde módulos auditables:

```text
lib/core.js
lib/instagram-adapter.js
lib/app.js
        ↓ npm run build
src/instagram-no-followback-readonly.js
```

Validación local:

```bash
npm run validate
```

La integración continua confirma que el bundle está actualizado, la sintaxis es válida, las pruebas pasan y no existen solicitudes de modificación de cuenta.

## Limitaciones

- El endpoint no es una API pública ni estable.
- Instagram puede modificar nombres de campos, rutas o límites.
- Una relación puede cambiar después de terminar el escaneo.
- Las cuentas desactivadas, renombradas o pendientes pueden producir diferencias.
- Una extensión puede mostrar errores `ERR_BLOCKED_BY_CLIENT` pertenecientes a Instagram; el escáner informa sus propios errores dentro del panel.

## Proyecto independiente

No está afiliado, autorizado ni respaldado por Instagram o Meta. Consulta [NOTICE.md](NOTICE.md).

## Licencia

[MIT](LICENSE)

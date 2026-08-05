# Instagram No-Follow-Back — Read Only

[![Validate](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml/badge.svg)](https://github.com/Menelthar/instagram-no-followback-readonly/actions/workflows/validate.yml)
[![GitHub Pages](https://img.shields.io/badge/Open%20web%20app-GitHub%20Pages-2ea44f)](https://menelthar.github.io/instagram-no-followback-readonly/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)

**Descubre qué cuentas sigues en Instagram y no te siguen de vuelta.**

La herramienta se ejecuta directamente en tu navegador, dentro de Instagram Web. No solicita tu contraseña, no sube resultados a servidores externos y no deja de seguir a nadie automáticamente.

<p align="center">
  <a href="https://menelthar.github.io/instagram-no-followback-readonly/"><strong>Abrir la página del proyecto</strong></a>
  ·
  <a href="docs/USAGE_ES.md">Guía en español</a>
  ·
  <a href="docs/USAGE_EN.md">English guide</a>
  ·
  <a href="docs/TROUBLESHOOTING_ES.md">Solucionar problemas</a>
</p>

> [!IMPORTANT]
> Este es un proyecto independiente y no oficial. Utiliza información que Instagram entrega a su propia versión web. Instagram puede cambiar esa respuesta, limitar las consultas o mostrar advertencias de actividad automatizada.

## Para quién es

Está pensado para personas que quieren revisar su lista de seguidos sin entregar su contraseña a aplicaciones de terceros y sin permitir que una herramienta haga cambios automáticos en su cuenta.

No necesitas instalar Node.js, extensiones ni programas adicionales para usarlo. Solo necesitas un navegador de escritorio y una sesión iniciada en Instagram Web.

## Qué hace

- Revisa las cuentas que tú sigues.
- Indica cuáles no te siguen de vuelta.
- Separa seguimiento mutuo y resultados inciertos.
- Permite buscar usuarios y abrir sus perfiles.
- Exporta resultados a CSV o JSON.
- Permite pausar, reanudar y detener el escaneo.
- Detecta errores de sesión, bloqueos temporales y respuestas inesperadas.
- Evita reintentos infinitos y ciclos por cursores repetidos.

## Qué no hace

- No solicita tu contraseña.
- No envía cookies, tokens o resultados al autor.
- No realiza `unfollow`.
- No modifica tu cuenta.
- No promete resultados perfectos.
- No evita ni evade los límites de Instagram.

## Uso rápido

1. Abre [Instagram Web](https://www.instagram.com/) e inicia sesión.
2. Abre la [página pública del proyecto](https://menelthar.github.io/instagram-no-followback-readonly/).
3. Pulsa **Copiar script**.
4. Regresa a Instagram y abre la consola:
   - Windows/Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + J`
5. Pega el código completo y presiona `Enter`.
6. Pulsa **Iniciar escaneo**.
7. Revisa manualmente una muestra de los resultados antes de dejar de seguir a alguien.

Consulta la [guía detallada en español](docs/USAGE_ES.md) antes de tu primera ejecución.

## Cómo leer los resultados

| Resultado | Significado |
|---|---|
| **No te sigue** | Instagram devolvió `follows_viewer === false`. |
| **Mutuo** | Instagram devolvió `follows_viewer === true`. |
| **Incierto** | Instagram no entregó un valor booleano confiable. No debe tratarse automáticamente como “no te sigue”. |
| **Todos** | Todas las cuentas procesadas durante el escaneo actual. |

La herramienta no compara archivos exportados. Consulta la relación disponible durante el escaneo de la sesión web.

## Privacidad y seguridad

Las solicitudes de lectura se hacen desde tu navegador hacia `www.instagram.com`. Los resultados permanecen en memoria mientras la interfaz está abierta y solo se escriben en tu equipo cuando eliges copiar o exportar.

El código está sin minimizar para que cualquier persona pueda revisarlo. El workflow de GitHub Actions comprueba que:

- El JavaScript tenga sintaxis válida.
- No exista una solicitud `POST` en el escáner.
- No se cargue JavaScript ejecutable desde servicios remotos.

Más información:

- [Política de privacidad](docs/PRIVACY.md)
- [Política de seguridad](SECURITY.md)
- [Arquitectura técnica](docs/ARCHITECTURE.md)

## Errores comunes

- **No aparece la interfaz:** confirma que estás en `https://www.instagram.com/`.
- **No se encuentra `ds_user_id`:** recarga Instagram e inicia sesión otra vez.
- **HTTP 401 o 403:** tu sesión fue rechazada; detén el proceso y vuelve a iniciar sesión.
- **HTTP 429:** Instagram aplicó un límite temporal; no repitas inmediatamente el escaneo.
- **Estructura no reconocida:** Instagram probablemente cambió su respuesta interna.

Consulta [Solución de problemas](docs/TROUBLESHOOTING_ES.md) y las [Preguntas frecuentes](docs/FAQ_ES.md).

## Estructura del proyecto

```text
.
├── index.html                         # Página pública de GitHub Pages
├── src/
│   └── instagram-no-followback-readonly.js
├── docs/
│   ├── USAGE_ES.md
│   ├── USAGE_EN.md
│   ├── FAQ_ES.md
│   ├── FAQ_EN.md
│   ├── TROUBLESHOOTING_ES.md
│   ├── TROUBLESHOOTING_EN.md
│   ├── PRIVACY.md
│   └── ARCHITECTURE.md
├── SECURITY.md
├── SUPPORT.md
└── LICENSE
```

## Desarrollo

No hay dependencias de ejecución.

```bash
npm run check
```

Comprobación directa:

```bash
node --check src/instagram-no-followback-readonly.js
```

## Contribuciones

Las contribuciones son bienvenidas siempre que mantengan el proyecto:

- De solo lectura.
- Sin seguimiento o unfollow automático.
- Sin recopilación de credenciales.
- Sin telemetría ni trackers.
- Sin código remoto oculto o minimizado.

Lee [CONTRIBUTING.md](CONTRIBUTING.md) y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Créditos

Proyecto inspirado conceptualmente por [`davidarroyo1234/InstagramUnfollowers`](https://github.com/davidarroyo1234/InstagramUnfollowers), pero reescrito con un alcance diferente: solo lectura, manejo defensivo de errores y ausencia total de automatización de unfollow.

## Licencia

Licencia [MIT](LICENSE).

---

## English

**Find Instagram accounts you follow that do not follow you back, without sharing your password or automating unfollows.**

Read the [English usage guide](docs/USAGE_EN.md), [FAQ](docs/FAQ_EN.md), and [troubleshooting guide](docs/TROUBLESHOOTING_EN.md).

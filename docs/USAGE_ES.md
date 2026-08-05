# Guía de uso — versión 1.1.0

## Ejecutar

1. Inicia sesión en `https://www.instagram.com/` desde un navegador de escritorio.
2. Abre la página pública del proyecto.
3. Revisa el código y pulsa **Copiar script**.
4. Abre la consola (`Ctrl + Shift + J` en Windows/Linux; `⌘ + ⌥ + J` en macOS).
5. Pega el script y presiona `Enter`.
6. Pulsa **Iniciar escaneo**.

## Ajustes recomendados

Conserva los valores predeterminados la primera vez. El timeout de 20 segundos evita peticiones colgadas. No reduzcas agresivamente las pausas.

## Al terminar

Revisa el panel de integridad:

- **Completa:** no se detectaron diferencias.
- **Revisar:** hubo duplicados, inválidos, inciertos, cambio de contador o diferencia entre esperado y único.

Ejemplo:

```text
Esperado: 693
Recibidos: 693
Únicos: 692
Duplicados: 1
Inválidos: 0
Diferencia: 1
```

Eso explica la diferencia sin asumir que toda la lista está mal.

## Exportación

Por privacidad, CSV y JSON no incluyen IDs internos ni URLs de foto. Puedes habilitarlos manualmente antes de exportar.

El botón **Copiar diagnóstico** crea un informe seguro para reportar problemas. No incluye nombres de usuario ni IDs.

## Errores de la consola

Mensajes `ERR_BLOCKED_BY_CLIENT` en solicitudes internas de Instagram suelen venir de extensiones de bloqueo. Los errores del escáner aparecen dentro de su propio registro con códigos como:

- `SESSION_REJECTED`
- `RATE_LIMITED`
- `REQUEST_TIMEOUT`
- `UNSUPPORTED_RESPONSE`
- `AMBIGUOUS_RESPONSE`
- `REPEATED_CURSOR`
- `COUNT_MISMATCH`

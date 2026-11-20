# Reproductor "Espacio para respirar" (referencia)

`index.html` es el reproductor diseñado por Hellen. Es **referencia de comportamiento y formato**: el producto lo reimplementa con la identidad del proyecto, manteniendo toda su lógica (fases, tiempos, colores por técnica, campana, voz, conteo, intro, fondos con cruce suave).

## Audios (NO están en git; van al almacenamiento de archivos)

| Archivo | Uso | Duración |
|---|---|---|
| `intros-v5.mp3` | Las 22 explicaciones + cierre en un solo archivo; el reproductor salta a cada tramo (`INTRO`, `CLOSE`) | 8:39 |
| `palabras-v3.mp3` | Palabras sueltas y números; el reproductor usa tramos (`W`) | 1:58 |
| `fondos/*.mp3` (13) | Canciones de fondo (`SONGS`), con cruce suave de 6 s | 1:30 – 7:44 |

Versiones anteriores recibidas y **no usadas**: `intros-v2..v4.mp3`, `palabras-v2.mp3`, `fondo.mp3`.

Decisiones (2026-11-20): no se recortan los audios; se usan los nombres nuevos de las respiraciones; el reproductor va en la misma página web con el mismo formato.

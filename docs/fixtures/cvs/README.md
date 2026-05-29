# CVs de prueba — Red Joven Bolívar

Archivos `.txt` listos para **subir o pegar** en `POST /young/cv` y probar la extracción de habilidades.

## Archivos

| Archivo | Personaje | Habilidades que debería detectar el parser |
|---------|-----------|---------------------------------------------|
| `aaron-hernandez.txt` | Aaron Hernández | Lógica de programación, Bases de datos, Redes y conectividad, Excel avanzado, Inglés técnico, Comunicación, Atención al cliente |
| `cristiano-ronaldo.txt` | Cristiano Ronaldo | Comunicación, Inglés conversacional, Atención al cliente, Educación ambiental |
| `leonel-messi.txt` | Leonel Messi | Inglés conversacional, Inglés técnico, Comunicación, Atención al cliente, Excel avanzado |
| `kim-kardashian.txt` | Kim Kardashian | Comunicación, Atención al cliente, Excel avanzado, Inglés conversacional |

> El backend empareja el texto del CV contra el **catálogo de skills** del seed (`label` o `slug` en minúsculas). Los CVs incluyen los nombres exactos de las habilidades.

## Probar con curl (back en `:3000`)

1. Crea un perfil y copia el `id` del joven, o usa uno del seed.
2. Sube el CV:

```powershell
$cv = Get-Content -Raw "docs\fixtures\cvs\aaron-hernandez.txt"
$body = @{ cvText = $cv; youngId = "TU-YOUNG-UUID-AQUI" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/young/cv" -Method POST -Body $body -ContentType "application/json; charset=utf-8"
```

3. Verifica la ruta de crecimiento en el front: **Oportunidades → Ver mi ruta**.

## Flujo sugerido en la app

1. **Mi perfil** — registrar a Aaron, Cristiano, Leonel o Kim (nombre acorde al CV).
2. Subir el `.txt` correspondiente (cuando la pantalla de CV esté conectada) o pegar el contenido vía API.
3. **Oportunidades → Ver mi ruta** — el score de afinidad debería cambiar según las skills extraídas.
4. **CivicCoins** — actividades sugeridas también usan las habilidades del joven.

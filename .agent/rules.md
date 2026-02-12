# Reglas del Agente para OrbiApp

1. **Consulta Proactiva de Skills**: Antes de proponer cualquier solución técnica, diseño o arquitectura, el asistente DEBE consultar el archivo local `c:\Users\dany_\Documents\Code\OrbiApp\.agent\skills\skill-catalog\SKILL.md`.
2. **Prioridad de Implementación**: Si existe una skill global (ej. `shadcn-ui-expert`, `next-best-practices`) que cubra la tarea actual, el asistente debe leer su `SKILL.md` global y seguir sus patrones en lugar de usar métodos genéricos.
3. **No Preguntar por Skills**: No es necesario que el usuario mencione las skills. El asistente asume que tiene permiso para consultar el catálogo y las habilidades globales en cualquier momento.
4. **Control de Versiones Local**: Después de cada cambio significativo o al completar una tarea, el asistente DEBE realizar un commit en el repositorio Git local con un mensaje descriptivo.
5. **Acceso Local en Red**: Al levantar el servidor de desarrollo (`npm run dev`), el asistente debe usar parámetros que permitan el acceso desde otros dispositivos en la red local (ej. `next dev --hostname 0.0.0.0`).
6. **Idioma Español Obligatorio**: Todas las interacciones con el usuario, comentarios en el código, mensajes de commit, documentación técnica y el contenido de la interfaz de usuario (textos, etiquetas, placeholders) deben realizarse y guardarse exclusivamente en español.

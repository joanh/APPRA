# Sandbox

Web online para diferentes pruebas de código.

## Estructura del proyecto

- `css`: Carpeta con los estilos de CSS necesarios. Actualmente, solo se utiliza el archivo `styles.css`.
- `js`: Carpeta con los scripts de JavaScript necesarios. Hay dos archivos: `script.js` y `constants.js`:
  - `script.js`: Contiene el código principal que se ejecuta en la página.
  - `constants.js`: Contiene las constantes que se utilizan a lo largo del código, para así poder modificarlas de forma centralizada.
- `lib`: Carpeta con las librerías necesarias para el proyecto. Aquí existen una carpeta (de momento):

  - `js`: Contiene librerías externas de JavaScript. Tenemos un solo archivo, `particles.min.js` ([enlace a GitHub](https://github.com/VincentGarreau/particles.js/)), que se encarga de generar el efecto de partículas en la página.

  **Nota**:
  En un futuro, si se añaden más librerías, se crearán carpetas para cada tipo de librería (por ejemplo, `css` si se añaden librerías de estilos).

- `index.html`: Página principal de la web.

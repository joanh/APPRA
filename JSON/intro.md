# Introducción

> Proporcionada por [Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet) :sparkles:

`Para ser mejorado/completado`

# Introducción a JSON

## ¿Qué es JSON?

JSON (*JavaScript Object Notation*) es un formato ligero de intercambio de datos que es fácil de leer y escribir para los humanos, y sencillo de interpretar y generar para las máquinas. A pesar de su nombre y origen en JavaScript, JSON es independiente del lenguaje de programación.

## Estructura Básica

JSON tiene dos estructuras fundamentales:

1. Una colección de pares nombre/valor (objeto)
2. Una lista ordenada de valores (array)

### Tipos de Datos en JSON

- **Strings**: `"Hola mundo"`
- **Números**: `42`, `3.14`, `-1`
- **Booleanos**: `true`, `false`
- **null**
- **Arrays**: `[1, 2, 3]`
- **Objetos**: `{"nombre": "Juan"}`

## Ejemplos Prácticos

### 1. Objeto Simple

```json
{
    "nombre": "María",
    "edad": 25,
    "esEstudiante": true,
    "hobbies": ["lectura", "natación", "música"]
}
```

### 2. Array de Objetos

```json
{
    "estudiantes": [
        {
            "id": 1,
            "nombre": "Juan",
            "notas": [8, 7, 9]
        },
        {
            "id": 2,
            "nombre": "Ana",
            "notas": [9, 9, 10]
        }
    ]
}
```

## Trabajando con JSON en JavaScript

Métodos:

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

### Convertir Objeto a JSON (Serialización)

```javascript
const estudiante = {
    nombre: "Pablo",
    edad: 20,
    asignaturas: ["HTML", "CSS", "JavaScript"]
};

const jsonString = JSON.stringify(estudiante);
console.log(jsonString);
// Resultado: {"nombre":"Pablo","edad":20,"asignaturas":["HTML","CSS","JavaScript"]}
```

### Convertir JSON a Objeto (Deserialización)

```javascript
const jsonString = '{"nombre":"Pablo","edad":20,"asignaturas":["HTML","CSS","JavaScript"]}';
const objeto = JSON.parse(jsonString);
console.log(objeto.nombre); // "Pablo"
console.log(objeto.asignaturas[0]); // "HTML"
```

## Reglas Importantes

1. Las claves **siempre** deben ir entre comillas dobles
2. Los valores pueden ser:
   - Strings (entre comillas dobles)
   - Números
   - Booleanos
   - null
   - Arrays
   - Objetos
3. No se permiten comentarios
4. No se permiten comas finales tras el último elemento
5. No se permiten funciones

## Casos de Uso Comunes

- Configuración de aplicaciones
- APIs REST
- Almacenamiento de datos en localStorage
- Intercambio de datos entre cliente y servidor

## Ejercicio Práctico

```javascript
// 1. Crear un objeto JavaScript
const curso = {
    nombre: "Desarrollo Web",
    profesor: "Ana García",
    estudiantes: [
        {
            nombre: "Carlos",
            edad: 22,
            calificaciones: {
                html: 85,
                css: 90,
                javascript: 88
            }
        },
        {
            nombre: "Laura",
            edad: 24,
            calificaciones: {
                html: 95,
                css: 92,
                javascript: 96
            }
        }
    ]
};

// 2. Convertir a JSON
const cursoJSON = JSON.stringify(curso, null, 2);
console.log(cursoJSON);

// 3. Convertir de vuelta a objeto
const cursoObjeto = JSON.parse(cursoJSON);
```
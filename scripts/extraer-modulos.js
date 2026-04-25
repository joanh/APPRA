#!/usr/bin/env node

/**
 * APPRA · Extracción de currículos FP con Claude Opus 4.7
 * =========================================================
 *
 * Lee los PDFs oficiales del BOCM (Comunidad de Madrid) en .Docs/ y extrae
 * los Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs) de
 * cada módulo profesional, generando los JSONs en JSON/modulos/.
 *
 * El proceso entero corre con Claude Opus 4.7 — el mismo modelo que la app
 * usa después para el chatbot. Esto es central en la propuesta del proyecto
 * para el hackathon "Built with Claude Opus 4.7": Claude estructura los
 * datos curriculares oficiales que después Claude consume para ayudar a
 * profesores, alumnos y familias.
 *
 * Uso:
 *   1. Añade ANTHROPIC_API_KEY a tu .env (o expórtala como variable)
 *   2. npm install
 *   3. npm run extraer-modulos
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Cargador mínimo de .env (sin dependencias externas).
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach((linea) => {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  });
}

// --- Configuración ---------------------------------------------------------

const MODELO = 'claude-opus-4-7';

// Módulos a extraer. Cada entrada apunta a un PDF y especifica qué módulo
// extraer (los BOCMs de DAW y ASIR contienen el currículo de varios módulos).
// Fuente: Reales Decretos estatales del BOE (donde se definen los RAs/CEs).
// Los BOCM autonómicos solo recogen contenidos y duración, y remiten al BOE.
const MODULOS = [
  {
    id: '2daw-dwec',
    pdf: '.Docs/DAW-BOE-RD686-2010.pdf',
    nombre: 'Desarrollo Web en Entorno Cliente',
    abreviatura: 'DWEC',
    curso: '2º DAW',
    ciclo: 'Desarrollo de Aplicaciones Web',
    familia: 'Informática y Comunicaciones',
    grado: 'Superior',
    imagen: 'img/portada.png',
  },
  {
    id: '1daw-ed',
    pdf: '.Docs/DAW-BOE-RD686-2010.pdf',
    nombre: 'Entornos de Desarrollo',
    abreviatura: 'ED',
    curso: '1º DAW',
    ciclo: 'Desarrollo de Aplicaciones Web',
    familia: 'Informática y Comunicaciones',
    grado: 'Superior',
    imagen: 'img/portada2.png',
  },
  {
    id: '2asir-sad',
    pdf: '.Docs/ASIR-BOE-RD1629-2009.pdf',
    nombre: 'Seguridad y Alta Disponibilidad',
    abreviatura: 'SAD',
    curso: '2º ASIR',
    ciclo: 'Administración de Sistemas Informáticos en Red',
    familia: 'Informática y Comunicaciones',
    grado: 'Superior',
    imagen: 'img/portada3.png',
  },
];

// Esquema JSON que Claude debe respetar al responder. Garantiza un output
// parseable y consistente entre los tres módulos.
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['nombre_modulo', 'horas', 'resultadosAprendizaje'],
  properties: {
    nombre_modulo: {
      type: 'string',
      description: 'Nombre exacto del módulo tal como aparece en el BOCM.',
    },
    horas: {
      type: 'integer',
      description: 'Duración total del módulo en horas (anuales).',
    },
    descripcion_breve: {
      type: 'string',
      description: 'Resumen de 1-2 frases del contenido del módulo.',
    },
    resultadosAprendizaje: {
      type: 'array',
      description: 'Resultados de Aprendizaje del módulo, en orden.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['numero', 'descripcion', 'criteriosEvaluacion'],
        properties: {
          numero: { type: 'integer', description: 'Número del RA (1, 2, 3...).' },
          descripcion: {
            type: 'string',
            description: 'Texto literal del RA tal como aparece en el BOCM.',
          },
          criteriosEvaluacion: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['letra', 'descripcion'],
              properties: {
                letra: {
                  type: 'string',
                  description: 'Letra identificativa del CE (a, b, c...).',
                },
                descripcion: {
                  type: 'string',
                  description: 'Texto literal del CE tal como aparece en el BOCM.',
                },
                ffe: {
                  type: 'boolean',
                  description:
                    'true si el documento marca explícitamente este CE como propio de la Formación en Centros de Trabajo (FCT). false en caso contrario o duda.',
                },
              },
            },
          },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `Eres un experto en la normativa de Formación Profesional (FP) española y en los currículos de los ciclos formativos publicados en el BOE y los boletines autonómicos (BOCM, BOJA, etc.).

Tu tarea es extraer LITERALMENTE, sin interpretarlos ni reformularlos, los Resultados de Aprendizaje (RAs) y los Criterios de Evaluación (CEs) de un módulo profesional concreto del documento PDF que se te proporciona.

Reglas estrictas:
- Devuelve los textos EXACTOS del documento, respetando ortografía, signos de puntuación y orden.
- IMPORTANTE: los RAs y CEs deben provenir EXCLUSIVAMENTE del PDF adjunto. No utilices conocimiento previo ni datos memorizados de otros documentos. Si un módulo no aparece en el PDF o no incluye sus RAs/CEs, devuelve la lista vacía.
- NO añadas RAs o CEs que no estén en el documento. NO omitas ninguno.
- NO calcules pesos ni ponderaciones — eso pertenece a la programación didáctica del profesor, no al currículo oficial.
- Si el documento marca explícitamente algún CE como específico de FCT (Formación en Centros de Trabajo) o equivalente, marca ese CE con \`ffe: true\`. En cualquier otro caso, \`ffe: false\`.
- Las "horas" son las horas anuales totales del módulo tal como aparecen en el documento.

El documento PDF puede contener varios módulos del mismo ciclo formativo. Extrae únicamente el módulo que se te indica en el mensaje del usuario.`;

// --- Lógica principal ------------------------------------------------------

function leerPDF(ruta) {
  return fs.readFileSync(ruta).toString('base64');
}

async function extraerModulo(client, mod, pdfBase64) {
  console.log(`\n→ Extrayendo: ${mod.nombre} (${mod.id})`);

  const response = await client.messages.create({
    model: MODELO,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
            // Cacheamos el PDF: la segunda extracción sobre el mismo
            // documento (DAW: DWEC + Entornos de Desarrollo) lee de caché.
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text:
              `Extrae del documento adjunto el módulo profesional titulado ` +
              `"${mod.nombre}" (${mod.curso}, ciclo "${mod.ciclo}").\n\n` +
              `Devuelve los Resultados de Aprendizaje y Criterios de Evaluación ` +
              `literales, según el esquema requerido.`,
          },
        ],
      },
    ],
  });

  const bloqueTexto = response.content.find((b) => b.type === 'text');
  if (!bloqueTexto) {
    throw new Error(`Sin respuesta de texto para ${mod.id}`);
  }
  const datos = JSON.parse(bloqueTexto.text);

  // Post-procesado: añadimos la metadata fija del módulo + pesos por defecto
  // (distribución equitativa, ajustables por el profesor en la app).
  const numRAs = datos.resultadosAprendizaje.length;
  const pesoBaseRA = Math.floor(100 / numRAs);
  const restoRA = 100 - pesoBaseRA * numRAs;

  const moduloFinal = {
    id: mod.id,
    nombre: mod.nombre,
    abreviatura: mod.abreviatura,
    curso: mod.curso,
    ciclo: mod.ciclo,
    familia: mod.familia,
    grado: mod.grado,
    horas: datos.horas,
    descripcionBreve: datos.descripcion_breve || '',
    resultadosAprendizaje: datos.resultadosAprendizaje.map((ra, i) => {
      const numCEs = ra.criteriosEvaluacion.length;
      const pesoBaseCE = Math.floor(100 / numCEs);
      const restoCE = 100 - pesoBaseCE * numCEs;
      return {
        id: `ra${ra.numero}`,
        numero: ra.numero,
        peso: pesoBaseRA + (i === 0 ? restoRA : 0),
        descripcion: ra.descripcion,
        criteriosEvaluacion: ra.criteriosEvaluacion.map((ce, j) => ({
          id: `${ra.numero}${ce.letra.toLowerCase()}`,
          descripcion: ce.descripcion,
          peso: pesoBaseCE + (j === 0 ? restoCE : 0),
          ffe: ce.ffe ?? false,
        })),
      };
    }),
  };

  const rutaSalida = path.join('JSON', 'modulos', `${mod.id}.json`);
  fs.writeFileSync(rutaSalida, JSON.stringify(moduloFinal, null, 2), 'utf8');

  const totalCEs = moduloFinal.resultadosAprendizaje.reduce(
    (acc, ra) => acc + ra.criteriosEvaluacion.length,
    0,
  );
  console.log(`  ✓ ${numRAs} RAs y ${totalCEs} CEs → ${rutaSalida}`);
  console.log(
    `  Tokens: input=${response.usage.input_tokens}, ` +
      `cache_creación=${response.usage.cache_creation_input_tokens || 0}, ` +
      `cache_lectura=${response.usage.cache_read_input_tokens || 0}, ` +
      `output=${response.usage.output_tokens}`,
  );

  return moduloFinal;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Falta ANTHROPIC_API_KEY en el entorno o en .env');
    process.exit(1);
  }

  const client = new Anthropic();

  console.log(`APPRA · Extracción de módulos FP`);
  console.log(`Modelo: ${MODELO}`);
  console.log(`Módulos a procesar: ${MODULOS.length}`);

  const pdfsCargados = {};
  for (const mod of MODULOS) {
    if (!pdfsCargados[mod.pdf]) {
      console.log(`\nCargando PDF: ${mod.pdf}`);
      pdfsCargados[mod.pdf] = leerPDF(mod.pdf);
    }
    await extraerModulo(client, mod, pdfsCargados[mod.pdf]);
  }

  // Índice ligero para el selector de módulos del frontend.
  const indice = MODULOS.map(({ id, nombre, abreviatura, curso, ciclo, imagen }) => ({
    id,
    nombre,
    abreviatura,
    curso,
    ciclo,
    imagen,
  }));
  const rutaIndice = path.join('JSON', 'modulos', 'modulos.json');
  fs.writeFileSync(rutaIndice, JSON.stringify(indice, null, 2), 'utf8');
  console.log(`\n✓ Índice generado: ${rutaIndice}`);
  console.log(`\n✅ Extracción completada (${MODULOS.length} módulos).`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  if (err.status) console.error(`   HTTP ${err.status}`);
  process.exit(1);
});

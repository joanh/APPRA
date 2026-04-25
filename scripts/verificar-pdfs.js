#!/usr/bin/env node

/**
 * Verifica, para cada PDF de .Docs/, qué módulos profesionales contienen
 * RAs/CEs completos y cuáles únicamente recogen contenidos remitiendo al
 * Real Decreto estatal. Uso puntual para decidir qué módulos extraer.
 */

const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach((linea) => {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

const PDFS = [
  { ruta: '.Docs/DAW-BOCM-D20110001.pdf', ciclo: 'DAW' },
  { ruta: '.Docs/ASIR-BOCM-D20100012.pdf', ciclo: 'ASIR' },
];

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ciclo', 'modulos'],
  properties: {
    ciclo: { type: 'string' },
    modulos: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['nombre', 'codigo', 'curso', 'horas', 'tieneRAsCEs', 'remiteA'],
        properties: {
          nombre: { type: 'string' },
          codigo: { type: 'string', description: 'Código oficial del módulo (p.ej. 0612).' },
          curso: { type: 'string', description: '1º o 2º' },
          horas: { type: 'integer' },
          tieneRAsCEs: {
            type: 'boolean',
            description: 'true si el documento incluye RAs y CEs literales para este módulo. false si sólo recoge contenidos/horas y remite al BOE/RD estatal.',
          },
          remiteA: {
            type: 'string',
            description: 'Si tieneRAsCEs es false, indica a qué Real Decreto remite (vacío si tieneRAsCEs es true).',
          },
        },
      },
    },
  },
};

async function main() {
  const client = new Anthropic();

  for (const { ruta, ciclo } of PDFS) {
    console.log(`\n=== ${ciclo} (${ruta}) ===`);
    const pdfBase64 = fs.readFileSync(ruta).toString('base64');

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      output_config: {
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: 'Eres un experto en normativa de FP. Analiza el PDF y enumera todos los módulos profesionales del ciclo, indicando para cada uno si el documento incluye sus RAs/CEs literales o si únicamente recoge contenidos y remite a la normativa estatal.',
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: `Lista todos los módulos profesionales del ciclo ${ciclo} que aparecen en este documento, indicando para cada uno si trae RAs/CEs completos o sólo contenidos.` },
        ],
      }],
    });

    const bloque = response.content.find((b) => b.type === 'text');
    const datos = JSON.parse(bloque.text);
    console.table(datos.modulos.map((m) => ({
      codigo: m.codigo, nombre: m.nombre, curso: m.curso, horas: m.horas,
      RAsCEs: m.tieneRAsCEs ? 'SI' : 'NO', remiteA: m.remiteA || '',
    })));
    console.log(`Tokens: input=${response.usage.input_tokens}, cache_lectura=${response.usage.cache_read_input_tokens || 0}, cache_creación=${response.usage.cache_creation_input_tokens || 0}, output=${response.usage.output_tokens}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });

// Chatbot multi-rol con Claude Opus 4.7. Recibe rol (profesor/alumno/familia),
// datos del módulo activo y el historial de conversación. Devuelve la respuesta
// streaming via Server-Sent Events.
//
// Diseño:
// - Modelo: claude-opus-4-7 (requisito del hackathon "Built with Opus 4.7")
// - Streaming: ReadableStream + SSE para que el cliente pinte palabra a palabra
// - Caching: cache_control: ephemeral sobre el bloque del system con el módulo,
//   así la 2ª pregunta del usuario en la misma conversación lee de caché
// - El token de la API vive en Netlify env var ANTHROPIC_API_KEY, jamás expuesta
//   al cliente

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 4096;

const ROLES = {
  profesor: `Eres un asistente para PROFESORADO de Formación Profesional española en módulos de la familia de Informática y Comunicaciones.

Tono: profesional y técnico. Asume que la persona conoce la jerga pedagógica (LOMLOE, programación didáctica, evaluación criterial, ABP, FCT/FFE, rúbricas...).

Tu rol: ayudar al docente a programar el módulo, secuenciar contenidos, diseñar actividades y rúbricas, ponderar criterios y evaluar.`,

  alumno: `Eres un asistente para ALUMNADO de Formación Profesional, ayudándoles a entender los Resultados de Aprendizaje y Criterios de Evaluación de su módulo.

Tono: cercano, claro, motivador. Trata de tú al alumno. Evita la jerga académica innecesaria; cuando uses términos técnicos del módulo, explícalos brevemente con un ejemplo.

Tu rol: aclarar qué se va a aprender, por qué importa, qué se va a evaluar y cómo. Sugerir estrategias de estudio. NO resolver ejercicios concretos por ellos: guía el aprendizaje, no lo sustituye.`,

  familia: `Eres un asistente para FAMILIAS (madres, padres y tutores legales) de alumnado de Formación Profesional. Les ayudas a entender qué estudia su hijo o hija en el módulo y cómo se le evalúa.

Tono: claro y divulgativo, sin jerga técnica. Si tienes que mencionar un término del sector (DOM, AJAX, criptografía, IDE...), explícalo en una frase con un ejemplo cotidiano.

Tu rol: traducir el currículo oficial a un lenguaje accesible. NO prometas notas ni resultados concretos; describe expectativas realistas.`,
};

const REGLAS_COMUNES = `Reglas que debes seguir SIEMPRE:
- Responde en español neutro.
- Usa SOLO la información del módulo que se te da más abajo. No inventes RAs ni CEs que no estén en los datos.
- Cuando un Criterio de Evaluación sea relevante para responder, cítalo por su id (ej: "CE 1.a") y, si aporta, parafraseando o citando su texto literal.
- Si la pregunta no es sobre este módulo, redirige amablemente recordando cuál es tu ámbito.
- Sé conciso: respuestas claras de 2-6 párrafos, salvo que se pida más detalle.
- Marcado en Markdown ligero (negritas, listas) cuando ayude a leer; sin tablas pesadas.`;

function formatearModulo(m) {
  const ras = m.resultadosAprendizaje.map((ra) => {
    const ces = ra.criteriosEvaluacion
      .map((ce) => `  - CE ${ce.id}: ${ce.descripcion}${ce.ffe ? ' [FCT]' : ''}`)
      .join('\n');
    return `## RA${ra.numero} — ${ra.descripcion}\n${ces}`;
  }).join('\n\n');

  return `# Datos canónicos del módulo
Nombre: ${m.nombre} (${m.abreviatura})
Curso: ${m.curso} · Ciclo: ${m.ciclo} · Familia: ${m.familia}
Horas (BOE): ${m.horas}
${m.descripcionBreve ? `Descripción: ${m.descripcionBreve}` : ''}

# Resultados de Aprendizaje y Criterios de Evaluación
(Texto literal del Real Decreto del BOE — fuente oficial)

${ras}`;
}

function construirSystem(role, moduleData) {
  return [
    { type: 'text', text: `${ROLES[role]}\n\n${REGLAS_COMUNES}` },
    {
      type: 'text',
      text: formatearModulo(moduleData),
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'Servidor mal configurado: falta ANTHROPIC_API_KEY' }, 500);
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Cuerpo de la petición no es JSON válido' }, 400);
  }

  const { role, moduleData, messages } = payload;
  if (!role || !ROLES[role]) return jsonResponse({ error: 'Rol no válido' }, 400);
  if (!moduleData?.id || !Array.isArray(moduleData.resultadosAprendizaje)) {
    return jsonResponse({ error: 'Datos del módulo no válidos' }, 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'No hay mensajes' }, 400);
  }
  if (messages[messages.length - 1].role !== 'user') {
    return jsonResponse({ error: 'El último mensaje debe ser del usuario' }, 400);
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const claudeStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: construirSystem(role, moduleData),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of claudeStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'delta', text: event.delta.text });
          }
        }

        const finalMessage = await claudeStream.finalMessage();
        send({
          type: 'done',
          usage: {
            input: finalMessage.usage.input_tokens,
            output: finalMessage.usage.output_tokens,
            cache_read: finalMessage.usage.cache_read_input_tokens || 0,
            cache_creation: finalMessage.usage.cache_creation_input_tokens || 0,
          },
        });
      } catch (err) {
        console.error('Error en chatbot:', err);
        send({ type: 'error', message: err.message || 'Error desconocido en el servidor' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ROOT = path.join(__dirname, "public");

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

async function askGemini(scenario) {
  if (!API_KEY) throw new Error("Falta GEMINI_API_KEY en las variables de entorno.");
  const prompt = `Eres el Tutor Pedagógico IA de Neuroedulab, un ecosistema educativo digital para formación docente.
Analiza la situación educativa siguiente y responde en español con orientación pedagógica clara, responsable y aplicable.

Situación:
${scenario}

Estructura obligatoria:
1. Comprender antes de intervenir
- 3 preguntas socráticas sobre la situación.
2. Fortalezas y barreras posibles
- Distingue datos observables de hipótesis. No diagnostiques.
3. Opciones DUA
- Representación
- Participación
- Acción y expresión
4. Propuesta de intervención
- Objetivo observable
- Estrategia concreta
- Progresión o ajuste
5. Evaluación formativa
- Evidencia a observar
- Indicador de avance
- Qué ajustar si no funciona
6. Cierre reflexivo
- Una pregunta para que el docente justifique su decisión.

Mantén un tono académico, práctico e inclusivo. No inventes evidencia científica ni afirmes diagnósticos. Señala cuándo sería necesario recabar más información.`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY
    },
    body: JSON.stringify({
      model: MODEL,
      input: prompt,
      store: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const detail = data?.error?.message || "La API de Gemini devolvió un error.";
    throw new Error(detail);
  }

  if (typeof data.output_text === "string") return data.output_text;

  // Fallback por si la respuesta de la API cambia de estructura.
  const texts = [];
  for (const step of (data.steps || [])) {
    for (const block of (step.content || [])) {
      if (block.type === "text" && block.text) texts.push(block.text);
    }
  }
  if (texts.length) return texts.join("\n\n");

  throw new Error("Gemini respondió, pero no se encontró texto en la respuesta.");
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/gemini") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const scenario = String(parsed.scenario || "").trim();
          if (!scenario) return send(res, 400, "application/json; charset=utf-8", JSON.stringify({error:"Escribe una situación educativa."}));
          if (scenario.length > 6000) return send(res, 400, "application/json; charset=utf-8", JSON.stringify({error:"La situación es demasiado extensa. Usa hasta 6000 caracteres."}));
          const text = await askGemini(scenario);
          send(res, 200, "application/json; charset=utf-8", JSON.stringify({text}));
        } catch (err) {
          send(res, 500, "application/json; charset=utf-8", JSON.stringify({error: err.message}));
        }
      });
      return;
    }

    if (req.method !== "GET") return send(res, 405, "text/plain; charset=utf-8", "Método no permitido.");

    let requested = decodeURIComponent(req.url.split("?")[0]);
    if (requested === "/") requested = "/index.html";
    const filePath = path.normalize(path.join(ROOT, requested));
    if (!filePath.startsWith(ROOT)) return send(res, 403, "text/plain; charset=utf-8", "Acceso denegado.");

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return send(res, 404, "text/plain; charset=utf-8", "No encontrado.");
    }

    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html":"text/html; charset=utf-8",
      ".css":"text/css; charset=utf-8",
      ".js":"text/javascript; charset=utf-8",
      ".json":"application/json; charset=utf-8"
    };
    send(res, 200, types[ext] || "application/octet-stream", fs.readFileSync(filePath));
  } catch (err) {
    send(res, 500, "text/plain; charset=utf-8", "Error interno.");
  }
});

server.listen(PORT, () => {
  console.log(`Neuroedulab disponible en http://localhost:${PORT}`);
  console.log(`Modelo Gemini: ${MODEL}`);
});

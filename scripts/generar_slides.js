// Diapositivas del proyecto en estilo "Swiss International" (pptx-design-styles #07).
// Uso, desde la raíz del repo y con las figuras ya generadas por el notebook:
//   node scripts/generar_slides.js        -> slides/presentacion.pptx
// El PDF se exporta desde PowerPoint (ver README).
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = path.resolve(__dirname, "..");
const FIG = (f) => path.join(RAIZ, "figuras", f);
const FORM = (f) => path.join(RAIZ, "slides", "formulas", f + ".png"); // generadas por scripts/formulas.py

// Paleta del estilo Swiss International
const ROJO = "E8000D", NEGRO = "111111", GRIS = "444444", LINEA = "DDDDDD", BLANCO = "FFFFFF", GRIS_CLARO = "9A9A9A";
const TITULO = "Arial", MONO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.title = "Todo modelo es un voto ponderado";
pres.author = "Grupo Bikeshare · UNIS";
pres.theme = { headFontFace: TITULO, bodyFontFace: TITULO };

const W = 13.333, X0 = 0.7, ANCHO = 11.93;

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: BLANCO },
  objects: [
    { rect: { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ROJO }, line: { color: ROJO } } },
    { line: { x: X0, y: 1.42, w: ANCHO, h: 0, line: { color: LINEA, width: 1 } } },
    { text: { text: "TODO MODELO ES UN VOTO PONDERADO · BIKESHARE D.C. · UNIS 2026",
              options: { x: X0, y: 6.85, w: 9, h: 0.3, fontFace: MONO, fontSize: 9, color: GRIS_CLARO, charSpacing: 3, margin: 0 } } },
    { placeholder: { options: { name: "kicker", type: "body", x: X0, y: 0.32, w: ANCHO, h: 0.3, fontFace: MONO,
                                fontSize: 10, color: ROJO, charSpacing: 4, bold: true, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.62, w: ANCHO, h: 0.72, fontFace: TITULO,
                                fontSize: 30, bold: true, color: NEGRO, margin: 0, valign: "middle", align: "left" }, text: "" } },
  ],
  slideNumber: { x: 12.33, y: 6.85, w: 0.52, h: 0.26, fontFace: TITULO, fontSize: 10, color: ROJO, bold: true, align: "center" },
});

pres.defineSlideMaster({
  title: "PORTADA",
  background: { color: BLANCO },
  objects: [
    { rect: { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ROJO }, line: { color: ROJO } } },
    { line: { x: X0, y: 4.35, w: ANCHO, h: 0, line: { color: LINEA, width: 1 } } },
  ],
});

// ---------------------------------------------------------------- utilidades
let n = 0;
function nueva(kicker, titulo, notas) {
  const s = pres.addSlide({ masterName: "CONTENIDO" });
  n += 1;
  circulo(s, 12.33, 6.72, 0.52, 1.5);
  s.addText(kicker.toUpperCase(), { placeholder: "kicker" });
  s.addText(titulo, { placeholder: "title" });
  if (notas) s.addNotes(notas);
  return s;
}

// círculo rojo de contorno en la zona inferior derecha (elemento distintivo del estilo)
function circulo(s, x, y, d, grosor) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: BLANCO, transparency: 100 }, line: { color: ROJO, width: grosor } });
}

function etiqueta(s, texto, x, y, w, color = GRIS) {
  s.addText(texto.toUpperCase(), { x, y, w, h: 0.28, fontFace: MONO, fontSize: 9.5, color, charSpacing: 3, bold: true,
                                    margin: 0, isTextBox: true });
}

function cuerpo(s, items, x, y, w, h, opts = {}) {
  const runs = items.map((t, i) => {
    const partes = Array.isArray(t) ? t : [{ text: t }];
    return partes.map((p, j) => ({
      text: p.text,
      options: { bold: !!p.bold, color: p.color || NEGRO, italic: !!p.italic,
                 breakLine: j === partes.length - 1 && i < items.length - 1,
                 bullet: j === 0 && opts.bullet !== false ? { indent: 14 } : undefined,
                 paraSpaceAfter: 7 },
    }));
  }).flat();
  s.addText(runs, { x, y, w, h, fontFace: TITULO, fontSize: opts.fontSize || 15, color: NEGRO, valign: "top",
                    margin: 0, isTextBox: true });
}

function cifra(s, valor, texto, x, y, w, color = NEGRO) {
  s.addText(valor, { x, y, w, h: 0.9, fontFace: TITULO, fontSize: 44, bold: true, color, margin: 0, isTextBox: true });
  s.addText(texto, { x, y: y + 0.92, w, h: 0.75, fontFace: TITULO, fontSize: 12.5, color: GRIS, margin: 0, valign: "top",
                     isTextBox: true });
}

function tabla(s, filas, x, y, w, colW, opts = {}) {
  const fs = opts.fontSize || 13;
  const datos = filas.map((fila, i) => fila.map((c) => {
    const base = typeof c === "object" ? c : { text: String(c) };
    return { text: base.text, options: {
      bold: i === 0 || !!base.bold, color: i === 0 ? GRIS : (base.color || NEGRO), fontFace: i === 0 ? MONO : TITULO,
      fontSize: i === 0 ? 9.5 : fs, charSpacing: i === 0 ? 2 : 0,
      border: [{ type: "none" }, { type: "none" }, { pt: i === 0 ? 1.2 : 0.6, color: i === 0 ? NEGRO : LINEA }, { type: "none" }],
      margin: [4, 6, 4, 0], valign: "middle" } };
  }));
  s.addTable(datos, { x, y, w, colW, rowH: opts.rowH || 0.36 });
}

function regla(s, x, y, w) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: LINEA, width: 1 } });
}

const EJE = { catAxisLabelColor: GRIS, valAxisLabelColor: GRIS, catAxisLabelFontFace: TITULO, valAxisLabelFontFace: TITULO,
              catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, valGridLine: { color: "EEEEEE", size: 0.75 },
              catGridLine: { style: "none" }, dataLabelFontFace: TITULO, dataLabelFontSize: 11, dataLabelColor: NEGRO,
              titleFontFace: TITULO, titleFontSize: 12, titleColor: GRIS, valAxisLineShow: false };

function barras(s, etiquetas, valores, x, y, w, h, titulo, colores, fmt = "0.00", extra = {}) {
  s.addChart(pres.charts.BAR, [{ name: titulo, labels: etiquetas, values: valores }], {
    x, y, w, h, barDir: "col", barGapWidthPct: 55, chartColors: colores, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFormatCode: fmt, valAxisLabelFormatCode: fmt, showLegend: false, showTitle: true, title: titulo, ...EJE, ...extra,
  });
}

// tamaño natural (pulgadas) de una fórmula renderizada a 200 dpi con fuente de 26 pt
function tamFormula(nombre, escala, wMax) {
  const buf = fs.readFileSync(FORM(nombre));
  let w = (buf.readUInt32BE(16) / 200) * escala, h = (buf.readUInt32BE(20) / 200) * escala;
  if (w > wMax) { h *= wMax / w; w = wMax; }
  return { w, h };
}

// fórmula a ~19 pt (escala 0.75), encogida si no cabe en wMax
function formula(s, nombre, x, y, wMax, escala = 0.75) {
  const { w, h } = tamFormula(nombre, escala, wMax);
  s.addImage({ path: FORM(nombre), x, y, w, h, altText: nombre });
  return y + h;
}

// lámina de derivación: pasos numerados, cada uno con su etiqueta y su fórmula; todo se escala para caber
function derivacion(kicker, titulo, pasos, notas, cierre) {
  const s = nueva(kicker, titulo, notas);
  const Y0 = 1.65, YMAX = cierre ? 6.05 : 6.55, ETQ = 0.34, HUECO = 0.24, wF = ANCHO - 0.65;
  const fijo = pasos.length * (ETQ + HUECO);
  const natural = pasos.reduce((t, p) => t + tamFormula(p[2], 0.75, wF).h, 0);
  const escala = Math.max(0.45, Math.min(0.75, 0.75 * (YMAX - Y0 - fijo) / natural));
  let y = Y0;
  pasos.forEach(([num, texto, nombre], i) => {
    s.addText(num, { x: X0, y, w: 0.6, h: 0.3, fontFace: MONO, fontSize: 13, bold: true, color: ROJO, margin: 0, isTextBox: true });
    s.addText(texto, { x: X0 + 0.65, y: y + 0.01, w: wF, h: 0.28, fontFace: TITULO, fontSize: 12.5, color: GRIS,
                       margin: 0, isTextBox: true });
    y = formula(s, nombre, X0 + 0.65, y + ETQ, wF, escala) + HUECO;
    if (i < pasos.length - 1) regla(s, X0 + 0.65, y - HUECO / 2, wF);
  });
  if (cierre) {
    s.addText(cierre, { x: X0, y: Math.min(y, 6.15), w: ANCHO, h: 0.45, fontFace: TITULO, fontSize: 13.5, bold: true,
                        color: NEGRO, margin: 0, isTextBox: true });
  }
  return s;
}

// ---------------------------------------------------------------- 1 portada
{
  const s = pres.addSlide({ masterName: "PORTADA" });
  n += 1;
  circulo(s, 10.9, 4.9, 1.7, 2.5);
  s.addText("ANÁLISIS Y CIENCIA DE DATOS · PROYECTO FINAL", { x: X0, y: 1.0, w: 10, h: 0.3, fontFace: MONO, fontSize: 11,
    color: ROJO, charSpacing: 4, bold: true, margin: 0, isTextBox: true });
  s.addText("Todo modelo es un voto ponderado", { x: X0, y: 1.45, w: 11.5, h: 1.9, fontFace: TITULO, fontSize: 54,
    bold: true, color: NEGRO, margin: 0, valign: "top", isTextBox: true });
  s.addText("Pesos, evidencia y geometría de cinco modelos sobre la demanda de bicicletas de Washington D.C. (2011)",
    { x: X0, y: 3.3, w: 10.5, h: 0.8, fontFace: TITULO, fontSize: 18, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  s.addText([{ text: "Rodolfo Flores · Nohel Estrada · Humberto Najar", options: { bold: true, color: NEGRO, breakLine: true } },
             { text: "Facultad de Ingeniería, Universidad del Istmo de Guatemala", options: { color: GRIS, breakLine: true } },
             { text: "6 de noviembre de 2026", options: { color: GRIS } }],
    { x: X0, y: 4.65, w: 9, h: 1.2, fontFace: TITULO, fontSize: 15, margin: 0, valign: "top", isTextBox: true });
  s.addText("ŷ = Σ wᵢ yᵢ", { x: 10.9, y: 5.38, w: 1.7, h: 0.74, fontFace: TITULO, fontSize: 17, bold: true, color: ROJO,
    align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addNotes("Presentación del equipo y de la idea central: casi todos los modelos del curso predicen como un promedio ponderado de etiquetas de entrenamiento.");
}

// ---------------------------------------------------------------- 2 la idea
{
  const s = nueva("Introducción", "Una predicción es un voto de las filas de entrenamiento",
    "La ecuación es el hilo de todo el proyecto. Lo que cambia entre modelos son los pesos: quién vota, cuánto vale cada voto y si hay votos negativos. Esa noción de parecido es el kernel.");
  s.addText("ŷ(x) = Σᵢ wᵢ(x) · yᵢ", { x: X0, y: 1.75, w: ANCHO, h: 1.1, fontFace: TITULO, fontSize: 46, bold: true,
    color: NEGRO, margin: 0, isTextBox: true });
  const cols = [
    ["01", "¿Quién vota?", "Todas las filas (OLS, ridge), k vecinos, una hoja del árbol o la unión de hojas del bosque."],
    ["02", "¿Cuánto vale cada voto?", "1/k, 1/|hoja|, o un peso que depende de la geometría de X. El parecido entre filas es el kernel."],
    ["03", "¿Hay votos en contra?", "OLS y ridge dan pesos negativos; k-NN, árbol y bosque son promedios convexos (w ≥ 0, Σw = 1)."],
  ];
  cols.forEach(([num, t, d], i) => {
    const x = X0 + i * 4.05;
    s.addText(num, { x, y: 3.25, w: 1, h: 0.45, fontFace: MONO, fontSize: 16, bold: true, color: ROJO, margin: 0, isTextBox: true });
    regla(s, x, 3.75, 3.7);
    s.addText(t, { x, y: 3.9, w: 3.7, h: 0.45, fontFace: TITULO, fontSize: 18, bold: true, color: NEGRO, margin: 0, isTextBox: true });
    s.addText(d, { x, y: 4.4, w: 3.7, h: 1.4, fontFace: TITULO, fontSize: 14, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  });
  etiqueta(s, "Plan: pesos → evidencia → costo de la flexibilidad → escala → veredicto", X0, 6.15, ANCHO);
}

// ---------------------------------------------------------------- 3 datos
{
  const s = nueva("Preparación", "Dos conjuntos de datos, una sola receta de preparación",
    "0.1: 80/20 con random_state=0, StandardScaler solo con entrenamiento. 0.3: casual y registered suman exactamente bikers, son la respuesta partida. 0.4: guardamos las desviaciones crudas para la Parte 4.");
  etiqueta(s, "Parte 1 · California Housing", X0, 1.7, 5.6);
  cuerpo(s, ["20 640 distritos censales de 1990, 8 variables", "y = valor mediano de la vivienda (cientos de miles de USD)",
             "16 512 entrenamiento · 4 128 prueba"], X0, 2.05, 5.6, 1.5);
  etiqueta(s, "Partes 2–5 · Bikeshare D.C.", 6.9, 1.7, 5.7);
  cuerpo(s, ["8 645 horas de 2011; y = log(1 + bikers)", "day, hr, weekday, workingday, holiday, temp, hum, windspeed, mes 1–12, weathersit 1–4",
             "6 916 entrenamiento · 1 729 prueba"], 6.9, 2.05, 5.7, 1.6);
  regla(s, X0, 3.85, ANCHO);
  cifra(s, "100 %", "de las filas cumplen casual + registered = bikers: usarlas sería usar la respuesta (fuga).", X0, 4.1, 3.6, ROJO);
  cifra(s, "105", "desviación cruda de day; hr ≈ 6.9, mes ≈ 3.4, windspeed ≈ 0.12. La usamos en la Parte 4.", X0 + 4.1, 4.1, 3.6);
  cifra(s, "80 / 20", "partición con random_state = 0; el escalador se ajusta solo con entrenamiento.", X0 + 8.2, 4.1, 3.7);
}

// ---------------------------------------------------------------- 1.1 derivación OLS
derivacion("Parte 1.1 · Derivación", "OLS: del estimador al voto",
  [["01", "Mínimos cuadrados con la matriz de diseño X̃ = [1, X]", "ols1"],
   ["02", "La predicción es lineal en y: lo que multiplica a y es el vector de pesos", "ols2"],
   ["03", "La columna de unos es la primera columna de X̃ (1 = X̃e₁), así que los pesos suman 1", "ols3"],
   ["04", "Equivalente: H proyecta sobre el espacio columna de X̃ y el vector de unos ya vive ahí", "ols4"]],
  "Pizarrón: escribir β̂, sustituir en ŷ(x) = x̃ᵀβ̂ y reconocer w(x). Para la suma: 1 = X̃e₁ porque la primera columna de X̃ son unos; entonces X̃ᵀX̃ e₁ se cancela con su inversa y queda x̃ᵀe₁, que es la primera entrada de x̃, es decir 1. Con x = x_i esto es H·1 = 1.",
  "Los pesos de OLS suman 1 para cualquier x, pero pueden ser negativos: no es un promedio convexo.");

// ---------------------------------------------------------------- 1.2 derivación ridge
derivacion("Parte 1.2 · Derivación", "Ridge: el intercepto no se penaliza",
  [["01", "Problema que resuelve Ridge de scikit-learn (λ no toca a β₀)", "ridge1"],
   ["02", "Derivar respecto a β₀ despeja el intercepto; queda un ridge sobre los datos centrados", "ridge2"],
   ["03", "Sustituir en ŷ(x) = β̂₀ + xᵀβ̂ y leer los pesos", "ridge3"],
   ["04", "Suma de pesos: el segundo término se anula porque las columnas centradas suman cero", "ridge4"],
   ["05", "Lo “obvio” (penalizar también la columna de unos) no cuadra con .predict()", "ridge5"]],
  "Pizarrón: derivar respecto a β₀ da n·β₀ = Σ(y_i − x_iᵀβ), o sea β̂₀ = ȳ − x̄ᵀβ̂. Sustituyendo queda ‖y_c − X_cβ‖² + λ‖β‖², cuya solución es la de ridge con X_c. Como X_cᵀ1 = 0, X_cᵀ(y − ȳ1) = X_cᵀy. La suma de pesos es 1 por el término 1/n. Si se penaliza la columna de unos, con X estandarizada el intercepto vale nȳ/(n+λ) y los pesos suman n/(n+λ).",
  null);

// ---------------------------------------------------------------- 1.3-1.6 fórmulas k-NN, árbol, bosque
derivacion("Parte 1.3 – 1.4 · Fórmulas", "k-NN, árbol y bosque: promedios locales",
  [["01", "k-NN (k = 30): 1/k a cada uno de los k vecinos (.kneighbors())", "knn"],
   ["02", "Árbol (profundidad 6): 1/|hoja| a quien cae en la misma hoja (.apply())", "arbol"],
   ["03", "Bosque sin bootstrap: cada árbol promedia su hoja y el bosque promedia los T árboles", "bosque"]],
  "Bosque: ŷ_t(x) es el promedio de la hoja de x en el árbol t, o sea Σ_i 1{x_i∈L_t(x)} y_i / |L_t(x)|; el bosque promedia ŷ_t sobre t y se intercambian las sumas. Los tres son pesos no negativos que suman 1: promedios locales.",
  "Los tres pesos son ≥ 0 y suman 1: un promedio convexo de las y de entrenamiento.");

derivacion("Parte 1.4 – 1.6 · Fórmulas", "Bosque con bootstrap y proximidad",
  [["04", "Con bootstrap cada hoja promedia su muestra: la fila i cuenta cᵢₜ veces (las veces que entró al árbol t)", "bosque_boot"],
   ["05", "Proximidad: cuenta coincidencias sin dividir entre el tamaño de la hoja; su suma es el tamaño medio de la hoja", "prox"]],
  "Con bootstrap=True la fórmula sin c_it falla hasta por 0.044; con c_it cuadra a 1e-15. La proximidad de la fila 7 suma 6.495, el tamaño medio de su hoja: le falta dividir entre |L_t(x)| dentro de cada árbol para ser un peso.",
  "Fila 7: Σ prox = 6.495 = tamaño medio de la hoja; normalizarla al final no basta (difiere hasta 0.0026).");

// ---------------------------------------------------------------- 4 pesos
{
  const s = nueva("Parte 1 · California", "Los pesos de cinco modelos, en una tabla",
    "OLS: la suma da 1 porque H·1 = 1 (el vector de unos está en el espacio columna). Ridge: el intercepto libre deja 1/n por fila y X_c^T 1 = 0. Penalizar la columna de unos no cuadra con predict y los pesos suman n/(n+λ).");
  tabla(s, [
    ["Modelo", "Peso wᵢ(x)", "¿Por qué suman 1?"],
    ["OLS", "x̃ᵀ (X̃ᵀX̃)⁻¹ X̃ᵀ", "H·1 = 1: el vector de unos está en el espacio columna"],
    ["Ridge (λ = 100)", "1/n + (x − x̄)ᵀ (XcᵀXc + λI)⁻¹ Xcᵀ", "Xcᵀ1 = 0; el intercepto no se penaliza"],
    ["k-NN (k = 30)", "1/k si xᵢ es vecino de x", "k vecinos × 1/k"],
    ["Árbol (prof. 6)", "1{misma hoja} / |hoja|", "promedio de la hoja"],
    ["Bosque (200 árboles)", "(1/T) Σₜ 1{misma hoja en t} / |hojaₜ|", "promedio de promedios"],
  ], X0, 1.7, ANCHO, [2.6, 4.9, 4.43], { fontSize: 14, rowH: 0.48 });
  regla(s, X0, 5.0, ANCHO);
  etiqueta(s, "Ridge “obvio”: penalizar también la columna de unos", X0, 5.2, 7);
  cuerpo(s, [[{ text: "No cuadra con .predict() (diferencia de hasta 0.012) y los pesos suman " },
              { text: "n/(n+λ) = 0.994", bold: true }, { text: ": el intercepto se encoge hacia 0." }]],
    X0, 5.55, ANCHO, 0.8, { bullet: false });
}

// ---------------------------------------------------------------- 5 verificación
{
  const s = nueva("Parte 1 · Verificación", "Los cinco votos reproducen .predict() a 10⁻¹⁴",
    "verificar(w, y_train, pred) hace assert de |Σ w_i y_i − pred| < 1e-8. Pasa en las 20 primeras filas de prueba para los cinco modelos. En la fila 7 se ve la diferencia de soporte: OLS y ridge usan todas las filas con unas 4 mil negativas; k-NN 30; árbol una hoja; bosque la unión de 200 hojas.");
  tabla(s, [
    ["Fila de prueba 7", "Predicción", "Σ w", "Pesos ≠ 0", "Pesos < 0"],
    ["OLS", "3.057", "1.000", "16 512", { text: "4 144", color: ROJO, bold: true }],
    ["Ridge", "3.056", "1.000", "16 512", { text: "4 130", color: ROJO, bold: true }],
    ["k-NN", "3.208", "1.000", "30", "0"],
    ["Árbol", "3.699", "1.000", "328", "0"],
    ["Bosque", "3.718", "1.000", "388", "0"],
  ], X0, 1.75, 7.6, [2.0, 1.4, 1.2, 1.5, 1.5], { fontSize: 15, rowH: 0.52 });
  cifra(s, "100 / 100", "verificaciones: 20 filas de prueba × 5 modelos, |Σ wᵢyᵢ − pred| < 10⁻⁸", 8.9, 1.85, 3.7, ROJO);
  cifra(s, "≈ 4 000", "filas votan en contra en OLS y ridge: una de cada cuatro", 8.9, 4.05, 3.7);
}

// ---------------------------------------------------------------- 6 bootstrap y proximidad
{
  const s = nueva("Parte 1 · Bosque", "Con bootstrap la fórmula falla; la proximidad no es un peso",
    "Con bootstrap=True cada hoja promedia su muestra bootstrap, no todas las filas que caen en ella. Si contamos cuántas veces entró cada fila al árbol, vuelve a cuadrar. La proximidad suma el tamaño medio de la hoja: le falta normalizar dentro de cada árbol.");
  cifra(s, "0.044", "error máximo de la fórmula con bootstrap = True (contra 10⁻¹⁵ sin bootstrap)", X0, 1.75, 3.6, ROJO);
  cifra(s, "36.8 %", "de las filas queda fuera de la bolsa de cada árbol; otras entran 2, 3… veces", X0 + 4.1, 1.75, 3.6);
  cifra(s, "6.495", "suma de la proximidad de la fila 7 = tamaño medio de su hoja en los 200 árboles", X0 + 8.2, 1.75, 3.7);
  regla(s, X0, 3.75, ANCHO);
  etiqueta(s, "Arreglo para bootstrap", X0, 3.95, 5.6);
  cuerpo(s, ["Contar cada fila tantas veces como entró a su árbol (cᵢₜ):",
             "wᵢ(x) = (1/T) Σₜ cᵢₜ 1{misma hoja} / Σⱼ cⱼₜ 1{misma hoja}",
             "Vuelve a reproducir .predict() a 10⁻¹⁵"], X0, 4.3, 5.6, 2.2, { fontSize: 14 });
  etiqueta(s, "¿Qué le falta a la proximidad?", 6.9, 3.95, 5.7);
  cuerpo(s, ["Cada coincidencia vale 1, sin importar el tamaño de la hoja",
             "Hay que dividir entre |Lₜ(x)| dentro de cada árbol, antes de promediar",
             "Normalizarla al final no basta (difiere hasta 0.0026)"], 6.9, 4.3, 5.7, 2.2, { fontSize: 14 });
}

// ---------------------------------------------------------------- 7 hiperparámetros
{
  const s = nueva("Parte 2 · Bikeshare", "El bosque gana; los lineales no dibujan la hora punta",
    "Hiperparámetros por validación cruzada de 5 pliegues sobre entrenamiento. Ridge casi no importa porque n es mucho mayor que p. hr entra como número y una recta no puede hacer los dos picos de la hora punta.");
  barras(s, ["OLS", "Ridge", "k-NN", "Árbol", "Bosque"], [0.997, 0.997, 0.533, 0.172, 0.124], X0, 1.65, 6.9, 4.9,
    "MSE de prueba en log(1 + bicis)", ["BBBBBB", "BBBBBB", "888888", "444444", ROJO], "0.000");
  tabla(s, [
    ["Modelo", "Elegido por CV", "MAE (bicis)"],
    ["OLS", "—", "84.6"], ["Ridge", "λ ≈ 17.8", "84.5"], ["k-NN", "k = 4", "53.1"],
    ["Árbol", "profundidad 11", "27.4"], [{ text: "Bosque", bold: true }, { text: "min_samples_leaf = 1", bold: true },
                                         { text: "27.2", color: ROJO, bold: true }],
  ], 8.0, 1.75, 4.6, [1.3, 2.1, 1.2], { fontSize: 13.5, rowH: 0.45 });
  etiqueta(s, "Importancia en el bosque", 8.0, 4.75, 4.6);
  cuerpo(s, [[{ text: "hr 0.65", bold: true }, { text: " · temp 0.09 · hum 0.07 · day 0.07" }]], 8.0, 5.1, 4.6, 0.6,
    { bullet: false, fontSize: 14 });
}

// ---------------------------------------------------------------- 2 · fórmulas de evidencia
derivacion("Parte 2 · Fórmulas", "Dos números para la ficha de evidencia (y un tercero)",
  [["01", "Tamaño efectivo de muestra de Kish: en cuántas filas se apoya la predicción (m pesos iguales ⇒ m)", "nef"],
   ["02", "Concentración: la condición de Hájek–Šidák del TLC; si es grande, una sola fila manda", "conc"],
   ["03", "Lo que agregamos: la dispersión ponderada de los testigos y la varianza aproximada del voto", "disp"]],
  "N_ef: si todos los pesos son 1/m, (Σw)² = 1 y Σw² = 1/m, así que N_ef = m. c(x) es la fracción de la suma de cuadrados que aporta el peso más grande; el TLC para sumas ponderadas necesita que vaya a cero. En nuestros datos N_ef no ordenó el error, pero la dispersión de testigos sí, porque la varianza del voto es σ²(x)/N_ef y σ²(x) cambia mucho por hora.",
  "Hiperparámetros por CV de 5 pliegues: ridge λ ≈ 17.8, k = 4, profundidad 11, min_samples_leaf = 1.");

// ---------------------------------------------------------------- 8 fichas
{
  const s = nueva("Parte 2.1 · Fichas de evidencia", "Tres consultas: una de ellas descansa en una sola fila",
    "Mediana: el bosque usa mañanas de la misma semana. Mínimo: 98% del voto es la hora anterior del mismo día (tormenta de nieve del 29 de octubre). Interesante: escogimos el mayor error del bosque para ver si la ficha delata el fallo; 66% del voto es la 1 p.m. del mismo día.");
  const fichas = [
    ["N_ef mediano", "Vie 7 oct · 11 h", "230", "187", "8.75", "0.42", "10 h de la misma semana (w = 0.22)", NEGRO],
    ["N_ef mínimo", "Sáb 29 oct · 18 h · nieve", "43", "32", "1.04", "0.9998", "17 h del mismo día (w = 0.98)", ROJO],
    ["Mayor error", "Mar 18 ene · 12 h", "3", "29", "2.26", "0.98", "13 h del mismo día (w = 0.66)", NEGRO],
  ];
  fichas.forEach(([tipo, cuando, real, pred, nef, c, testigo, col], i) => {
    const x = X0 + i * 4.05, w = 3.7;
    etiqueta(s, tipo, x, 1.7, w, col === ROJO ? ROJO : GRIS);
    s.addText(cuando, { x, y: 2.0, w, h: 0.42, fontFace: TITULO, fontSize: 17, bold: true, color: NEGRO, margin: 0, isTextBox: true });
    regla(s, x, 2.55, w);
    [["Real", real], ["Predicción bosque", pred], ["N_ef", nef], ["c(x)", c]].forEach(([k, v], j) => {
      s.addText(k, { x, y: 2.7 + j * 0.5, w: 2.1, h: 0.4, fontFace: TITULO, fontSize: 14, color: GRIS, margin: 0, isTextBox: true });
      s.addText(v, { x: x + 2.1, y: 2.7 + j * 0.5, w: 1.6, h: 0.4, fontFace: TITULO, fontSize: 18, bold: true,
                     color: (k === "c(x)" || k === "N_ef") ? col : NEGRO, align: "right", margin: 0, isTextBox: true });
    });
    regla(s, x, 4.8, w);
    s.addText([{ text: "Testigo principal: ", options: { bold: true, color: NEGRO } }, { text: testigo, options: { color: GRIS } }],
      { x, y: 4.95, w, h: 0.7, fontFace: TITULO, fontSize: 13.5, margin: 0, valign: "top", isTextBox: true });
  });
  cuerpo(s, [[{ text: "OLS/ridge: " , bold: true }, { text: "N_ef ≈ 1 000, pero sus testigos de mayor |w| son tardes lluviosas de verano con peso negativo." }]],
    X0, 5.85, ANCHO, 0.6, { bullet: false, fontSize: 14 });
}

// ---------------------------------------------------------------- 9 OLS negativos
{
  const s = nueva("Parte 2.2 · OLS", "OLS vota en contra con las filas más lejanas",
    "Entre un tercio y casi la mitad de los pesos de OLS son negativos. Los más negativos están en el percentil 96 a 99 de distancia: tardes con viento y lluvia extremos, puntos de alta palanca que inclinan el hiperplano.");
  s.addImage({ path: FIG("2_2_pesos_vs_distancia.png"), x: X0, y: 1.65, w: 8.6, h: 2.41 });
  cifra(s, "2 274", "a 3 115 de los 6 916 pesos OLS son negativos, según la consulta", 9.6, 1.7, 3.0, ROJO);
  cifra(s, "p96 – p99", "percentil de distancia de las 5 filas con peso más negativo", 9.6, 3.75, 3.0);
  regla(s, X0, 4.4, 8.6);
  cuerpo(s, ["Cerca: pesos positivos. Lejos: negativos. Los de mayor magnitud están en los extremos de la nube.",
             "Como w(x) es lineal en x, OLS usa puntos de palanca (viento ≈ 0.85, lluvia) para inclinar el hiperplano y extrapolar.",
             "k-NN (4 pesos) y el bosque (37) solo dejan votar a vecinos cercanos, siempre con peso positivo."],
    X0, 4.6, 8.6, 1.9, { fontSize: 14 });
}

// ---------------------------------------------------------------- 10 Neff vs dispersión
{
  const s = nueva("Parte 2.3 · ¿Sirve N_ef?", "N_ef no predice el error; la dispersión de testigos sí",
    "El MAE por quintil de N_ef es plano (Spearman 0.03). El bosque corta fino al mediodía, donde la señal está bien determinada, y en log el error lo domina el ruido de madrugada. La dispersión ponderada de los testigos sí ordena el error: de 0.13 a 0.39.");
  barras(s, ["Q1", "Q2", "Q3", "Q4", "Q5"], [0.263, 0.242, 0.255, 0.233, 0.262], X0, 1.65, 5.8, 3.6,
    "MAE (log) por quintil de N_ef — Spearman 0.03", ["888888"], "0.00", { valAxisMinVal: 0, valAxisMaxVal: 0.45 });
  barras(s, ["D1", "D2", "D3", "D4", "D5"], [0.133, 0.177, 0.248, 0.308, 0.388], 6.85, 1.65, 5.8, 3.6,
    "MAE (log) por quintil de dispersión — Spearman 0.39", [ROJO], "0.00", { valAxisMinVal: 0, valAxisMaxVal: 0.45 });
  regla(s, X0, 5.45, ANCHO);
  cuerpo(s, [[{ text: "Por qué: ", bold: true }, { text: "el bosque corta fino donde la señal cambia rápido (mediodía: N_ef ≈ 5, error bajo) y en log domina el ruido de madrugada (1–5 h: N_ef alto, error 0.33–0.48). Var ≈ σ²(x)/N_ef: hace falta σ²(x)." }]],
    X0, 5.6, ANCHO, 1.0, { bullet: false, fontSize: 14 });
}

// ---------------------------------------------------------------- 11 cuándo no confiar
{
  const s = nueva("Parte 2.4 · Criterio", "Cuándo decirle a alguien que no confíe en una predicción",
    "Cuatro reglas concretas que salen de 2.1 a 2.3. La primera es la que mejor anticipa el error en nuestros datos.");
  const reglas = [
    ["01", "Los testigos discrepan", "Dispersión ponderada alta: el error se triplica entre el quintil más bajo y el más alto."],
    ["02", "Un solo testigo decide", "N_ef ≲ 2 o c(x) > 0.9, y ese testigo no se parece a la consulta (otra hora, otra estación)."],
    ["03", "OLS extrapola", "Los testigos de mayor |w| son filas lejanas con peso negativo: no es un promedio de casos parecidos."],
    ["04", "Los modelos discrepan", "El 18 de enero los cinco modelos van de 23 a 58 bicis: no hay casos parecidos cerca."],
  ];
  reglas.forEach(([num, t, d], i) => {
    const x = X0 + (i % 2) * 6.1, y = 1.75 + Math.floor(i / 2) * 2.35;
    s.addText(num, { x, y, w: 0.9, h: 0.7, fontFace: TITULO, fontSize: 36, bold: true, color: ROJO, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 1.05, y: y + 0.05, w: 4.7, h: 0.5, fontFace: TITULO, fontSize: 19, bold: true, color: NEGRO, margin: 0, isTextBox: true });
    s.addText(d, { x: x + 1.05, y: y + 0.6, w: 4.7, h: 1.2, fontFace: TITULO, fontSize: 14.5, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  });
  regla(s, X0, 4.0, ANCHO);
}

// ---------------------------------------------------------------- 3.1 derivación de trazas
derivacion("Parte 3.1 · Derivación", "Trazas de OLS y ridge",
  [["OLS", "Traza cíclica: tr(AB) = tr(BA)", "tr_ols"],
   ["RID", "SVD de la matriz centrada; el término (1/n)11ᵀ aporta traza 1", "tr_ridge"]],
  "Ridge: X_c(X_cᵀX_c + λI)⁻¹X_cᵀ = UDVᵀ(VD²Vᵀ + λI)⁻¹VDUᵀ = UD(D² + λI)⁻¹DUᵀ, y su traza es Σ d_j²/(d_j²+λ) porque UᵀU = I. Con λ → 0 se recupera p + 1; con λ → ∞ queda 1 (solo el intercepto).",
  "Con λ = 0 la traza de ridge es p + 1 = 11 (OLS); con λ → ∞ tiende a 1.");

derivacion("Parte 3.1 · Derivación", "Trazas de k-NN, árbol y bosque",
  [["KNN", "Sin filas repetidas, cada fila es su propio vecino más cercano (distancia 0)", "tr_knn"],
   ["ÁRB", "Agrupar la suma por hojas: cada hoja aporta |L| · 1/|L| = 1", "tr_arbol"],
   ["BOS", "Sin forma cerrada: se suma Sᵢᵢ directamente (sin bootstrap = nº medio de hojas)", "tr_bosque"]],
  "k-NN: si hay filas repetidas, el empate puede dejar fuera a la propia fila y la traza baja; en Bikeshare no hay repetidas (cada día-hora aparece una vez). Árbol y bosque se verifican contra np.trace(S) con S completa sobre 2 000 filas.",
  null);

// ---------------------------------------------------------------- 12 tr(S)
{
  const s = nueva("Parte 3.1 · Grados de libertad", "tr(S): fórmula contra np.trace(S)",
    "OLS: traza cíclica, tr(H) = tr(I_{p+1}). Ridge: SVD de X_c. k-NN: cada fila es su propio vecino más cercano; no hay filas repetidas. Árbol: sumar 1/|L| sobre la hoja da 1 por hoja. Bosque: sin forma cerrada, sumamos S_ii.");
  tabla(s, [
    ["Modelo", "Fórmula", "Idea"],
    ["OLS", "p + 1", "tr(X̃(X̃ᵀX̃)⁻¹X̃ᵀ) = tr(Iₚ₊₁)"],
    ["Ridge", "1 + Σ dⱼ²/(dⱼ² + λ)", "SVD Xc = UDVᵀ"],
    ["k-NN", "n / k", "Sᵢᵢ = 1/k (sin filas repetidas)"],
    ["Árbol", "nº de hojas", "Σ_L Σ_{i∈L} 1/|L| = Σ_L 1"],
    ["Bosque", "Σ Sᵢᵢ", "sin forma cerrada"],
  ], X0, 1.75, 6.4, [1.2, 2.3, 2.9], { fontSize: 13.5, rowH: 0.5 });
  tabla(s, [
    ["n = 2 000", "Fórmula", "np.trace(S)"],
    ["OLS", "11", "11.000"], ["Ridge λ = 17.8", "10.197", "10.197"], ["k-NN k = 4", "500", "500.000"],
    ["Árbol prof. 11", "701", "701.000"], ["Bosque", "1 967.56", "1 967.56"],
  ], 7.5, 1.75, 5.1, [2.3, 1.4, 1.4], { fontSize: 13.5, rowH: 0.5 });
  etiqueta(s, "max |S·y − pred| ≈ 10⁻¹⁵", 7.5, 5.05, 5.1, ROJO);
}

// ---------------------------------------------------------------- 13 curvas
{
  const s = nueva("Parte 3.2 · Curvas", "El bosque casi interpola y aun así generaliza mejor",
    "k-NN y el árbol muestran la U: el error de entrenamiento baja sin parar y el de prueba sube pasado cierto tr(S). El bosque tiene tr(S) cercano a n y el menor error de prueba: tr(S) mide flexibilidad en los puntos de entrenamiento, no en puntos nuevos.");
  s.addImage({ path: FIG("3_2_curvas_trS.png"), x: X0, y: 1.6, w: 8.3, h: 4.53 });
  etiqueta(s, "Mínimo del error de prueba", 9.3, 1.75, 3.3);
  tabla(s, [
    ["Familia", "Parámetro", "MSE"],
    ["OLS / Ridge", "λ → 0", "0.997"], ["k-NN", "k = 4", "0.533"], ["Árbol", "prof. 12", "0.169"],
    [{ text: "Bosque", bold: true }, { text: "msl = 1", bold: true }, { text: "0.124", color: ROJO, bold: true }],
  ], 9.3, 2.1, 3.3, [1.35, 1.05, 0.9], { fontSize: 13, rowH: 0.42 });
  cuerpo(s, ["tr(S) cuenta el voto de cada fila por sí misma; en un punto nuevo el bosque promedia 200 árboles distintos."],
    9.3, 4.4, 3.3, 1.7, { bullet: false, fontSize: 13 });
}

// ---------------------------------------------------------------- 3.3 derivación del optimismo
derivacion("Parte 3.3 · Derivación", "Optimismo: por qué cuesta 2σ²·tr(S)/n",
  [["01", "Definición (ESL §7.4): error en los mismos xᵢ con y nuevas menos error de entrenamiento", "opt0"],
   ["02", "Con y nueva independiente de ŷ: se expande alrededor de fᵢ y el término cruzado vale 0", "opt1"],
   ["03", "Con la misma y: el término cruzado es −2·Cov(ŷᵢ, yᵢ); la resta da el resultado del paso 1", "opt2"],
   ["04", "Si S no depende de y y Var(yᵢ) = σ² (independientes), solo sobrevive j = i", "opt3"]],
  "Escribir y_i = f_i + ε_i. (y_i − ŷ_i)² = (y_i − f_i)² + (f_i − ŷ_i)² + 2(y_i − f_i)(f_i − ŷ_i). Con y nueva, E[(y_nueva − f)(f − ŷ)] = 0 porque ε' es independiente. Con la y de entrenamiento, E[ε_i(f_i − ŷ_i)] = −Cov(ε_i, ŷ_i) = −Cov(y_i, ŷ_i). Restando: 2Cov(ŷ_i, y_i). Con ŷ = Sy y S fija, Cov(Σ_j S_ij y_j, y_i) = S_ii σ².",
  "En el árbol S depende de y (los cortes miran y): la fórmula subestima el optimismo 2.7× a 4.3×.");

// ---------------------------------------------------------------- 14 optimismo
{
  const s = nueva("Parte 3.3 – 3.6 · Optimismo", "2σ²·tr(S)/n solo cuadra si S no depende de y",
    "Cov(ŷ_i, y_i) = σ² S_ii cuando S es fija. k-NN y ridge eligen sus pesos solo con X: cuadra. El árbol elige los cortes mirando y: el optimismo es 2.7 a 4.3 veces la fórmula. OOB: la fila nunca vota por sí misma, así que no hay optimismo.");
  s.addChart(pres.charts.BAR, [
    { name: "Optimismo simulado (50 réplicas)", labels: ["k-NN k=5", "k-NN k=30", "Ridge λ=17.8", "Árbol prof. 6", "Árbol prof. 10"],
      values: [0.0944, 0.0171, 0.0022, 0.0184, 0.1294] },
    { name: "2σ²·tr(S)/n", labels: ["k-NN k=5", "k-NN k=30", "Ridge λ=17.8", "Árbol prof. 6", "Árbol prof. 10"],
      values: [0.0923, 0.0154, 0.0007, 0.0043, 0.0479] },
  ], { x: X0, y: 1.6, w: 7.6, h: 4.2, barDir: "col", barGapWidthPct: 60, chartColors: [NEGRO, ROJO], showValue: true,
       dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000", valAxisLabelFormatCode: "0.00", showLegend: true,
       legendPos: "b", legendFontFace: TITULO, legendFontSize: 11, legendColor: GRIS, showTitle: true,
       title: "σ = 0.480 (RMSE out-of-bag de la “verdad”), n = 6 916", ...EJE, dataLabelFontSize: 9 });
  etiqueta(s, "3.4 · Por qué falla en el árbol", 8.75, 1.7, 3.9);
  cuerpo(s, ["k-NN y ridge: opt/fórmula = 1.02, 1.11 y ≈1 (dentro de 1.5 ee)",
             "Árbol: 4.3× y 2.7×. Los cortes se eligen mirando y, así que S depende de y"], 8.75, 2.05, 3.9, 1.9, { fontSize: 13.5 });
  regla(s, 8.75, 3.95, 3.9);
  etiqueta(s, "3.6 · Out-of-bag", 8.75, 4.1, 3.9);
  tabla(s, [["Error (MSE)", "Valor"], ["Entrenamiento", "0.019"], ["Out-of-bag", { text: "0.141", color: ROJO, bold: true }],
            ["Prueba", "0.136"]], 8.75, 4.45, 3.9, [2.4, 1.5], { fontSize: 13, rowH: 0.36 });
  cuerpo(s, [[{ text: "3.5: ", bold: true }, { text: "la brecha prueba − entrenamiento no es el optimismo, porque en prueba también cambian los x." }]],
    X0, 6.0, 7.6, 0.6, { bullet: false, fontSize: 13 });
}

// ---------------------------------------------------------------- 4 · la distancia
{
  const s = nueva("Parte 4 · Escala", "Escoger la escala es escoger el kernel",
    "Toda distancia euclídea pondera cada variable por el cuadrado de su escala. En crudo, el aporte esperado de cada variable a d² es proporcional a su varianza: day domina con 99.4 %. Estandarizar divide entre s_j² y todas pesan igual, lo cual no siempre es bueno.");
  let y = formula(s, "dist", X0, 1.8, ANCHO);
  etiqueta(s, "Aporte esperado a d² en escala cruda (∝ varianza)", X0, y + 0.35, 7);
  barras(s, ["day", "hr", "mnth", "weekday", "weathersit", "otras 5"], [99.42, 0.43, 0.11, 0.04, 0.004, 0.003],
    X0, y + 0.7, 7.2, 6.55 - (y + 0.7), "% de la varianza de la distancia", [ROJO], "0.0");
  cuerpo(s, ["Desviaciones crudas (0.4): day ≈ 105, hr ≈ 6.9, mes ≈ 3.4, weekday ≈ 2.0, temp ≈ 0.20, windspeed ≈ 0.12",
             "Pero day y hr están en enteros: localmente, 1 día pesa igual que 1 hora → “misma hora en días vecinos”",
             "k-NN y k-means dependen de la distancia; el árbol no (solo usa el orden de cada variable)"],
    8.3, y + 0.75, 4.3, 3.5, { fontSize: 13.5 });
}

// ---------------------------------------------------------------- 15 escala
{
  const s = nueva("Parte 4 · Escala", "En crudo, k-NN busca la misma hora en días vecinos",
    "En crudo, day aporta 99.4% de la varianza de la distancia. Pero day y hr están en enteros: un día de diferencia pesa lo mismo que una hora, así que el vecindario es la misma hora en días vecinos. Estandarizar le da peso a holiday, windspeed y weekday. El árbol: mismos cortes, pero 6 predicciones cambian por umbrales en el punto medio y redondeo a float32. k-means crudo separa por day.");
  barras(s, ["Crudo", "Estandarizado", "PCA (8 comp.)"], [0.426, 0.591, 0.582], X0, 1.65, 5.0, 3.5,
    "k-NN k = 10 · MSE de prueba (log)", [ROJO], "0.000");
  etiqueta(s, "4.1 – 4.2 · k-NN", 6.1, 1.75, 6.5);
  cuerpo(s, ["day aporta 99.4 % de la varianza de la distancia cruda, pero day y hr están ambas en enteros",
             "Estandarizar le da el mismo peso a holiday o windspeed: más ruido en la distancia",
             "Vecinos compartidos (crudo vs estandarizado): 7, 2 y 1 de 10"], 6.1, 2.1, 6.5, 2.2, { fontSize: 14 });
  regla(s, X0, 5.35, ANCHO);
  etiqueta(s, "4.3 · Árbol", X0, 5.5, 5.6);
  cuerpo(s, ["Misma estructura y hojas, pero 6 de 1 729 predicciones cambian: el umbral cae justo en un valor y float32 lo mueve ~10⁻⁸"],
    X0, 5.82, 5.6, 0.9, { bullet: false, fontSize: 13 });
  etiqueta(s, "4.4 · k-means (k = 7, silueta)", 6.9, 5.5, 5.7);
  cuerpo(s, ["Crudo: bloques de ~50 días (los separa day). Estandarizado: tipos de día (sábado, domingo, feriado, clima)"],
    6.9, 5.82, 5.7, 0.9, { bullet: false, fontSize: 13 });
}

// ---------------------------------------------------------------- 16 veredicto
{
  const s = nueva("Parte 5 · Veredicto", "Bosque + su ficha de testigos, evaluado por días completos",
    "Para el equipo que reubica bicicletas cada mañana. Modelo: random forest con su ficha (predicción, 5 testigos, dispersión). No confiar cuando los testigos discrepan, cuando un solo testigo decide y no se parece, de madrugada y en días atípicos. Lo que más cambia la respuesta es la partición: dejando fuera días completos el error del bosque sube 45%.");
  const cols = [
    ["Qué modelo", "Random forest", "Menor error (27 bicis por hora) y cada predicción se explica con horas históricas concretas."],
    ["Cuándo no confiar", "Testigos en desacuerdo", "Error ×3. También: un solo testigo que no se parece, madrugadas, días atípicos."],
    ["Qué cambia más", "La partición", "Por días completos: el error del bosque sube ~45 % (sigue ganando). Luego: escala y flexibilidad."],
  ];
  cols.forEach(([k, t, d], i) => {
    const x = X0 + i * 4.05, w = 3.7;
    etiqueta(s, k, x, 1.75, w, ROJO);
    s.addText(t, { x, y: 2.1, w, h: 0.5, fontFace: TITULO, fontSize: 22, bold: true, color: NEGRO, margin: 0, isTextBox: true });
    regla(s, x, 2.7, w);
    s.addText(d, { x, y: 2.85, w, h: 1.3, fontFace: TITULO, fontSize: 14, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  });
  s.addChart(pres.charts.BAR, [
    { name: "Por horas", labels: ["OLS", "k-NN k=4", "Árbol", "Bosque"], values: [0.997, 0.533, 0.172, 0.124] },
    { name: "Por días completos", labels: ["OLS", "k-NN k=4", "Árbol", "Bosque"], values: [1.070, 0.667, 0.234, 0.181] },
  ], { x: X0, y: 4.2, w: ANCHO, h: 2.45, barDir: "bar", barGapWidthPct: 45, chartColors: ["BBBBBB", ROJO], showValue: true,
       dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000", valAxisLabelFormatCode: "0.0", showLegend: true, legendPos: "r",
       legendFontFace: TITULO, legendFontSize: 11, legendColor: GRIS, showTitle: false, ...EJE, dataLabelFontSize: 10 });
}

// ---------------------------------------------------------------- parte individual de Rodolfo (Samuel L. Jackson)
{
  const s = nueva("Parte individual · Rodolfo Flores", "Samuel L. Jackson: un grafo de colaboración es un kernel",
    "B es la matriz actores por películas. A = BBᵀ cuenta películas compartidas: dos actores se parecen si salen en las mismas películas, igual que dos filas se parecen en el bosque si caen en las mismas hojas. Cada película hace el papel de una hoja. La diagonal de BBᵀ es el número de películas de cada actor.");
  let y = formula(s, "slj_B", X0, 1.7, ANCHO);
  y = formula(s, "slj_A", X0, y + 0.22, ANCHO);
  y = formula(s, "slj_diag", X0, y + 0.22, ANCHO);
  y = formula(s, "slj_bosque", X0, y + 0.3, ANCHO);
  regla(s, X0, y + 0.3, ANCHO);
  cifra(s, "108", "películas cuentan para Jackson (1975–2025, order < 5)", X0, y + 0.45, 2.8, ROJO);
  cifra(s, "377", "actores (nodos) y 2 666 aristas", X0 + 3.05, y + 0.45, 2.8);
  cifra(s, "BBᵀ = A", "fuera de la diagonal, exacto; B es 377 × 10 334", X0 + 6.1, y + 0.45, 2.8);
  cifra(s, "3", "aislados (papeles de sí mismos): λ₂ = 0 con la semilla", X0 + 9.15, y + 0.45, 2.8);
}

derivacion("Parte individual · Espectro", "Laplaciano: un valor propio cero por componente", [
  ["01", "Laplaciano: grado menos adyacencia (con pesos = películas compartidas)", "slj_L"],
  ["02", "Laplaciano normalizado: cada arista se divide entre la raíz de los grados", "slj_Lsym"],
  ["03", "Forma cuadrática: vᵀLv = 0 obliga a v constante dentro de cada componente", "slj_cuadratica"],
  ["04", "Por eso las componentes se cuentan con los valores propios (casi) cero", "slj_componentes"],
  ["05", "Nodo aislado: D^(−1/2) no existe; con esta convención da λ = 0 y el conteo cuadra", "slj_convencion"],
  ["06", "Mayor brecha. Con semilla: λ₁ = … = λ₄ = 0 (3 aislados + resto); en su componente, λ₂ = 0.247", "slj_brecha"],
], "La forma cuadrática explica por qué hay un valor propio cero por componente. Con la semilla hay cuatro ceros: los 3 aislados más el resto, así que la mayor brecha está en k = 4. En la componente de la semilla λ2 = 0.247. La semilla tiene grado ponderado 415: en L_sym sus aristas pesan poco y los grupos que solo se unen por ella casi se separan.");

derivacion("Parte individual · Comunidades y centralidad", "Clustering espectral, Fiedler y centralidad", [
  ["01", "Ng–Jordan–Weiss. k = 3: Hollywood comercial (187), núcleo de Jackson de los 90 (115), cine afroamericano (72)", "slj_njw"],
  ["02", "Vector de Fiedler (sin la semilla): 318 actores del cine comercial contra 51 del afroamericano; cruza 15 % de las aristas", "slj_fiedler"],
  ["03", "Centralidad de vector propio: 3 de 5 coinciden con el grado; entran Travolta y Freeman", "slj_centralidad"],
], "Con k = 2 se separan los italianos de The Red Violin; con k = 3 aparecen épocas e industrias. El signo del vector de Fiedler separa el Hollywood comercial del cine afroamericano e independiente. La centralidad de vector propio premia repetir películas con actores centrales, por eso entran Travolta y Freeman.",
"Como el bosque con sus hojas: el espectro del kernel señala dónde la conexión (la evidencia) es débil.");

// ---------------------------------------------------------------- 17 cierre
{
  const s = pres.addSlide({ masterName: "PORTADA" });
  n += 1;
  circulo(s, 10.9, 4.9, 1.7, 2.5);
  s.addText("PREGUNTAS", { x: X0, y: 1.0, w: 10, h: 0.3, fontFace: MONO, fontSize: 11, color: ROJO, charSpacing: 4, bold: true,
    margin: 0, isTextBox: true });
  s.addText("Gracias", { x: X0, y: 1.45, w: 11.5, h: 1.4, fontFace: TITULO, fontSize: 60, bold: true, color: NEGRO, margin: 0,
    isTextBox: true });
  s.addText("Repositorio: notebook que corre de principio a fin, memo de la Parte 5, estas diapositivas y las partes individuales como submódulos.",
    { x: X0, y: 3.0, w: 10.2, h: 0.9, fontFace: TITULO, fontSize: 17, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  s.addText([{ text: "Referencias", options: { bold: true, color: NEGRO, breakLine: true } },
             { text: "Sudjianto, The Learned Kernel (2026) · Hastie, Tibshirani y Friedman, ESL §7.4–7.6 · Fanaee-T y Gama (2014) · Pace y Barry (1997)",
               options: { color: GRIS } }],
    { x: X0, y: 4.65, w: 9.8, h: 1.2, fontFace: TITULO, fontSize: 13, margin: 0, valign: "top", isTextBox: true });
  s.addText("?", { x: 10.9, y: 4.9, w: 1.7, h: 1.7, fontFace: TITULO, fontSize: 54, bold: true, color: ROJO, align: "center",
    valign: "middle", margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: path.join(RAIZ, "slides", "presentacion.pptx") }).then((f) => console.log(f, n, "diapositivas"));

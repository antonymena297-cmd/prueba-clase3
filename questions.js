// Banco de preguntas — Prueba Clase 3 (Referencias y funciones básicas)
// 20 preguntas x 3 puntos = 60 automáticos. El caso práctico vale 40 puntos (calificación del profesor).
function icon(inner) {
  return `<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="4" width="32" height="32" rx="7" fill="#eef2ea" stroke="#1f6d4a" stroke-width="1.5"/>${inner}</svg>`;
}
function iconText(t, size = 13) {
  return icon(`<text x="20" y="25" font-family="Inter,Arial" font-size="${size}" font-weight="700" fill="#0e4a30" text-anchor="middle">${t}</text>`);
}

const QUIZ_QUESTIONS = [
  // ---------- Referencias relativas, absolutas y mixtas ----------
  {
    id: "q1",
    icon: iconText("A1"),
    q: "¿Qué tipo de referencia cambia sola al copiar una fórmula a otra celda?",
    options: ["Absoluta", "Relativa", "Mixta", "Ninguna cambia"],
    correct: 1
  },
  {
    id: "q2",
    icon: iconText("$B$1", 12),
    q: "¿Qué símbolo se usa para fijar una referencia absoluta?",
    options: ["%", "$", "&", "#"],
    correct: 1
  },
  {
    id: "q3",
    icon: iconText("F4"),
    q: "¿Qué tecla alterna entre los 4 tipos de referencia (relativa, absoluta, mixta)?",
    options: ["F2", "F4", "F6", "F9"],
    correct: 1
  },
  {
    id: "q4",
    icon: iconText("A$1", 12),
    q: "Si escribís una referencia como A$1, ¿qué queda fijo al copiar la fórmula?",
    options: ["Solo la columna", "Solo la fila", "Columna y fila", "Nada queda fijo"],
    correct: 1
  },
  {
    id: "q5",
    icon: iconText("↓ =", 14),
    q: "Tenés la fórmula =A2*$B$1 en la celda C2 y la copiás hacia abajo hasta C6. ¿Qué pasa con la referencia a B1?",
    options: ["Cambia a B2, B3, B4...", "Se mantiene fija en B1", "Se convierte en error", "Cambia solo la columna"],
    correct: 1
  },
  // ---------- Autorrelleno y series ----------
  {
    id: "q6",
    icon: icon(`<circle cx="26" cy="26" r="4" fill="#b8873a"/><rect x="10" y="10" width="14" height="12" rx="2" fill="none" stroke="#0e4a30" stroke-width="1.5"/>`),
    q: "¿Qué hace doble clic sobre el controlador de relleno (la esquina de la celda)?",
    options: ["Borra la celda", "Copia solo el formato", "Rellena hasta donde haya datos en la columna de al lado", "Abre el menú de formato"],
    correct: 2
  },
  {
    id: "q7",
    icon: iconText("Ene →", 11),
    q: "Si escribís \"Enero\" en una celda y arrastrás el controlador de relleno 11 celdas, ¿qué obtenés?",
    options: ["\"Enero\" repetido 11 veces", "Los nombres de los otros 11 meses", "Un error, porque no es un número", "Celdas vacías"],
    correct: 1
  },
  {
    id: "q8",
    icon: iconText("Ctrl+", 12),
    q: "Si arrastrás el controlador de relleno sobre números mientras mantenés Ctrl presionado, ¿qué pasa?",
    options: ["Crea una serie (1, 2, 3...)", "Copia el mismo valor en vez de hacer una serie", "Borra los números", "No hace nada distinto"],
    correct: 1
  },
  {
    id: "q9",
    icon: iconText("1,2,3", 11),
    q: "Para que el autorrelleno continúe una serie numérica (1, 2, 3...) en vez de copiar el mismo número, ¿qué necesitás hacer primero?",
    options: ["Nada especial, basta un número", "Seleccionar al menos dos celdas que marquen el patrón", "Activar un filtro", "Usar una referencia absoluta"],
    correct: 1
  },
  // ---------- Funciones básicas ----------
  {
    id: "q10",
    icon: icon(`<path d="M13 25 L18 14 L23 25 M14.5 21 H21.5" stroke="#0e4a30" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    q: "¿Qué función devuelve el valor más alto de un rango?",
    options: ["=MIN()", "=MAX()", "=CONTAR()", "=PROMEDIO()"],
    correct: 1
  },
  {
    id: "q11",
    icon: icon(`<path d="M13 15 L18 26 L23 15 M14.5 15 H21.5" stroke="#0e4a30" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    q: "¿Qué función devuelve el valor más bajo de un rango?",
    options: ["=MAX()", "=CONTARA()", "=MIN()", "=SUMA()"],
    correct: 2
  },
  {
    id: "q12",
    icon: iconText("123", 15),
    q: "¿Qué función cuenta solo las celdas que tienen números?",
    options: ["=CONTARA()", "=CONTAR()", "=MAX()", "=SUMA()"],
    correct: 1
  },
  {
    id: "q13",
    icon: iconText("A+1", 11),
    q: "¿Qué función cuenta las celdas que no están vacías, sin importar el tipo de dato?",
    options: ["=CONTAR()", "=CONTARA()", "=MIN()", "=PROMEDIO()"],
    correct: 1
  },
  {
    id: "q14",
    icon: iconText("5+2", 13),
    q: "Un rango tiene 5 celdas con números y 2 celdas con texto. ¿Qué devuelve =CONTAR() sobre ese rango?",
    options: ["7", "5", "2", "0"],
    correct: 1
  },
  {
    id: "q15",
    icon: iconText("5+2", 13),
    q: "Sobre ese mismo rango (5 celdas con números y 2 con texto), ¿qué devuelve =CONTARA()?",
    options: ["5", "2", "7", "0"],
    correct: 2
  },
  // ---------- Ordenar ----------
  {
    id: "q16",
    icon: icon(`<path d="M12 14 H28 M12 20 H28 M12 26 H22" stroke="#0e4a30" stroke-width="1.6" stroke-linecap="round"/><path d="M26 23 L29 26 L26 29" stroke="#b8873a" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    q: "Si ordenás solo una columna sin seleccionar el resto de la tabla, ¿qué pasa?",
    options: ["No pasa nada", "Se rompe la relación entre las filas", "Se borra la columna", "Se crea un filtro automático"],
    correct: 1
  },
  {
    id: "q17",
    icon: iconText("Z→A", 12),
    q: "¿Qué opción de orden usarías para que un listado de nombres aparezca de la Z a la A?",
    options: ["A - Z", "Z - A", "Menor a mayor", "Orden personalizado"],
    correct: 1
  },
  {
    id: "q18",
    icon: iconText("1°,2°", 11),
    q: "¿Para qué sirve \"Ordenar personalizado\" en vez del botón de orden rápido?",
    options: ["Para ordenar por varias columnas en secuencia (primero por una, después por otra)", "Para eliminar duplicados", "Para aplicar formato condicional", "Para crear un gráfico"],
    correct: 0
  },
  // ---------- Filtros ----------
  {
    id: "q19",
    icon: icon(`<path d="M11 13 H29 L22 22 V28 L18 26 V22 Z" fill="none" stroke="#0e4a30" stroke-width="1.6" stroke-linejoin="round"/>`),
    q: "¿Qué atajo de teclado activa el filtro automático?",
    options: ["Ctrl+F", "Ctrl+Shift+L", "Ctrl+L", "Alt+F4"],
    correct: 1
  },
  {
    id: "q20",
    icon: iconText("Ø", 16),
    q: "Cuando filtrás una tabla y algunas filas desaparecen de la vista, esas filas:",
    options: ["Se borraron definitivamente", "Se movieron a otra hoja", "Siguen ahí, solo están ocultas", "Se convirtieron en comentarios"],
    correct: 2
  }
];

const POINTS_PER_QUESTION = 3;   // 20 x 3 = 60
const CASE_STUDY_POINTS = 40;    // calificación manual del profesor
const AUTO_TOTAL = QUIZ_QUESTIONS.length * POINTS_PER_QUESTION;

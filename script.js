let currentMode = "addition";
let draggingEnabled = false;
let slices = { pizza1: 0, pizza2: 0, pizza3: 0 };
let totalSlices = 4;
let draggedSlice = null;
let floatingSlice = null;
let originalPizza = null;
let sliceIndex = null;
let currentQuestion;
let currentQuestionIndex = 0;
let questionsPerMode = 5;
let correctAnswers = 0;

const initNumeratorSlider = document.getElementById("numerator-slider");
const initDenominatorSlider = document.getElementById("denominator-slider");
const initLabel = document.getElementById("label-init");
const initPizzaSvg = document.getElementById("pizza-init");

initNumeratorSlider.addEventListener("input", updateInitialVisualizer);
initDenominatorSlider.addEventListener("input", updateInitialVisualizer);

function updateInitialVisualizer() {
  let num = parseInt(initNumeratorSlider.value, 10);
  let den = parseInt(initDenominatorSlider.value, 10);

  if (num > den) {
    num = den;
    initNumeratorSlider.value = den;
  }

  initLabel.textContent = `${num}/${den}`;

  createPizza(initPizzaSvg, num, den);
}

function createPizza(svg, filledSlices, totalSlices) {
  svg.innerHTML = "";

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "45");
  circle.setAttribute("fill", "white");
  circle.setAttribute("stroke", "#666");
  circle.setAttribute("stroke-width", "2");
  svg.appendChild(circle);

  for (let i = 0; i < totalSlices; i++) {
    const angle = (360 / totalSlices) * i;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "50");
    line.setAttribute("y1", "50");
    line.setAttribute("x2", 50 + 45 * Math.cos(((angle - 90) * Math.PI) / 180));
    line.setAttribute("y2", 50 + 45 * Math.sin(((angle - 90) * Math.PI) / 180));
    line.setAttribute("stroke", "#666");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }

  for (let i = 0; i < filledSlices; i++) {
    const startAngle = (360 / totalSlices) * i - 90;
    const endAngle = (360 / totalSlices) * (i + 1) - 90;
    const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`;
    path.setAttribute("d", d);
    path.setAttribute("fill", "#42a5f5");
    path.setAttribute("stroke", "#666");
    path.setAttribute("stroke-width", "2");
    path.classList.add("slice");
    svg.appendChild(path);
  }
}

function startQuiz() {
  document.getElementById("initial-page").classList.add("hide");
  document.getElementById("quiz-content").classList.remove("hide");
  currentQuestionIndex = 0;
  correctAnswers = 0;
  loadQuestion();
}

function startSubtractionQuiz() {
  document.getElementById("mode-completion-screen").classList.add("hide");
  document.getElementById("quiz-content").classList.remove("hide");
  currentMode = "subtraction";
  currentQuestionIndex = 0;
  loadQuestion();
}

function generateQuestion() {
  const den = Math.floor(Math.random() * 8) + 3;
  let num1, num2, answer_num;

  if (currentMode === "addition") {
    num1 = Math.floor(Math.random() * (den - 1)) + 1;
    num2 = Math.floor(Math.random() * (den - num1)) + 1;
    answer_num = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * (den - 1)) + 2;
    num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
    answer_num = num1 - num2;
  }

  return {
    num1: num1,
    den1: den,
    num2: num2,
    den2: den,
    answer_num: answer_num,
    answer_den: den,
    slices1: num1,
    slices2: num2,
    totalSlices: den,
  };
}

function loadQuestion() {
  if (currentQuestionIndex >= questionsPerMode) {
    if (currentMode === "addition") {
      showModeCompletion();
    } else {
      showCompletionScreen();
    }
    return;
  }

  currentQuestion = generateQuestion();
  const q = currentQuestion;
  totalSlices = q.totalSlices;
  const viz = document.getElementById("visualization");

  document.getElementById("operation-type").textContent =
    currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

  if (currentMode === "addition") {
    viz.classList.remove("subtraction-mode");
    document.getElementById("operator").textContent = "+";
    document.getElementById("quiz-operator").textContent = "+";
    document.getElementById("instruction").textContent =
      "Drag the slices from the first two pizzas to the empty one!";
    slices = { pizza1: q.slices1, pizza2: q.slices2, pizza3: 0 };
  } else {
    viz.classList.add("subtraction-mode");
    document.getElementById("operator").textContent = "-";
    document.getElementById("quiz-operator").textContent = "-";
    document.getElementById("instruction").textContent =
      "Drag the red slices from the second pizza onto the blue slices to subtract!";
    slices = { pizza1: q.slices1, pizza2: q.slices2, pizza3: 0 };
  }

  document.getElementById("num1").textContent = q.num1;
  document.getElementById("den1").textContent = q.den1;
  document.getElementById("num2").textContent = q.num2;
  document.getElementById("den2").textContent = q.den2;

  document.getElementById("answer-num").value = "";
  document.getElementById("answer-den").value = "";
  const fb = document.getElementById("feedback");
  fb.textContent = "";
  fb.className = "feedback";

  document.getElementById("question-info").textContent = `Question ${
    currentQuestionIndex + 1
  } of ${questionsPerMode}`;

  draggingEnabled = true;
  updateVisualization();
}

function createQuizPizza(svgId, filledSlices = 0, color = "#42a5f5") {
  const svg = document.getElementById(svgId);
  svg.innerHTML = "";

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "45");
  circle.setAttribute("fill", "white");
  circle.setAttribute("stroke", "#ccc");
  circle.setAttribute("stroke-width", "1");
  svg.appendChild(circle);

  for (let i = 0; i < totalSlices; i++) {
    const angle = (360 / totalSlices) * i;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "50");
    line.setAttribute("y1", "50");
    line.setAttribute("x2", 50 + 45 * Math.cos(((angle - 90) * Math.PI) / 180));
    line.setAttribute("y2", 50 + 45 * Math.sin(((angle - 90) * Math.PI) / 180));
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
  }

  for (let i = 0; i < filledSlices; i++) {
    addSlice(svg, i, color, svgId);
  }
}

function addSlice(svg, index, color, pizzaId) {
  const startAngle = (360 / totalSlices) * index - 90;
  const endAngle = (360 / totalSlices) * (index + 1) - 90;

  const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
  const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
  const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
  const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const d = `M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`;
  path.setAttribute("d", d);
  path.setAttribute("fill", color);
  path.setAttribute("stroke", "#666");
  path.setAttribute("stroke-width", "2");
  path.classList.add("slice");
  path.dataset.pizzaId = pizzaId;
  path.dataset.sliceIndex = index;

  let isDraggable = false;
  if (
    currentMode === "addition" &&
    (pizzaId === "pizza1" || pizzaId === "pizza2")
  ) {
    isDraggable = true;
  } else if (currentMode === "subtraction" && pizzaId === "pizza2") {
    isDraggable = true;
  }

  if (draggingEnabled && isDraggable) {
    path.style.cursor = "grab";
    path.addEventListener("mousedown", startDrag);
    path.addEventListener("touchstart", startDrag, { passive: false });
  }

  svg.appendChild(path);
}

function createFloatingSlice(color, startAngle, endAngle) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("floating-slice");
  svg.setAttribute("viewBox", "0 0 100 100");

  const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
  const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
  const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
  const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const d = `M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`;
  path.setAttribute("d", d);
  path.setAttribute("fill", color);
  path.setAttribute("stroke", "#333");
  path.setAttribute("stroke-width", "3");

  svg.appendChild(path);
  return svg;
}

function startDrag(e) {
  if (!draggingEnabled) return;
  e.preventDefault();

  draggedSlice = e.currentTarget || e.target;
  originalPizza = draggedSlice.dataset.pizzaId;
  sliceIndex = parseInt(draggedSlice.dataset.sliceIndex, 10);

  if (!slices[originalPizza] || slices[originalPizza] <= 0) {
    draggedSlice = null;
    return;
  }

  draggedSlice.classList.add("dragging");

  const startAngle = (360 / totalSlices) * sliceIndex - 90;
  const endAngle = (360 / totalSlices) * (sliceIndex + 1) - 90;
  const color = draggedSlice.getAttribute("fill");

  floatingSlice = createFloatingSlice(color, startAngle, endAngle);
  document.body.appendChild(floatingSlice);

  const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

  floatingSlice.style.left = clientX - 75 + "px";
  floatingSlice.style.top = clientY - 75 + "px";

  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", endDrag);
}

function drag(e) {
  if (!floatingSlice) return;

  const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

  floatingSlice.style.left = clientX - 75 + "px";
  floatingSlice.style.top = clientY - 75 + "px";

  document.querySelectorAll(".pizza-container").forEach((container) => {
    container.classList.remove("drop-target");
  });

  const elementBelow = document.elementFromPoint(clientX, clientY);
  const pizzaContainer = elementBelow?.closest(".pizza-container");

  const dropTargetPizzaId = currentMode === "addition" ? "pizza3" : "pizza1";
  if (pizzaContainer && pizzaContainer.dataset.pizza === dropTargetPizzaId) {
    pizzaContainer.classList.add("drop-target");
  }
}

function endDrag(e) {
  if (!floatingSlice) return;

  const clientX =
    e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
  const clientY =
    e.type === "touchend" ? e.changedTouches[0].clientY : e.clientY;

  const elementBelow = document.elementFromPoint(clientX, clientY);
  const pizzaContainer = elementBelow?.closest(".pizza-container");

  document.querySelectorAll(".pizza-container").forEach((container) => {
    container.classList.remove("drop-target");
  });

  const dropTargetPizzaId = currentMode === "addition" ? "pizza3" : "pizza1";
  if (pizzaContainer && pizzaContainer.dataset.pizza === dropTargetPizzaId) {
    if (currentMode === "addition") {
      if (
        (originalPizza === "pizza1" || originalPizza === "pizza2") &&
        slices[originalPizza] > 0
      ) {
        slices[originalPizza]--;
        slices.pizza3++;
      }
    } else {
      if (originalPizza === "pizza2" && slices.pizza2 > 0) {
        slices.pizza2--;
        slices.pizza1--;
      }
    }
    updateVisualization();
  } else {
    if (draggedSlice) draggedSlice.classList.remove("dragging");
  }

  if (floatingSlice) floatingSlice.remove();
  floatingSlice = null;
  draggedSlice = null;

  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchmove", drag);
  document.removeEventListener("touchend", endDrag);
}

function updateVisualization() {
  const q = currentQuestion;
  if (currentMode === "subtraction") {
    createQuizPizza("pizza1", slices.pizza1, "#42a5f5");
    createQuizPizza("pizza2", slices.pizza2, "#ef5350");

    document.getElementById(
      "label1"
    ).textContent = `${slices.pizza1}/${totalSlices}`;
    document.getElementById(
      "label2"
    ).textContent = `${slices.pizza2}/${totalSlices}`;

    if (slices.pizza2 === 0) {
      document.getElementById("instruction").textContent =
        "Great! You've subtracted all the slices. Now answer the quiz below.";
    }
  } else {
    createQuizPizza("pizza1", slices.pizza1, "#42a5f5");
    createQuizPizza("pizza2", slices.pizza2, "#42a5f5");
    createQuizPizza("pizza3", slices.pizza3, "#ef5350");

    document.getElementById(
      "label1"
    ).textContent = `${slices.pizza1}/${totalSlices}`;
    document.getElementById(
      "label2"
    ).textContent = `${slices.pizza2}/${totalSlices}`;
    document.getElementById(
      "label3"
    ).textContent = `${slices.pizza3}/${totalSlices}`;

    if (slices.pizza3 === q.answer_num) {
      document.getElementById("instruction").textContent =
        "Great! You've combined the slices. Now answer the quiz below.";
    }
  }
}

function showHint() {
  const feedback = document.getElementById("feedback");
  feedback.className = "feedback";
  feedback.style.color = "#1976d2";
  feedback.style.background = "#e3f2fd";
  if (currentMode === "addition") {
    feedback.textContent =
      "Hint: To add fractions with the same denominator, add the numerators together and keep the denominator the same.";
  } else {
    feedback.textContent =
      "Hint: To subtract fractions with the same denominator, subtract the second numerator from the first and keep the denominator the same.";
  }
}

function goToNextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

function checkAnswer() {
  const numAnswer = parseInt(document.getElementById("answer-num").value, 10);
  const denAnswer = parseInt(document.getElementById("answer-den").value, 10);
  const feedback = document.getElementById("feedback");

  const q = currentQuestion;

  if (numAnswer === q.answer_num && denAnswer === q.answer_den) {
    feedback.textContent = "Correct! ✓";
    feedback.className = "feedback correct";
    correctAnswers++;

    setTimeout(() => {
      goToNextQuestion();
    }, 1000);
  } else {
    feedback.textContent =
      "Not quite! Try using the drag-and-drop visual to find the answer.";
    feedback.className = "feedback incorrect";
  }
}

function showModeCompletion() {
  document.getElementById("quiz-content").classList.add("hide");
  document.getElementById("mode-completion-screen").classList.remove("hide");
}

function showCompletionScreen() {
  document.getElementById("quiz-content").classList.add("hide");
  const completionScreen = document.getElementById("completion-screen");
  completionScreen.classList.remove("hide");
  completionScreen.classList.add("active");

  const totalQuestions = questionsPerMode * 2;
  const finalScoreEl = document.getElementById("final-score");
  finalScoreEl.textContent = `Score: ${correctAnswers}/${totalQuestions}`;
}

function restartQuiz() {
  document.getElementById("completion-screen").classList.add("hide", "active");
  document.getElementById("initial-page").classList.remove("hide");

  currentMode = "addition";
  currentQuestionIndex = 0;
  correctAnswers = 0;

  updateInitialVisualizer();
}

updateInitialVisualizer();

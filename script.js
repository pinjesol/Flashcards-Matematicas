const sideMenu = document.getElementById("sideMenu");

let cards = [];
let studyQueue = [];
let currentIndex = null;

/* -------- MENÚ -------- */
function toggleMenu() {
  sideMenu.classList.toggle("hidden");
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  sideMenu.classList.add("hidden");

  if (id === "study") initStudyFilters();
  if (id === "stats") loadStats();
  if (id === "library") loadLibrary();
}

/* -------- DATOS -------- */
function loadCards() {
  cards = JSON.parse(localStorage.getItem("cards") || "[]");
}

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

/* -------- CREAR -------- */
function addCard() {
  if (!subject.value || !topic.value || !title.value ||
      !hypothesis.value || !thesis.value) {
    alert("Completa todos los campos obligatorios");
    return;
  }

  cards.push({
    subject: subject.value,
    topic: topic.value,
    title: title.value,
    hypothesis: hypothesis.value,
    thesis: thesis.value,
    proof: proof.value,
    correct: 0,
    wrong: 0
  });

  saveCards();
  alert("Tarjeta guardada");

  subject.value = topic.value = title.value =
  hypothesis.value = thesis.value = proof.value = "";
}

/* -------- BIBLIOTECA -------- */
function loadLibrary() {
  libraryContent.innerHTML = "";

  let grouped = {};

  cards.forEach((c, i) => {
    grouped[c.subject] ??= {};
    grouped[c.subject][c.topic] ??= [];
    grouped[c.subject][c.topic].push({ ...c, index: i });
  });

  for (let subject in grouped) {
    let h3 = document.createElement("h3");
    h3.innerText = subject;
    libraryContent.appendChild(h3);

    for (let topic in grouped[subject]) {
      let h4 = document.createElement("h4");
      h4.innerText = "• " + topic;
      libraryContent.appendChild(h4);

      grouped[subject][topic].forEach(c => {
        let div = document.createElement("div");
        div.className = "cardItem";
        div.innerHTML = `
          <strong>${c.title}</strong>
          <button onclick="deleteCard(${c.index})">Borrar</button>
        `;
        libraryContent.appendChild(div);
      });
    }
  }
}

function deleteCard(index) {
  if (!confirm("¿Eliminar esta tarjeta?")) return;
  cards.splice(index, 1);
  saveCards();
  loadLibrary();
}

/* -------- ESTUDIAR -------- */
function initStudyFilters() {
  studySubject.innerHTML = `<option value="">Todas las asignaturas</option>`;
  studyTopic.innerHTML = `<option value="">Todos los temas</option>`;

  [...new Set(cards.map(c => c.subject))].forEach(s => {
    let opt = document.createElement("option");
    opt.value = s;
    opt.innerText = s;
    studySubject.appendChild(opt);
  });

  updateStudyTopics();
}

function updateStudyTopics() {
  studyTopic.innerHTML = `<option value="">Todos los temas</option>`;

  cards
    .filter(c => !studySubject.value || c.subject === studySubject.value)
    .map(c => c.topic)
    .filter((v, i, a) => a.indexOf(v) === i)
    .forEach(t => {
      let opt = document.createElement("option");
      opt.value = t;
      opt.innerText = t;
      studyTopic.appendChild(opt);
    });

  buildStudyQueue();
  loadStudyCard();
}

function buildStudyQueue() {
  studyQueue = cards
    .map((c, i) => ({ ...c, index: i }))
    .filter(c =>
      (!studySubject.value || c.subject === studySubject.value) &&
      (!studyTopic.value || c.topic === studyTopic.value)
    )
    .sort((a, b) => b.wrong - a.wrong);
}

function loadStudyCard() {
  if (studyQueue.length === 0) {
    noCardsMessage.classList.remove("hidden");
    studyArea.classList.add("hidden");
    return;
  }

  noCardsMessage.classList.add("hidden");
  studyArea.classList.remove("hidden");

  let card = studyQueue.shift();
  studyQueue.push(card);
  currentIndex = card.index;

  let c = cards[currentIndex];

  studyTitle.innerText = c.title;
  sHypothesis.innerText = c.hypothesis;
  sThesis.innerText = c.thesis;
  sProof.innerText = c.proof || "—";

  solution.classList.add("hidden");
  resultButtons.classList.add("hidden");
  showSolutionBtn.classList.remove("hidden");
}

function showSolution() {
  solution.classList.remove("hidden");
  resultButtons.classList.remove("hidden");
  showSolutionBtn.classList.add("hidden");
}

function markCorrect() {
  cards[currentIndex].correct++;
  saveCards();
  loadStudyCard();
}

function markWrong() {
  cards[currentIndex].wrong++;
  saveCards();
  buildStudyQueue();
  loadStudyCard();
}

/* -------- PROGRESO -------- */
function loadStats() {
  statsList.innerHTML = "";
  cards.forEach(c => {
    let li = document.createElement("li");
    li.innerText = `${c.title} → ✔️ ${c.correct} | ❌ ${c.wrong}`;
    statsList.appendChild(li);
  });
}

/* -------- INICIO -------- */
loadCards();


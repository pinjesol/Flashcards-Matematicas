let cards = [];
let currentIndex = null;

/* -------- MENÚ -------- */
function toggleMenu() {
  sideMenu.classList.toggle("hidden");
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  sideMenu.classList.add("hidden");

  if (id === "study") loadStudyCard();
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
function chooseCard() {
  let weights = cards.map(c => c.wrong + 1);
  let total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  let acc = 0;
  for (let i = 0; i < cards.length; i++) {
    acc += weights[i];
    if (r < acc) return i;
  }
}

function loadStudyCard() {
  if (cards.length === 0) {
    noCardsMessage.classList.remove("hidden");
    studyArea.classList.add("hidden");
    return;
  }

  noCardsMessage.classList.add("hidden");
  studyArea.classList.remove("hidden");

  currentIndex = chooseCard();
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

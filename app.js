const STORAGE_KEY = "yotsuya-risha-progress-v1";

const state = {
  allQuestions: [],
  filteredQuestions: [],
  currentIndex: 0,
  subject: "all",
  lesson: "all",
  status: "all",
  progress: loadProgress(),
};

const els = {
  quizCard: document.getElementById("quizCard"),
  emptyState: document.getElementById("emptyState"),
  lessonFilter: document.getElementById("lessonFilter"),
  statusFilter: document.getElementById("statusFilter"),
  subjectButtons: [...document.querySelectorAll(".segment")],
  subjectBadge: document.getElementById("subjectBadge"),
  lessonLabel: document.getElementById("lessonLabel"),
  knowledgeLabel: document.getElementById("knowledgeLabel"),
  questionNumber: document.getElementById("questionNumber"),
  questionText: document.getElementById("questionText"),
  hintText: document.getElementById("hintText"),
  answerArea: document.getElementById("answerArea"),
  answerText: document.getElementById("answerText"),
  explanationBlock: document.getElementById("explanationBlock"),
  explanationText: document.getElementById("explanationText"),
  showAnswerBtn: document.getElementById("showAnswerBtn"),
  showHintBtn: document.getElementById("showHintBtn"),
  judgeArea: document.getElementById("judgeArea"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  pageIndicator: document.getElementById("pageIndicator"),
  totalCount: document.getElementById("totalCount"),
  goodCount: document.getElementById("goodCount"),
  retryCount: document.getElementById("retryCount"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
};

async function init() {
  try {
    const questions = await loadQuestions();
    state.allQuestions = questions;
    buildLessonOptions();
    bindEvents();
    applyFilters();
  } catch (error) {
    console.error(error);
    els.emptyState.innerHTML = "<p>問題データを読み込めませんでした。sample-questions.json を確認してください。</p>";
  }
}

async function loadQuestions() {
  // 将来Supabaseへ切り替える場合は、ここを置き換えます。
  // window.APP_CONFIG.useSupabase が true の時にSupabase取得へ分岐させる設計です。
  const response = await fetch("sample-questions.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load question data.");
  const data = await response.json();
  return data.questions || [];
}

function buildLessonOptions() {
  const lessons = [...new Set(state.allQuestions.map(q => q.lesson))].sort((a, b) => {
    const na = Number(String(a).replace(/\D/g, "")) || 0;
    const nb = Number(String(b).replace(/\D/g, "")) || 0;
    return na - nb;
  });

  for (const lesson of lessons) {
    const option = document.createElement("option");
    option.value = lesson;
    option.textContent = lesson;
    els.lessonFilter.appendChild(option);
  }
}

function bindEvents() {
  els.subjectButtons.forEach(button => {
    button.addEventListener("click", () => {
      els.subjectButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      state.subject = button.dataset.subject;
      state.currentIndex = 0;
      applyFilters();
    });
  });

  els.lessonFilter.addEventListener("change", e => {
    state.lesson = e.target.value;
    state.currentIndex = 0;
    applyFilters();
  });

  els.statusFilter.addEventListener("change", e => {
    state.status = e.target.value;
    state.currentIndex = 0;
    applyFilters();
  });

  els.showAnswerBtn.addEventListener("click", showAnswer);

  els.showHintBtn.addEventListener("click", () => {
    const q = currentQuestion();
    if (!q) return;
    if (!q.hint) {
      els.hintText.textContent = "この問題にはヒントがありません。";
    } else {
      els.hintText.textContent = q.hint;
    }
    els.hintText.hidden = !els.hintText.hidden;
  });

  document.querySelectorAll(".judge").forEach(button => {
    button.addEventListener("click", () => {
      const q = currentQuestion();
      if (!q) return;
      state.progress[q.id] = button.dataset.judge;
      saveProgress();
      updateSummary();
      renderQuestion();
    });
  });

  els.prevBtn.addEventListener("click", () => {
    if (!state.filteredQuestions.length) return;
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    renderQuestion();
  });

  els.nextBtn.addEventListener("click", () => {
    if (!state.filteredQuestions.length) return;
    state.currentIndex = Math.min(state.filteredQuestions.length - 1, state.currentIndex + 1);
    renderQuestion();
  });

  els.resetProgressBtn.addEventListener("click", () => {
    const ok = confirm("学習状況をすべてリセットしますか？");
    if (!ok) return;
    state.progress = {};
    saveProgress();
    applyFilters();
  });
}

function applyFilters() {
  state.filteredQuestions = state.allQuestions.filter(q => {
    if (state.subject !== "all" && q.subject !== state.subject) return false;
    if (state.lesson !== "all" && q.lesson !== state.lesson) return false;

    const questionStatus = state.progress[q.id] || "new";
    if (state.status !== "all" && questionStatus !== state.status) return false;

    return true;
  });

  if (state.currentIndex >= state.filteredQuestions.length) {
    state.currentIndex = Math.max(0, state.filteredQuestions.length - 1);
  }

  updateSummary();
  renderQuestion();
}

function updateSummary() {
  const questions = state.filteredQuestions;
  els.totalCount.textContent = questions.length;
  els.goodCount.textContent = questions.filter(q => state.progress[q.id] === "good").length;
  els.retryCount.textContent = questions.filter(q => state.progress[q.id] === "retry").length;
}

function currentQuestion() {
  return state.filteredQuestions[state.currentIndex];
}

function renderQuestion() {
  const q = currentQuestion();

  if (!q) {
    els.quizCard.hidden = true;
    els.emptyState.hidden = false;
    els.emptyState.innerHTML = "<p>条件に合う問題がありません。</p>";
    return;
  }

  els.quizCard.hidden = false;
  els.emptyState.hidden = true;

  const subjectName = q.subject === "science" ? "理科" : "社会";
  els.subjectBadge.textContent = subjectName;
  els.lessonLabel.textContent = q.lesson || "";
  els.knowledgeLabel.textContent = q.knowledge_label ? `・${q.knowledge_label}` : "";

  els.questionNumber.textContent = `問題ID: ${q.id}`;
  els.questionText.textContent = q.question;
  els.answerText.textContent = q.answer;
  els.explanationText.textContent = q.explanation || "";
  els.explanationBlock.hidden = !q.explanation;

  els.hintText.hidden = true;

  // v1.0.2: force the initial visibility in JS.
  // This avoids browser/CSS conflicts around the HTML hidden attribute.
  els.answerArea.hidden = true;
  els.answerArea.style.display = "none";
  els.judgeArea.hidden = true;
  els.judgeArea.style.display = "none";
  els.showAnswerBtn.hidden = false;
  els.showAnswerBtn.style.display = "";

  const saved = state.progress[q.id];
  if (saved) {
    const savedLabel = saved === "good" ? "できた" : "要復習";
    els.questionNumber.textContent += ` ・ 前回: ${savedLabel}`;
  }

  els.pageIndicator.textContent = `${state.currentIndex + 1} / ${state.filteredQuestions.length}`;
  els.prevBtn.disabled = state.currentIndex === 0;
  els.nextBtn.disabled = state.currentIndex === state.filteredQuestions.length - 1;
}

function showAnswer() {
  // v1.0.2: explicitly reveal the answer and judgement controls.
  els.answerArea.hidden = false;
  els.answerArea.style.display = "block";
  els.judgeArea.hidden = false;
  els.judgeArea.style.display = "grid";
  els.showAnswerBtn.hidden = true;
  els.showAnswerBtn.style.display = "none";
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

init();

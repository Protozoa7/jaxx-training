const workouts = {
  deadlift: {
    day: "DAY 1",
    title: "DEADLIFT",
    focus: "Conventional deadlifts only. This day stays intentionally simple.",
    exercises: [
      { name: "Conventional Deadlift", sets: "4 sets × 3–6 reps", note: "Stop the session after deadlifts.", featured: true }
    ]
  },
  upper: {
    day: "DAY 2",
    title: "UPPER",
    focus: "Back, arms, and core.",
    exercises: [
      { name: "Lat Pull Down", sets: "3 sets × 8–12 reps" },
      { name: "Cable Rows", sets: "3 sets × 8–12 reps" },
      { name: "Pull Over Machine", sets: "3 sets × 10–15 reps" },
      { name: "Hammer Curls", sets: "3 sets × 10–15 reps" },
      { name: "Cable Crunches", sets: "3 sets × 12–20 reps" }
    ]
  },
  lower: {
    day: "DAY 3",
    title: "LOWER",
    focus: "Squat patterns, legs, and unilateral work.",
    exercises: [
      { name: "Standing Squat Machine", sets: "3 sets × 8–12 reps" },
      { name: "Sitting Squat Machine", sets: "3 sets × 10–15 reps" },
      { name: "Lunges", sets: "3 sets × 8–12 reps per leg" },
      { name: "Goblet Squats", sets: "3 sets × 10–15 reps" }
    ]
  },
  combo: {
    day: "DAY 4",
    title: "COMBO",
    focus: "A balanced full-body session using the same preferred movements.",
    exercises: [
      { name: "Goblet Squats", sets: "3 sets × 8–12 reps" },
      { name: "Lat Pull Down", sets: "3 sets × 8–12 reps" },
      { name: "Lunges", sets: "3 sets × 8–12 reps per leg" },
      { name: "Cable Rows", sets: "3 sets × 10–15 reps" },
      { name: "Hammer Curls", sets: "3 sets × 10–15 reps" },
      { name: "Cable Crunches", sets: "3 sets × 12–20 reps" }
    ]
  }
};

const STORAGE_KEY = "jaxx-training-log-v1";
const SELECTED_DAY_KEY = "jaxx-selected-day";

const workoutContainer = document.getElementById("workout");
const buttons = [...document.querySelectorAll(".day-button")];

function getLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function getSessions(dayKey) {
  const log = getLog();
  return Array.isArray(log[dayKey]) ? log[dayKey] : [];
}

function getPreviousSession(dayKey) {
  const sessions = getSessions(dayKey);
  return sessions.length ? sessions[sessions.length - 1] : null;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHistory(dayKey) {
  const sessions = getSessions(dayKey).slice().reverse();

  if (!sessions.length) {
    return `
      <section class="history">
        <h3>Training Log</h3>
        <p class="history-empty">No saved sessions for this workout yet.</p>
      </section>
    `;
  }

  return `
    <section class="history">
      <h3>Training Log</h3>
      <div class="history-list">
        ${sessions.map(session => `
          <article class="history-item">
            <p class="history-date">${formatDate(session.savedAt)}</p>
            <ul class="history-exercises">
              ${session.entries.map(entry => `
                <li><strong>${escapeHtml(entry.name)}:</strong> ${escapeHtml(entry.weight)} lb</li>
              `).join("")}
            </ul>
            <div class="history-actions">
              <button class="delete-session" data-session-id="${session.id}">Delete</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderWorkout(dayKey) {
  const workout = workouts[dayKey];
  const previous = getPreviousSession(dayKey);

  workoutContainer.innerHTML = `
    <div class="workout-heading">
      <p class="label">${workout.day}</p>
      <h2>${workout.title}</h2>
      <p class="focus">${workout.focus}</p>
    </div>

    <div class="previous-session">
      <strong>Previous session</strong>
      <p>${previous ? formatDate(previous.savedAt) : "No previous workout saved yet."}</p>
    </div>

    <div class="exercise-list">
      ${workout.exercises.map((exercise, index) => {
        const lastEntry = previous?.entries?.find(entry => entry.name === exercise.name);
        return `
          <article class="exercise-card ${exercise.featured ? "deadlift-only" : ""}">
            <div class="exercise-topline">
              <h3>${exercise.name}</h3>
              <span class="order">${String(index + 1).padStart(2, "0")}</span>
            </div>
            <p class="prescription">${exercise.sets}</p>
            ${exercise.note ? `<p class="note">${exercise.note}</p>` : ""}

            <div class="log-row">
              <label>
                <span class="field-label">Weight used (lb)</span>
                <input
                  class="weight-input"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="0.5"
                  placeholder="${lastEntry ? `Last: ${lastEntry.weight}` : "Enter weight"}"
                  data-exercise="${escapeHtml(exercise.name)}"
                />
              </label>
            </div>

            <p class="last-weight">
              ${lastEntry ? `Last session: <strong>${escapeHtml(lastEntry.weight)} lb</strong>` : "No previous weight logged."}
            </p>
          </article>
        `;
      }).join("")}
    </div>

    <button class="save-workout" id="save-workout">SAVE WORKOUT</button>
    <p class="save-message" id="save-message"></p>

    ${renderHistory(dayKey)}
  `;

  localStorage.setItem(SELECTED_DAY_KEY, dayKey);

  document.getElementById("save-workout").addEventListener("click", () => saveCurrentWorkout(dayKey));

  document.querySelectorAll(".delete-session").forEach(button => {
    button.addEventListener("click", () => deleteSession(dayKey, button.dataset.sessionId));
  });
}

function saveCurrentWorkout(dayKey) {
  const inputs = [...document.querySelectorAll(".weight-input")];
  const entries = inputs
    .map(input => ({
      name: input.dataset.exercise,
      weight: input.value.trim()
    }))
    .filter(entry => entry.weight !== "");

  const message = document.getElementById("save-message");

  if (!entries.length) {
    message.textContent = "Enter at least one weight before saving.";
    message.style.color = "var(--danger)";
    return;
  }

  const log = getLog();
  if (!Array.isArray(log[dayKey])) log[dayKey] = [];

  log[dayKey].push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    savedAt: new Date().toISOString(),
    entries
  });

  saveLog(log);
  renderWorkout(dayKey);

  const newMessage = document.getElementById("save-message");
  newMessage.textContent = "Workout saved on this device.";
  newMessage.style.color = "var(--good)";
}

function deleteSession(dayKey, sessionId) {
  const log = getLog();
  log[dayKey] = (log[dayKey] || []).filter(session => session.id !== sessionId);
  saveLog(log);
  renderWorkout(dayKey);
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderWorkout(button.dataset.day);
  });
});

const savedDay = localStorage.getItem(SELECTED_DAY_KEY);
const initialDay = workouts[savedDay] ? savedDay : "deadlift";

buttons.forEach(button => {
  button.classList.toggle("active", button.dataset.day === initialDay);
});

renderWorkout(initialDay);

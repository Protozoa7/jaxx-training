const workouts = {
  deadlift: {
    day: "DAY 1",
    title: "DEADLIFT",
    focus: "Conventional deadlifts only. This day stays intentionally simple.",
    exercises: [
      {
        name: "Conventional Deadlift",
        sets: "4 sets × 3–6 reps",
        note: "Work with clean, controlled reps. Stop the session after deadlifts.",
        featured: true
      }
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

const workoutContainer = document.getElementById("workout");
const buttons = [...document.querySelectorAll(".day-button")];

function renderWorkout(key) {
  const workout = workouts[key];

  workoutContainer.innerHTML = `
    <div class="workout-heading">
      <p class="label">${workout.day}</p>
      <h2>${workout.title}</h2>
      <p class="focus">${workout.focus}</p>
    </div>

    <div class="exercise-list">
      ${workout.exercises.map((exercise, index) => `
        <article class="exercise-card ${exercise.featured ? "deadlift-only" : ""}">
          <div class="exercise-topline">
            <h3>${exercise.name}</h3>
            <span class="order">${String(index + 1).padStart(2, "0")}</span>
          </div>
          <p class="prescription">${exercise.sets}</p>
          ${exercise.note ? `<p class="note">${exercise.note}</p>` : ""}
        </article>
      `).join("")}
    </div>

    ${key === "deadlift" ? `
      <div class="deadlift-reminder">
        <strong>Deadlift day rule:</strong> no accessories and no extra movements.
        Conventional deadlifts are the entire workout.
      </div>
    ` : ""}
  `;

  localStorage.setItem("jaxx-selected-day", key);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderWorkout(button.dataset.day);
  });
});

const savedDay = localStorage.getItem("jaxx-selected-day");
const initialDay = workouts[savedDay] ? savedDay : "deadlift";

buttons.forEach(button => {
  button.classList.toggle("active", button.dataset.day === initialDay);
});

renderWorkout(initialDay);

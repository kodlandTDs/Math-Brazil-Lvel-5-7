/* ============================================================
   Backoffice simulation · Math Adventures Levels 5–7 · ENGLISH
   Translate only the text inside quotes / backticks. Keep HTML tags, ids, file names and URLs unchanged.
   ============================================================ */
window.CONTENT = { lang: 'en' };

CONTENT.ui = {
  pageTitle: 'Backoffice simulation · Math Adventures Level 5',
  badge: '🧪 SIMULATION — Kodland training',
  tourBtn: '🚀 Restart the walkthrough',
  courses: 'Courses',
  backCourses: 'Back to Courses',
  backAssign: 'Back to Assignments',
  viewAssignments: 'View the cards →',
  moreLessons: 'This simulation shows Lesson 1 only. In the real BO you see every ready lesson of the course.',
  stepOf: 'Step {n} of {total}', next: 'Next →', finish: 'Finish ✓',
  clickHint: '👆 Click the highlighted item',
  blocked: '👉 Follow the highlighted step to continue.',
  toastSim: '🧪 This is a simulation — in the real BO, this would: "{label}".',
  groupRow: 'open the student\'s schedule',
  tutorName: 'Demo Tutor',
  nextLesson: 'Lesson 2 · tomorrow, 3:00 PM',
  groupsNote: 'All lessons are 1-on-1: each "group" in BO is one student\'s schedule. Lesson content always lives in Courses.'
};

CONTENT.lesson = {
  card: `
  <img class="ban" src="media/banner.jpg" alt="">
  <h1>Welcome to the lesson! 👋</h1>
  <h4>Today we will go on exciting adventures in the world of geometry. But first, let's get to know each other!</h4>
  <div class="mc"><img src="media/tech.jpg" alt=""><div><h3>🎯 Your mission</h3><ol><li>Turn on your microphone and camera.</li><li>Say your name and your age.</li><li>Turn your microphone off again.</li></ol></div></div>
  <h3>✅ Check that everything works</h3>
  <ul><li>I can see the tutor;</li><li>I can hear the tutor;</li><li>I can turn my microphone on and off;</li><li>My camera is on.</li></ul>
  <div class="spo">I can't find the button to turn on the microphone or the camera</div>
  <div class="spo">I can't hear the tutor. What should I do?</div>
  <div class="spo">The microphone doesn't turn on?</div>
  <div class="spo">The camera doesn't turn on?</div>
  <div id="lessonNotes">
    <div class="tn"><div class="l">Teacher notes</div>
      <p><b>Card goal:</b> Start the lesson warmly and check the technical setup through steps you can observe.</p>
      <p><b>What the tutor should do:</b> First, turn on your microphone and camera, greet the student and explain the sequence of steps. Then listen to the student introduce themselves.</p>
      <p><b>Points of attention:</b> For serious technical problems, contact the technical support team.</p></div>
    <details class="slide" open><summary>Slide for the tutor</summary><div><div class="tn"><div class="l">Teacher notes</div>
      <h2>Lesson preparation: the basics of architectural drawing</h2>
      <p>City hall asked Sophie and Rafi's architecture office to design a modern school yard. In this lesson, the student learns to recognise and tell apart points, line segments, rays and lines, and to name them with Latin letters.</p>
      <details><summary>The story of the lesson</summary><p>The student joins the team as an "intern architect" and turns a tangle of lines into a neat geometric plan.</p></details>
      <details><summary>Main goal of the lesson</summary><p>Tell apart points, line segments, rays and lines, name them with Latin letters and read their symbols.</p></details>
      <details><summary>Expected learning outcomes</summary><p>Tells the four figures apart; reads and writes A, [AB], [AB and AB; works out how many line segments n points make; knows which tool to use for each figure.</p></details>
      <p><b>The tutor's role:</b> Before each concept, ask an intuition question based on the story. Don't give the definition straight away. In the interactive activities, wait for the student to finish alone and ask them to show the result.</p>
      <details><summary>Lesson timing (60 min)</summary><table><tr><th>Stage</th><th>Time</th></tr><tr><td>Introduction</td><td>9 min</td></tr><tr><td>Points and tools</td><td>6 min</td></tr><tr><td>Point, line segment, ray and line</td><td>15 min</td></tr><tr><td>Workshop</td><td>15 min</td></tr><tr><td>Individual activity</td><td>11 min</td></tr><tr><td>Closing</td><td>4 min</td></tr></table></details>
      <details><summary>Methodological approach</summary><p>Intuition → formal definition → practice with the interactive tool. Don't change this order.</p></details>
      <details><summary>Points of attention</summary><p>[AB and [BA are different rays; a line has no measurable length; help the student understand n·(n−1)/2 without memorising the formula.</p></details>
      <details><summary>Quick answer key by card (the whole lesson in one place)</summary><p>The answers to every card of the lesson, in order.</p></details>
    </div></div></details>
  </div>`
};

CONTENT.steps = [
  { title: '1 · Open the course', body: 'Lesson content always lives in <b>Courses</b> — not in Groups. Click <b>[2163] Aventuras Matemáticas Nível 5</b> (Math Adventures Level 5).' },
  { title: '2 · The course record', body: 'Here you check the course: <b>Business branch: Brazil</b>, <b>Language: Portuguese</b>, <b>40 lessons</b> and <b>5 modules</b>. The code <b>[2163]</b> is the same one you see in the training.' },
  { title: '3 · Open Assignments', body: 'The cards of each lesson are in the <b>Assignments</b> tab. Click it.' },
  { title: '4 · Choose the lesson', body: 'The <b>Lesson</b> field chooses which lesson\'s cards you see. Here it is Lesson 1: <b>Point, line, ray and line segments</b>.' },
  { title: '5 · The lesson cards', body: '<b>In-class assignments</b> is the list of interactive cards, in lesson order. <b>Theory ✓</b> marks cards you do together, with no score; <b>Max. score</b> shows how many points a card is worth — the student solves those in their own copy.' },
  { title: '6 · The homework', body: 'Homework is a separate card, in <b>Homework assignments</b>. In class you only show where it is — you don\'t solve it with the student.' },
  { title: '7 · No Wiki link', body: '<b>Study guides</b> is empty, and that is right: in Levels 5–7 the tutor\'s guide lives <b>inside the cards</b>, in the <b>Teacher notes</b> and the <b>Slide for the tutor</b>.' },
  { title: '8 · Open the first card', body: 'Click <b>Boas-vindas!</b> (Welcome!) to see a card from the inside.' },
  { title: '9 · The Teacher notes', body: 'The <b>dashed yellow</b> block is the card\'s <b>Teacher notes</b>: goal, what to do and points of attention. Just below, the <b>Slide for the tutor</b> holds the full lesson briefing: story, goals, timing, method, points of attention and the answer key. Read it all before the lesson.' },
  { title: '10 · See it as the student does', body: 'Turn on <b>Preview</b> at the top of the card to see it through the student\'s eyes.' },
  { title: '11 · What the student sees', body: 'In Preview, the Teacher notes and the Slide for the tutor <b>disappear</b>: the student sees only the card content. So you don\'t need to hide anything — but don\'t read the notes aloud either.' }
];

CONTENT.done = {
  title: 'Simulation complete!',
  body: 'You opened the course by its code, found the lesson cards in Assignments, saw the homework and the Teacher notes, and checked what the student sees.',
  next: '<b>Next step:</b> go back to the training and continue the module.',
  stay: 'Keep exploring',
  again: '↺ Do it again'
};

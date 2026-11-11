/* ============================================================
   Classroom lesson guide · Math Adventures Levels 5–7 training
   Lesson shown in the simulated Classroom: Math Adventures Level 5 · Lesson 1 (Point, line, ray and line segment),
   from the first card up to the individual activity. The lesson cards are shown in English in this version.
   Translate only the text inside quotes / backticks. Keep HTML tags, ${...}, keys, ids, file names and URLs unchanged.
   ============================================================ */
window.CONTENT = { lang: 'en' };

/* =========================================================
   INTERFACE STRINGS
   ========================================================= */
CONTENT.ui = {
  title: 'Classroom lesson guide · Math Adventures',

  headerTitle: 'Math Adventures · Level 5 · Lesson 1',
  online: '2 online',
  guideChip: 'Lesson guide',
  leave: 'Leave',

  classroom: 'Classroom',
  assignments: 'Assignments',
  prevTask: 'Previous card',
  nextTask: 'Next card',
  leadGroup: 'Lead the group',
  endSession: 'End the lesson',

  student: 'Ana',
  tutorInitial: 'T',
  tutorYou: 'Tutor (you)',
  following: 'Following the tutor',

  platformLang: 'EN ˅',
  platformUser: 'Tutor',

  teacherNotes: 'Teacher notes',
  submit: '✔ Send',
  choose: 'Choose…',
  yourAnswer: 'Your answer',
  correct: '✔ Correct!',
  wrong: '✖ Not correct, try again.',
  scoreLabel: '✍️ Individual activity · automatic check',
  scoreHint: (done, total) => `Questions checked: ${done}/${total}. Each correct answer is worth 1 point.`,

  seg: {
    title: '📏 Line segment drawing',
    count: n => `Line segments: ${n}`,
    auto: 'Automatic check',
    reset: 'Clear',
    hint: 'Drag from one point to another (or click two points). Release when the line turns green.',
    added: s => `✔ Line segment ${s} drawn.`,
    dup: s => `${s} is already drawn: [AB] and [BA] are the same line segment.`,
    all: '🎉 You drew every possible line segment! Now write the number below.'
  },

  coachStep: (n, total) => `Lesson guide · ${n}/${total}`,
  next: 'Next →',
  clickHint: '👆 Click the highlighted element',
  openSections: (opened, total) => `Open every section (${opened}/${total})`,
  scrollEndNotes: 'Scroll to the end of the notes',
  scrollEndCard: 'Scroll to the end of the card',
  checks: {
    seg: 'Draw at least one line segment',
    answer: 'Answer a question and check it with «Send»'
  }
};

/* =========================================================
   WELCOME PAGE
   ========================================================= */
CONTENT.welcome = {
  kicker: 'Math Adventures Levels 5–7 · Tutor training',
  title: 'Lesson guide in <span>Classroom</span>',
  lead: 'This guide shows how a Levels 5–7 lesson looks in <b>Classroom</b>. It uses the first cards of a real lesson — <b>Math Adventures Level 5, Lesson 1: Point, line, ray and line segment</b> (Rafi and Sophie\'s architecture office) — and a student, Ana, who is already in the room.',
  seeTitle: 'What you will see',
  see: [
    'How a lesson is organised: a sequence of <b>interactive cards</b>, with all the guidance inside the lesson itself.',
    '<b>What you see</b> and <b>what Ana sees</b>: the <b>Teacher notes</b> sit inside the cards and only the tutor can see them.',
    'The <b>Slide for the tutor</b> on the first card: goals, timing, points of attention, an answer key for every card and a video guide.',
    'The <b>Lead the group</b> switch, which makes the student follow the card you open.',
    'The <b>individual activity</b> with automatic checking, which the student solves in their own copy.'
  ],
  howTitle: 'How to use it',
  howText: 'This is a guide, not a test: there are no wrong decisions and no points to lose. Follow the highlighted steps and click where the guide tells you. You can replay it as many times as you like.',
  start: 'START THE GUIDE →'
};

/* =========================================================
   LESSON CONTENT (Math Adventures · Level 5 — Lesson 1)
   ========================================================= */
CONTENT.graded = ['sr1-q01', 'sr1-q02', 'sr1-q03', 'sr1-q05', 'sr1-q06', 'sr1-q07'];

CONTENT.activities = ({ P, tnotes, spoiler, media, ul, ol, group, card, pic, quiz, choice, inputEx, segApp, scoreBox }) => [
  /* ---------- 1 ---------- */
  { title:`Welcome!`, html:
    pic(P.banner, `Welcome to the geometry lesson`) +
    `<h1>Welcome to the lesson! 👋</h1>
     <h4>Today we will go on exciting adventures in the world of geometry. But first, let's get to know each other!</h4>` +
    media(P.tech, `<h3>🎯 Your mission</h3>` + ol([`Turn on your microphone and camera.`, `Say your name and your age.`, `Turn your microphone off again.`]), 'narrow') +
    `<h3>✅ Check that everything works</h3>` +
    ul([`I can see the tutor;`, `I can hear the tutor;`, `I can turn my microphone on and off;`, `My camera is on.`]) +
    spoiler(`I can't find the button to turn on the microphone or the camera`, ol([`Look at the bottom bar of the lesson window.`, `Find the microphone 🎙️ and camera 🎥 icons.`, `Click the icon to turn the device on or off.`])) +
    spoiler(`I can't hear the tutor. What should I do?`, ol([`Check your computer's volume.`, `Check that the right speaker is selected in the settings.`, `Raise your hand ✋ so the tutor notices the problem.`])) +
    spoiler(`The microphone doesn't turn on?`, ol([`Check that access to the microphone is allowed.`, `Click the arrow next to the microphone icon and choose the right device.`, `Raise your hand ✋ and wait for the tutor's help.`])) +
    spoiler(`The camera doesn't turn on?`, ol([`Check that access to the camera is allowed.`, `Close other programs that may be using the camera.`, `If the camera still doesn't work, keep taking part in the lesson with audio.`])) +
    `<div id="tn-first">` +
    tnotes(`
      <p><strong>Card goal:</strong> Start the lesson warmly and check the technical setup through steps you can observe.</p>
      <p><strong>What the tutor should do:</strong> First, turn on your microphone and camera, greet the student and explain the sequence of steps. Then listen to the student introduce themselves.</p>
      <p><strong>Points of attention:</strong> For serious technical problems, contact the technical support team.</p>`) +
    spoiler(`Slide for the tutor`, tnotes(`
      <h1>Lesson preparation: the basics of architectural drawing</h1>
      <p>City hall asked Sophie and Rafi's architecture office to design a modern school yard (with sports areas, places to rest and green paths). In this lesson, the student learns to recognise and tell apart points, line segments, rays and lines, and to name them with Latin letters.</p>
      ${spoiler(`The story of the lesson`, `<p>Sophie and Rafi's architecture office has the mission of designing a school yard. The student joins the team as an "intern architect" and learns to mark out areas with line segments, draw parallel running tracks and aim the beams of floodlights, turning a tangle of lines into a neat geometric plan.</p>`)}
      ${spoiler(`Main goal of the lesson`, `<p>The student learns to tell apart points, line segments, rays and lines by their definitions, name them correctly with Latin letters and read their symbols.</p>`)}
      ${spoiler(`Expected learning outcomes`, ol([`Tells apart points, line segments, rays and lines by their definitions.`, `Reads and writes the notation: point (A), line segment [AB], ray [AB and line AB.`, `Works out how many line segments or lines can be made from points on a line.`, `Knows which tool to use (ruler, long ruler, compass, protractor or set square) for each figure.`]))}
      <div class="tn-video"><video src="${P.video}" controls preload="none" title="Lesson video guide"></video></div>
      <p><strong>The tutor's role:</strong> Before each new concept, ask an intuition question based on a concrete example from the building site or the school yard (a marking rope, a floodlight beam or the horizon). Don't give the definition straight away. In the interactive activities (marking points, drawing line segments and the geometry workshop), wait for the student to finish the task alone and ask them to show the result.</p>
      <h3>YOU MUST READ ALL THE TUTOR NOTES ON EVERY SLIDE</h3>
      ${spoiler(`Lesson timing (60 min)`, `<table>
        <tr><th>Stage</th><th>Content</th><th>Time</th></tr>
        <tr><td>Introduction</td><td>Welcome; meet Rafi and Sophie; mood question; the architecture office story and goals</td><td>9 min</td></tr>
        <tr><td>Main part 1 — Points and tools</td><td>Choosing models of line segments; matching tools</td><td>6 min</td></tr>
        <tr><td>Main part 2 — Point, line segment, ray and line</td><td>4 definitions + marking points; drawing line segments; 5-question quiz; self-check</td><td>15 min</td></tr>
        <tr><td>Main part 3 — Workshop</td><td>Geometry workshop (a drawing with 5 elements); extra activity (writing your name with line segments)</td><td>15 min</td></tr>
        <tr><td>Individual activity</td><td>Part 1 (6 questions) and reasoning questions (4 questions)</td><td>11 min</td></tr>
        <tr><td>Closing</td><td>Lesson reflection; mood; homework reminder</td><td>4 min</td></tr>
      </table><p><em>Total: 60 min.</em></p>`)}
      ${spoiler(`Methodological approach`, `<p>Introduce each concept first with a question based on an example from the building site or the yard (intuition); then explain the formal definition and the symbol; finally practise with the interactive tool. Don't change this order.</p>`)}
      ${spoiler(`Points of attention`, ol([`In ray notation the order of the letters matters: [AB and [BA are different rays; the first letter is always the starting point.`, `A line has no "measurable length" (it is infinite) — a frequent mix-up in the individual activities.`, `In questions about how many line segments or lines n points make when joined two by two, help the student understand the reasoning behind n·(n−1)/2, without asking them to memorise the formula.`, `In the geometry workshop, show the "magnetic snap" tip: a new element placed near an existing point connects to that point.`, `The homework questions on radius, diameter and chord preview the next lesson — explain that they are exploration questions.`]))}
      ${spoiler(`Quick answer key by card (the whole lesson in one place)`, `
        <h4>1. Welcome (technical check)</h4><p><strong>Mission:</strong> Turn on the microphone and camera, say name and age. <strong>Answer:</strong> None.</p>
        <h4>2–3. Rafi and Sophie · Mood</h4><p>Meeting the characters and a free mood choice. <strong>Answer:</strong> None.</p>
        <h4>5. Points — warm-up and tools</h4><p>Line segments: the stretched marking rope and the straight edge of the board. Tools: Circle→Compass; Line segment→Ruler; Line→Long ruler; Angle→Protractor; Perpendicular→Set square.</p>
        <h4>6. Line segment, point, line and ray</h4><p>Drawing line segments: for n points, n·(n−1)/2 segments. Quiz: 1) a ray has a starting point; a line has no beginning and no end · 2) [AB starts at A and passes through B · 3) [AB and [BA are different rays · 4) a line has no ends · 5) the beam of a torch.</p>
        <h4>9. Individual activity — Part 1</h4><p>1) Ray · 2) [AB] · 3) False · 4) C · 5) 3 · 6) "A line segment can be measured with a ruler" and "Infinitely many lines can pass through one point".</p>
        <h4>10. Reasoning questions</h4><p>1) 6 · 2) Ray · 3) 10 · 4) 13 cm.</p>`)}
      <p><strong>Lesson closing:</strong> Briefly go over the question that was hardest for the student in the individual activity. Then close the lesson with the reflection and mood questions and remind them about the homework.</p>
      <h3>As a next step, read the tutor notes in every activity of the lesson.</h3>`)) +
    `</div>`
  },

  /* ---------- 2 ---------- */
  { title:`Welcome to the lesson!`, html:
    card('green', pic(P.rafiSophie, `Rafi and Sophie`) + `<h2>Nice to meet you!</h2><h4>These are Rafi and Sophie. They will be with us during the lessons, help us with the activities and explore the world of geometry with us. Little by little, we will get to know them better!</h4>`)
  },

  /* ---------- 3 ---------- */
  { title:`Getting to know you`, html:
    card('blue', `<h2>👋 Nice to meet you!</h2><p>Before we start, tell Sophie and Rafi how you are feeling today.</p>` + pic(P.mood, `Choose how you are feeling`)) +
    quiz('l1-mood', `How are you feeling today?`, [`😄 I'm very excited!`, `🙂 I'm fine and ready to learn!`, `😴 I'm a little sleepy.`, `🤔 I'm curious to see what we'll learn today!`], [0, 1, 2, 3]) +
    `<div id="tn-c2">` +
    tnotes(`
      <p><strong>Duration:</strong> 1 to 2 minutes.</p>
      <p><strong>Card goal:</strong> Build a first emotional connection with the student. The question has no right or wrong answer; every option is equally valid.</p>
      <p><strong>What the tutor should do:</strong> Greet the student, ask them to choose an option and make a short, warm comment about their choice.</p>`) +
    `</div>`
  },

  /* ---------- 4 ---------- */
  { title:`Architecture office`, html:
    pic(P.plan, `Plan of the future school yard`) +
    `<h1>Hello, future architect! 🏛️</h1>
     <blockquote><p><em>City hall gave our office a very important mission: design a modern school yard. It will have sports areas, corners to rest and paths surrounded by green spaces. But no building can start without a detailed plan! Today we will discover all the secrets of architectural drawings. Let's learn to make lines work for us!</em></p></blockquote>` +
    tnotes(`
      <p><strong>Duration:</strong> 2 minutes.</p>
      <p><strong>Card goal:</strong> Introduce the story and the student's role as the chief architect's assistant.</p>
      <p><strong>What the tutor should do:</strong> Read the text aloud with enthusiasm and expression, and show the student the picture of the yard.</p>`) +
    `<h1>Lesson mission 🎯</h1>
     <p>Turn a tangle of lines into a neat geometric plan: mark out the areas with line segments, draw parallel running tracks and aim the floodlight beams.</p>
     <h3>This week you will learn to:</h3>` +
    ul([`draw and tell apart points, line segments, rays and lines;`, `name them with Latin letters;`, `divide circles into parts!`]) +
    `<h3>⚡ Ready? Let's start!</h3>`
  },

  /* ---------- 5 ---------- */
  { title:`Points`, html:
    pic(P.warmup, `Find the line segment`, '80%') +
    `<h1>How about a warm-up first? 🔍</h1>
     <h3>Look at the 4 objects on the building site. Which of them are line segments?</h3>` +
    quiz('l1-warmup', `Select the objects that are line segments.`, [`A marking rope stretched between two stakes`, `A winding path in the park`, `The straight edge of a wooden board`, `Smoke coming out of the site hut's chimney`], [0, 2], true) +
    tnotes(`
      <p><strong>Duration:</strong> 2 minutes.</p>
      <p><strong>Card goal:</strong> Get the student's attention before the theory and spark their intuition about straight lines.</p>
      <p><strong>What the tutor should do:</strong> Let the student choose the answers alone. Don't give hints before checking the answers.</p>
      <p><strong>Points of attention:</strong> The right answers are the rope and the edge of the board. Both are straight and limited by two points.</p>`) +
    pic(P.toolbox, `The architect's toolkit`, '35%') +
    `<h1>Check your toolkit ✅</h1><h3>Match each geometric figure with the tool you need to draw it.</h3>` +
    group([[`Circle`, `Compass`], [`Line segment`, `Ruler`], [`Line (long line)`, `Long ruler`], [`Angle`, `Protractor`], [`Perpendicular line`, `Set square`]]) +
    tnotes(`
      <p><strong>Duration:</strong> 3 minutes.</p>
      <p><strong>Card goal:</strong> Connect geometric ideas with tools before the theory starts.</p>
      <p><strong>What the tutor should do:</strong> Let the student match them alone. The protractor and the set square are used later; no need to explain them in detail now.</p>`)
  },

  /* ---------- 6 ---------- */
  { title:`Line segment`, html:
    pic(P.intuition, `A wall, the edge of a plot and a floodlight beam`, '85%') +
    `<h1>How would you show this in a drawing? 🤔</h1>
     <blockquote><p><em>Rafi: «Look! Here is the wall of a building, there is the edge of a plot that goes on forever, and here is the beam of a floodlight. They all look like lines, but they are very different! How can an architect draw each of them correctly?»</em></p></blockquote>
     <h1>The alphabet of geometric drawing 📐</h1>
     <div class="example"><h3>🎓 Point</h3><p>Shows an exact position in the drawing. It is named with a capital Latin letter, such as A.</p></div>
     <div class="example"><h3>🎓 Line segment</h3><p>Part of a line limited by two points. It has a definite length. It is written with square brackets: [AB].</p></div>
     <h4>Draw as many line segments as you can between the points. How many line segments did you draw?</h4>
     <p class="sim-note">In the real lesson, the student uses a ruler that turns green when it lines up with two points. In this simulation: drag from one point to another (or click two points).</p>` +
    segApp() +
    `<p>How many line segments did you draw?</p>` + inputEx('seg-count', '15') +
    `<div class="example"><h3>🎓 Line</h3><p>A line with no beginning and no end is called a line. It goes on forever in both directions. It is written AB.</p></div>
     <div class="example"><h3>🎓 Ray</h3><p>A line that starts at a point but has no end is called a ray. The starting point is always written first! It is written [AB.</p></div>
     <h2>Find the difference between a ray and a line 🔍</h2>` +
    quiz('l1-t1', `1. What is the difference between a ray and a line?`, [`A ray is shorter than a line`, `A ray has a starting point, while a line has no beginning and no end`, `A ray is always straight, while a line is not`, `There is no difference, they are the same figure`], [1]) +
    quiz('l1-t2', `2. Look at the notation [AB. How do we read it correctly?`, [`A ray starting at point B and passing through point A`, `A ray starting at point A and passing through point B`, `A line segment between points A and B`, `A line through points A and B`], [1]) +
    quiz('l1-t3', `3. The rays [AB and [BA:`, [`Are the same figure, just written differently`, `Are two different rays going in opposite directions`, `Are not rays, they are lines`, `This notation does not exist`], [1]) +
    `<h3>✅ Check what you learned</h3>` +
    ul([`a line segment has two ends;`, `a ray has a starting point but no end;`, `a line has no beginning and no end;`, `the first letter of a ray's notation is its starting point.`])
  },

  /* ---------- 7 (graded) ---------- */
  { title:`✍️ Individual activity!`, html:
    card('blue', pic(P.practice, ``) + `<h2>Let's practise!</h2><p>This is an individual activity. Remember everything you learned in the lesson. Good luck!</p>`) +
    `<h1>Individual activity, part 1: Point, line segment, ray and line</h1>` +
    quiz('sr1-q01', `What is the name of the figure that starts at a point but has no end?`, [`Line segment`, `Ray`, `Line`, `Point`], [1]) +
    quiz('sr1-q02', `Points A and B are marked on a line. Which notation shows the line segment between them?`, [`AB`, `[AB`, `[AB]`], [2]) +
    quiz('sr1-q03', `Is the statement "A line has a beginning but no end" true?`, [`True`, `False`], [1]) +
    quiz('sr1-q05', `At which point does the ray [CD start?`, [`C`, `D`, `A ray has no starting point`], [0]) +
    `<p><strong>Three points, K, L and M, are marked on a line. How many different line segments can you draw by joining these points two by two?</strong></p>` +
    inputEx('sr1-q06', '3') +
    quiz('sr1-q07', `Select all the TRUE statements.`, [`A line segment can be measured with a ruler.`, `A line has a length that can be measured.`, `Infinitely many lines can pass through one point.`, `[AB and [BA are the same ray.`], [0, 2], true) +
    scoreBox() +
    `<div id="tn-seg">` +
    tnotes(`
      <p>✍️ <strong>Individual activity · graded · automatic check.</strong> <strong>Duration:</strong> 11 minutes (part 1 + reasoning questions).</p>
      <p><strong>What the tutor should do:</strong> The student answers alone, in their own copy of the card. Don't give hints before the first attempt. If the student makes a mistake, take them back to the theory card (Line segment) instead of giving the answer.</p>
      <p><strong>Answer key:</strong> 1) Ray · 2) [AB] · 3) False · 4) C · 5) 3 · 6) the first and the third statements.</p>`) +
    `</div>`
  }
];

/* =========================================================
   GUIDED TOUR STEPS
   ========================================================= */
CONTENT.guide = [
  { title: 'Welcome to Classroom', next: true,
    text: 'In Levels 5–7, everything you need to run the lesson is in Classroom, <b>inside the lesson itself</b>: the interactive cards and the guidance for the tutor.<br><br>In this guide we use the first cards of a real lesson: <b>Math Adventures Level 5, Lesson 1</b>. Let\'s open the cards.' },
  { title: 'Open the lesson materials', target: '.tb-group', accept: ['openTasks', 'toggleDropdown'],
    text: 'The lesson materials are in <b>Assignments</b>. Click the <b>Assignments</b> button — it turns blue when you hover over it.' },
  { title: 'Choose the first card', target: '#dd-0', accept: ['pickActivity:0'],
    text: 'This is the list of the lesson\'s <b>cards</b> (assignments), in the order they happen. It is the first lesson of Level 5: Rafi and Sophie\'s architecture office is designing a <b>school yard</b>.<br><br>Click the first one: <b>«Welcome!»</b>.' },
  { title: 'Two views of the same card', next: true, wide: true,
    text: 'Before you go on, it is important to understand <b>what you see</b> and <b>what Ana sees</b>. You are on the same card, but not on the same screen:' +
      `<div class="views">
        <div class="view"><div class="vh">👩‍🏫 What <b>you</b> see</div>
          <div class="mock"><div class="mk-c">Card content</div><div class="m-tn">Teacher notes<small>only you see it</small></div></div></div>
        <div class="view"><div class="vh">🧒 What <b>Ana</b> sees</div>
          <div class="mock"><div class="mk-c">Card content</div></div></div>
      </div>` +
      '<ul class="c-list"><li>The <b>Teacher notes</b> appear in a block with an <b>orange dashed border</b> inside the card. Only the tutor sees this block — Ana <b>never</b> sees it. Don\'t read the notes aloud.</li><li>The first card also has the <b>Slide for the tutor</b>: the full lesson briefing.</li><li>Every card has its own notes: they are the first place to look before and during each card.</li></ul>' },
  { title: 'What Ana sees', target: '#taskScroll', side: true, read: {},
    text: 'Most of the card is what Ana sees: the park picture, the mission (turn on the microphone and camera, say name and age) and the checklist, with help for microphone and camera problems.<br><br>Scroll <b>the whole card</b> to the end. At the bottom there is a part only you can see.' },
  { title: 'Teacher notes and the Slide for the tutor', target: '#taskScroll', side: true, read: { scope: '#tn-first' }, scrollTo: 'tn-first',
    text: 'The <b>Teacher notes</b> block holds the short notes for this card: goal, what to do and points of attention.<br><br>The <b>Slide for the tutor</b> is the most complete briefing of the lesson: story, main goal, expected outcomes, a <b>video guide</b>, your role, the <b>timing</b> (60 min), the methodological approach, the <b>points of attention</b> and an <b>answer key for every card</b>.<br><br>Watch the video while you prepare the lesson.<br><br>To continue, <b>open every section</b> and <b>scroll to the end of the notes</b>.' },
  { title: 'Turn on Lead the group', target: '#leadToggle', accept: ['toggleLead'],
    text: 'Now turn on the <b>Lead the group</b> switch. Only you have this switch — the student doesn\'t.' +
      `<div class="lead-demo">
        <div><span class="ld-sw"></span><b>OFF</b> — Even if you change card or scroll, Ana stays where she is. She may be looking at something else.</div>
        <div><span class="ld-sw on"></span><b>ON</b> — Ana sees the same card you open and follows your scrolling.</div>
      </div>` +
      'Click the switch — it turns blue when it is on.' },
  { title: 'Ana is following you', target: '.vt.student', next: true,
    text: '<b>Lead the group</b> is on ✅ Look at Ana\'s tile: it now says <b>Following the tutor</b>.<br><br>From now on:<ul class="c-list"><li>Ana sees the <b>same card</b> as you and the same scroll position (without the Teacher notes).</li><li>She can click <b>Work independently</b> to explore alone. Then she sees a notice and a <b>Return</b> button.</li></ul>' },
  { title: 'Next card', target: '#btnNext', accept: ['nextTask'],
    text: 'The right arrow takes you to the <b>next card</b>. Because Lead the group is on, Ana moves with you. Click it.' },
  { title: 'A card just for the student', target: '#taskScroll', side: true, read: {},
    text: 'This card introduces Rafi and Sophie. It has <b>no Teacher notes</b>: not every card needs guidance, and that is fine.<br><br>Read the card with Ana and scroll to the end.' },
  { title: 'Keep going', target: '#btnNext', accept: ['nextTask'],
    text: 'Click <b>Next card</b> to continue.' },
  { title: 'The notes on every card', target: '#taskScroll', side: true, read: { scope: '#tn-c2' },
    text: 'This card is the mood question: every answer is right and there are no points.<br><br>At the bottom is this card\'s <b>Teacher notes</b> block, always in the same format: <b>Duration</b> · <b>Card goal</b> · <b>What the tutor should do</b> · and sometimes <b>Points of attention</b>.<br><br>Scroll to the end of the notes.' },
  { title: 'Open the list of cards', target: '#btnList', accept: ['toggleDropdown'],
    text: 'Now let\'s go to the <b>individual activity</b>. You don\'t have to go card by card: from the list you can jump to any card.<br><br>Click the <b>list icon</b> next to <b>Assignments</b>.' },
  { title: 'Choose the individual activity', target: '#dd-6', accept: ['pickActivity:6'],
    text: 'Click <b>«✍️ Individual activity!»</b>. Lead the group is on: Ana moves to this card too.' },
  { title: 'Cards with automatic checking', target: '#taskScroll', side: true, read: {}, checks: ['answer'],
    text: 'This is a <b>graded card</b>: the answers are <b>checked automatically</b> and every right answer gives points.<br><br><b>Important:</b> Ana answers <b>in her own copy</b> of the card, on her own. The system checks it and records her score. If the card is solved only on <b>your</b> screen, Ana\'s score is <b>0</b>.<br><br>Try it: answer a question and check it with «Send». Then scroll to the end of the card.' },
  { title: 'The notes of the graded card', target: '#taskScroll', side: true, read: { scope: '#tn-seg' }, last: true, btn: 'Finish ✓',
    text: 'The notes of graded cards give the time, what to do and the <b>answer key</b>.<br><br>On these cards:<ul class="c-list"><li><b>Don\'t give hints</b> or the answer before the first attempt.</li><li>If Ana makes a mistake, take her back to the <b>theory card</b> (here: «Line segment»).</li><li>Check that she answered <b>in her own copy</b>.</li></ul>Scroll to the end of the notes. That is what you need to know about the lesson format!' }
];

/* =========================================================
   FINISH SCREEN
   ========================================================= */
CONTENT.finish = {
  kicker: 'Guide complete',
  title: '🎓 This is how a Levels 5–7 lesson works in Classroom',
  intro: 'You have seen how a lesson looks in Classroom and how to lead the student:',
  steps: [
    'The lesson is a sequence of <b>cards</b> in <b>Assignments</b>: all the guidance is inside the lesson.',
    'The <b>Teacher notes</b> are in the dashed block of each card and only <b>you</b> see them. The student never does.',
    'The <b>Slide for the tutor</b> on the first card is the full briefing: goals, timing, points of attention, answer key and a video guide.',
    '<b>Lead the group</b> makes the student follow the card you open and your scrolling.',
    '✍️ <b>Graded cards</b> are solved by the student in their own copy and checked automatically. If they are solved only on your screen, the student\'s score is 0.'
  ],
  tip: '<b>Tip:</b> <b>before</b> you teach, read the Teacher notes of every card and watch the video guide in the Slide for the tutor.',
  doneLabel: '✅ Simulation complete',
  doneHint: 'The training has been told: you can go back to it. If you like, keep exploring Classroom freely.',
  again: '↺ Start again',
  explore: 'Explore Classroom'
};

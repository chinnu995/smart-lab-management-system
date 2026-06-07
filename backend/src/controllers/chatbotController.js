const db = require('../config/db');
const { generateChatbotResponse } = require('../services/aiProvider');

const INTENTS = [
  { name: 'attendance', kw: ['attendance','percentage','my attendance'] },
  { name: 'free_lab',   kw: ['free lab','available lab','which lab is free'] },
  { name: 'timetable',  kw: ['timetable','schedule','classes today'] },
  { name: 'book_lab',   kw: ['book','reserve','book a lab'] },
  { name: 'complaint',  kw: ['complaint','raise issue','problem'] },
  { name: 'help',       kw: ['help','hi','hello'] },
];

function detect(q) {
  const t = q.toLowerCase();
  for (const i of INTENTS) if (i.kw.some(k => t.includes(k))) return i.name;
  return 'unknown';
}

exports.ask = async (req, res) => {
  const { query } = req.body;
  const intent = detect(query || '');
  let reply = '';
  let usedAI = false;

  try {
    // 1. Fetch live database context
    const [labs] = await db.execute("SELECT lab_name, status, location, capacity FROM labs");
    const [equip] = await db.execute("SELECT name, category, status FROM equipment");
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = days[new Date().getDay()];
    const [timetable] = await db.execute(
      `SELECT t.subject, t.start_time, t.end_time, l.lab_name 
       FROM timetable t 
       JOIN labs l ON l.lab_id=t.lab_id 
       WHERE t.day_of_week=? LIMIT 10`, 
      [today]
    );
    const [anns] = await db.execute(
      "SELECT title, content, category, created_at FROM announcements ORDER BY created_at DESC LIMIT 5"
    );

    let studentContext = '';
    if (req.user && req.user.role === 'student') {
      const [s] = await db.execute('SELECT student_id, usn, department, semester, section FROM students WHERE user_id=?', [req.user.id]);
      if (s.length) {
        const [att] = await db.execute(
          `SELECT ROUND(SUM(status='present')*100/COUNT(*),2) AS pct FROM attendance WHERE student_id=?`,
          [s[0].student_id]
        );
        studentContext = `Student Info: Name is ${req.user.name}, USN is ${s[0].usn}, Semester ${s[0].semester}, Section ${s[0].section}, Department ${s[0].department}. Overall attendance percentage: ${att[0]?.pct || 0}%.`;
      }
    } else if (req.user) {
      studentContext = `User Info: Name is ${req.user.name}, Role is ${req.user.role}.`;
    }

    // 2. Build system prompt
    const systemPrompt = `You are the Smart Lab Management System AI Assistant.
You have access to the following live database state:
- Labs in the college: ${JSON.stringify(labs)}
- Equipment available: ${JSON.stringify(equip)}
- Timetable/scheduled lab sessions for today (${today}): ${JSON.stringify(timetable)}
- Recent announcements: ${JSON.stringify(anns)}
- Logged-in User Context: ${studentContext}

Strict Assistant Instructions:
1. **Scope Restriction**: ONLY answer questions directly related to the college labs, equipment, timetables, bookings, announcements, complaints, and user profiles. Do NOT answer general knowledge, general programming, coding advice, algorithm designs, debugging requests, or conceptual computer science questions (e.g. do not explain concepts like "what is a stack" or "how to write a loop"). If asked a general or conceptual question, reply politely but directly stating that you can only assist with lab system actions, schedules, and lab status.
2. **Direct and Concise Answers**: Provide extremely direct, brief, and straight-to-the-point answers. Do not write introductory filler or long explanatory paragraphs. Cut out any conceptual details.
3. **Accurate DB Querying**: Answer the user's question accurately using the live database context provided above.
4. **Navigation & System Rules**: Guide users to the correct navigation sections (Lab Bookings, Complaints, Announcements, My Tests) and explain rules directly (e.g. "Attendance must be above 75% or alerts are sent to parents").`;

    // 3. Try to call Gemini
    reply = await generateChatbotResponse(systemPrompt, query);
    usedAI = true;
  } catch (err) {
    console.error('Gemini chatbot error, falling back to rule-based parser:', err.message);
    
    // Fallback rule-based logic
    try {
      if (intent === 'attendance' && req.user.role === 'student') {
        const [s] = await db.execute('SELECT student_id FROM students WHERE user_id=?', [req.user.id]);
        if (s.length) {
          const [p] = await db.execute(
            `SELECT ROUND(SUM(status='present')*100/COUNT(*),2) AS pct FROM attendance WHERE student_id=?`,
            [s[0].student_id]
          );
          reply = `Your overall attendance is ${p[0]?.pct || 0}%.`;
        } else reply = 'I could not find your student record.';
      } else if (intent === 'free_lab') {
        const [labs] = await db.execute("SELECT lab_name FROM labs WHERE status='available'");
        reply = labs.length ? `Available labs: ${labs.map(l=>l.lab_name).join(', ')}.` : 'No labs are free right now.';
      } else if (intent === 'timetable') {
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = days[new Date().getDay()];
        const [rows] = await db.execute(
          `SELECT t.subject, t.start_time, t.end_time, l.lab_name
             FROM timetable t JOIN labs l ON l.lab_id=t.lab_id
             WHERE t.day_of_week=? LIMIT 10`, [today]
        );
        reply = rows.length
          ? `Today's sessions:\n` + rows.map(r => `• ${r.subject} (${r.start_time}-${r.end_time}) in ${r.lab_name}`).join('\n')
          : 'No classes scheduled today.';
      } else if (intent === 'book_lab')  reply = 'Open the "Book Lab" page and pick a date, time and lab.';
      else if (intent === 'complaint')   reply = 'Go to Complaints → "Raise Complaint" to submit your issue.';
      else if (intent === 'help')        reply = 'Hi! Try: "Show my attendance", "Which lab is free?", "Today\'s schedule".';
      else reply = "Sorry, I'm having trouble connecting to my brain right now. Try asking about attendance, free labs, or today's schedule.";
    } catch (fallbackErr) {
      reply = 'Sorry, something went wrong: ' + fallbackErr.message;
    }
  }

  // 4. Log the chatbot interaction
  try {
    await db.execute(
      'INSERT INTO chatbot_logs (user_id, user_query, bot_reply, intent) VALUES (?,?,?,?)',
      [req.user ? req.user.id : null, query, reply, usedAI ? 'AI_GENERATED' : intent]
    );
  } catch (e) {
    console.error('Failed to log chatbot query:', e.message);
  }

  res.json({ intent: usedAI ? 'AI_GENERATED' : intent, reply });
};

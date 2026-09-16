const db = require('../config/db');
const { generateChatbotResponse } = require('../services/aiProvider');

function detect(q) {
  const t = (q || '').toLowerCase();
  
  // Attendance & Typos (e.g. atte ndence, atendance, percentage, present, absent, my attendance)
  if (/att|atnd|percent|present|absent|pct|bunk|score|marks/i.test(t) || t.includes('atte')) return 'attendance';
  
  // Free labs (e.g. free lab, available lab, vacant lab, empty lab)
  if (/free|avail|vacant|empty|open lab/i.test(t)) return 'free_lab';
  
  // Timetable & Schedule (e.g. timetable, schedule, class, today, routine, timing)
  if (/time|sched|class|today|routine|timing/i.test(t)) return 'timetable';
  
  // Book lab (e.g. book, reserve, slot)
  if (/book|reserv|slot/i.test(t)) return 'book_lab';
  
  // Complaint (e.g. complaint, issue, problem, broken, damage, repair)
  if (/complain|issue|problem|broken|damage|repair|fault/i.test(t)) return 'complaint';
  
  // Announcements (e.g. announcement, notice, circular, news, update)
  if (/announc|notice|circular|news|update/i.test(t)) return 'announcement';
  
  // Equipment (e.g. equipment, pc, computer, monitor, hardware, device)
  if (/equip|pc|computer|monitor|hardware|device/i.test(t)) return 'equipment';
  
  // Tests (e.g. test, exam, quiz, mcq)
  if (/test|exam|quiz|mcq/i.test(t)) return 'tests';
  
  // Help / Greetings
  if (/hi|hello|hey|help|zira|assistant|who/i.test(t)) return 'help';
  
  return 'unknown';
}

exports.ask = async (req, res) => {
  const { query } = req.body;
  const intent = detect(query || '');
  let reply = '';
  let usedAI = false;

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
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
            `SELECT ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),2) AS pct FROM attendance WHERE student_id=?`,
            [s[0].student_id]
          );
          studentContext = `Student Info: Name is ${req.user.name}, USN is ${s[0].usn}, Semester ${s[0].semester}, Section ${s[0].section}, Department ${s[0].department}. Overall attendance percentage: ${att[0]?.pct || 0}%.`;
        }
      } else if (req.user) {
        studentContext = `User Info: Name is ${req.user.name}, Role is ${req.user.role}.`;
      }

      // 2. Build system prompt
      const systemPrompt = `You are Zira, the Smart Lab Management System AI Assistant.
You have access to the following live database state:
- Labs in the college: ${JSON.stringify(labs)}
- Equipment available: ${JSON.stringify(equip)}
- Timetable/scheduled lab sessions for today (${today}): ${JSON.stringify(timetable)}
- Recent announcements: ${JSON.stringify(anns)}
- Logged-in User Context: ${studentContext}

Strict Assistant Instructions:
1. **Scope Restriction**: ONLY answer questions directly related to college labs, equipment, timetables, bookings, announcements, complaints, attendance, tests, and user profiles.
2. **Direct and Concise Answers**: Provide direct, friendly, and straight-to-the-point answers.
3. **Accurate DB Querying**: Answer accurately using the live database context provided above.
4. **Navigation & System Rules**: Guide users to the correct sections (Lab Bookings, Complaints, Announcements, My Tests).`;

      reply = await generateChatbotResponse(systemPrompt, query);
      usedAI = true;
    } catch (aiErr) {
      console.warn('Gemini chatbot error, using intelligent rule-based engine:', aiErr.message);
    }
  }

  // Fallback intelligent rule-based logic (runs if AI is missing or failed)
  if (!usedAI) {
    try {
      if (intent === 'attendance') {
        if (req.user && req.user.role === 'student') {
          const [s] = await db.execute('SELECT student_id FROM students WHERE user_id=?', [req.user.id]);
          if (s.length) {
            const [p] = await db.execute(
              `SELECT 
                 COUNT(*) as total,
                 SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present_count,
                 ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),2) AS pct 
               FROM attendance WHERE student_id=?`,
              [s[0].student_id]
            );
            const pct = p[0]?.pct !== null && p[0]?.pct !== undefined ? parseFloat(p[0].pct) : 0;
            const total = p[0]?.total || 0;
            const present = p[0]?.present_count || 0;

            const statusText = pct >= 75 
              ? ' Great job! Your attendance is above the required 75% threshold.' 
              : ' Warning: Your attendance is below 75%. Please ensure you attend upcoming classes to avoid parent notifications.';

            reply = `Your overall attendance is ${pct}% (${present}/${total} sessions attended).${statusText}`;
          } else {
            reply = 'I could not find your student profile record.';
          }
        } else {
          reply = 'As a Faculty/HOD, you can view and mark student attendance under the Attendance & Analytics dashboard.';
        }
      } else if (intent === 'free_lab') {
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = days[new Date().getDay()];
        const currentTime = new Date().toTimeString().split(' ')[0];
        
        const [labs] = await db.execute(`
          SELECT l.lab_name, l.location, l.capacity 
          FROM labs l 
          WHERE l.status = 'available'
            AND l.lab_id NOT IN (
              SELECT lab_id FROM timetable 
              WHERE day_of_week = ? AND start_time <= ? AND end_time >= ?
            )
        `, [today, currentTime, currentTime]);
        
        if (labs.length) {
          reply = `Currently available free labs:\n` + 
                  labs.map(l => `• ${l.lab_name} (${l.location || 'Main Block'}, Capacity: ${l.capacity || 30})`).join('\n');
        } else {
          const [allAvail] = await db.execute("SELECT lab_name, location FROM labs WHERE status='available'");
          reply = allAvail.length 
            ? `Available labs in system: ${allAvail.map(l => l.lab_name).join(', ')}. Please check timetable for scheduled class hours.`
            : 'No labs are currently free.';
        }
      } else if (intent === 'timetable') {
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = days[new Date().getDay()];
        const [rows] = await db.execute(
          `SELECT t.subject, t.start_time, t.end_time, l.lab_name
             FROM timetable t JOIN labs l ON l.lab_id=t.lab_id
             WHERE t.day_of_week=? 
             ORDER BY t.start_time ASC LIMIT 10`, [today]
        );
        reply = rows.length
          ? `Today's (${today}) Schedule:\n` + rows.map(r => `• ${r.subject} (${r.start_time} - ${r.end_time}) in ${r.lab_name}`).join('\n')
          : `No lab classes are scheduled for today (${today}). You can reserve a free lab if needed!`;
      } else if (intent === 'book_lab') {
        reply = 'To reserve a lab, navigate to "Book Lab" from the sidebar menu, select your preferred date, time slot, and lab, then submit your request.';
      } else if (intent === 'complaint') {
        reply = 'To report faulty equipment or lab issues, go to Complaints → "Raise Complaint" and submit details. Faculty & HOD will review and resolve it.';
      } else if (intent === 'announcement') {
        const [anns] = await db.execute("SELECT title, category, created_at FROM announcements ORDER BY created_at DESC LIMIT 5");
        reply = anns.length 
          ? `Recent Lab Announcements:\n` + anns.map(a => `• [${a.category.toUpperCase()}] ${a.title}`).join('\n')
          : 'No active announcements at this time.';
      } else if (intent === 'equipment') {
        const [eq] = await db.execute("SELECT name, category, status FROM equipment");
        const working = eq.filter(e => e.status === 'working').length;
        reply = `Equipment Summary: ${working} working equipment items available out of ${eq.length} total items.`;
      } else if (intent === 'tests') {
        if (req.user && req.user.role === 'student') {
          const [s] = await db.execute('SELECT student_id FROM students WHERE user_id=?', [req.user.id]);
          const studentId = s[0]?.student_id || 0;
          const [tests] = await db.execute(
            `SELECT t.subject, t.duration_minutes 
             FROM tests t
             LEFT JOIN test_submissions ts ON ts.test_id = t.test_id AND ts.student_id = ?
             WHERE t.status = 'active' AND ts.submission_id IS NULL`,
            [studentId]
          );
          reply = tests.length
            ? `You have ${tests.length} pending MCQ test(s): ` + tests.map(t => `${t.subject} (${t.duration_minutes}m)`).join(', ') + `. Head to "My Tests" to complete them!`
            : 'You have no pending active tests.';
        } else {
          reply = 'HOD and Faculty can generate new MCQ tests powered by AI under "Tests".';
        }
      } else if (intent === 'help') {
        reply = 'Hi! I am Zira, your Smart Lab Assistant. Ask me about:\n• "Show my attendance"\n• "Which lab is free?"\n• "Today\'s schedule"\n• "Raise a complaint" or "Book a lab"';
      } else {
        reply = "I can assist you with lab management tasks! Try asking:\n• 'Show my attendance'\n• 'Which lab is free?'\n• 'Today's timetable schedule'\n• 'Book a lab' or 'Recent announcements'";
      }
    } catch (fallbackErr) {
      console.error('Chatbot error:', fallbackErr);
      reply = 'Sorry, something went wrong while processing your request. Please try again.';
    }
  }

  // Log chatbot interaction
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


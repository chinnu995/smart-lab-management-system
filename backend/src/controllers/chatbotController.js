const db = require('../config/db');
const { generateChatbotResponse } = require('../services/aiProvider');

// Detect intent matching Zira's defined scope & casual chit-chat
function detectIntent(q) {
  const t = (q || '').toLowerCase().trim();

  // Explicit check for coding / programming requests (writing code, solving, debugging, syntax, general programming)
  const isCodingRequest = (
    /(write|generate|create|build|solve|explain|debug|fix)\s+.*(code|program|script|function|algorithm|class|python|java|c\+\+|c\s+code|html|css|javascript|js|sql|react|node)/i.test(t) ||
    /how\s+to\s+(code|program|write\s+code|solve|implement)/i.test(t) ||
    /what\s+is\s+(recursion|pointer|array|linked\s*list|stack|queue|oop|class|interface|decorator|variable|loop|function|inheritance|polymorphism)/i.test(t) ||
    /(code|program|script|solution|algorithm)\s+(for|to|that)/i.test(t) ||
    /write\s+a\s+(python|java|c|c\+\+|js|html|css|sql|script|program|code)/i.test(t) ||
    /syntax\s+of|example\s+of\s+code|coding\s+solution/i.test(t)
  );

  const isLabCodingQuery = (
    /(my|active|upcoming|schedule|score|result|date|time)\s+.*coding/i.test(t) ||
    /coding\s+test\s+(score|result|schedule|date|time|status|arena)/i.test(t) ||
    /coding\s+arena/i.test(t)
  );

  if (isCodingRequest && !isLabCodingQuery) {
    return 'out_of_scope_coding';
  }

  // Out of scope check for general knowledge, trivia, math solving, recipes, news, weather, etc.
  if (/capital of|who is the president|who is prime minister|weather|tell me a joke|solve x\^2|solve math|who won|recipe|story|poem|essay|history|geography|general knowledge|tell me about|how to cook|movie|music|song|currency|continent/i.test(t)) {
    return 'out_of_scope_general';
  }

  // 1. Attendance & 75% threshold
  if (/att|atnd|present|absent|pct|percent|bunk|threshold|75|eligib|attendance history/i.test(t) || t.includes('atte')) {
    return 'attendance';
  }

  // 2. Free Labs & Occupancy
  if (/free|avail|vacant|empty|open lab|occupan|suggest lab|slot/i.test(t)) {
    return 'free_labs';
  }

  // 3. Lab Manuals & Experiments
  if (/manual|pdf|experiment|step|download manual|read manual|guide/i.test(t)) {
    return 'lab_manuals';
  }

  // 4. Coding Arena / Coding Lab Tests (Lab System only)
  if (/coding|hacker|ide|code test|proctored|compiler/i.test(t)) {
    return 'coding_tests';
  }

  // 5. MCQ Tests & Syllabus
  if (/mcq|quiz|test|exam|syllab|weak|score|past score/i.test(t)) {
    return 'mcq_tests';
  }

  // 6. Toppers & Ranks
  if (/topper|rank|rankings|first place|leaderboard|position/i.test(t)) {
    return 'toppers';
  }

  // 7. Complaints
  if (/complain|issue|broken|damage|repair|fault|status of complaint|raise complaint|file complaint/i.test(t)) {
    return 'complaints';
  }

  // 8. Announcements
  if (/announc|notice|circular|news|update|event|exam notice/i.test(t)) {
    return 'announcements';
  }

  // 9. Polite Expressions & Appreciations ("thank you", "thanks", "bye")
  if (/thanks|thank you|goodbye|bye|see ya|take care/i.test(t)) {
    return 'casual_polite';
  }

  // 10. Help / Basic Greetings ("hello", "hi", "hey", "good morning", "zira", "help")
  if (/hi|hello|hey|greetings|good morning|good afternoon|good evening|zira|who are you|help|assistant/i.test(t)) {
    return 'greeting';
  }

  return 'casual_general';
}

exports.ask = async (req, res) => {
  const { query } = req.body;
  const user = req.user;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const intent = detectIntent(query || '');

  let reply = '';
  let usedAI = false;

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  // Direct Refusal for Coding requests & General Knowledge requests (Skip AI to guarantee strict enforcement)
  if (intent === 'out_of_scope_coding') {
    reply = `I am strictly an AI Assistant for the Smart Lab Management System. I cannot write code, solve programming problems, or answer general coding questions. Please ask me about your lab attendance, free lab availability, lab manuals, test schedules & scores, complaints, or announcements!`;
    return res.json({ intent, reply });
  }

  if (intent === 'out_of_scope_general') {
    reply = `I am strictly an AI Assistant for the Smart Lab Management System. I cannot answer general knowledge queries, general conversation, or non-lab tasks. Please ask me about your lab attendance, free lab availability, lab manuals, test schedules & scores, complaints, or announcements!`;
    return res.json({ intent, reply });
  }

  // Gather live database context across Zira's lab scope areas
  let liveContext = {
    user: { name: user?.name, role: user?.role, id: user?.id },
    studentProfile: null,
    attendanceSummary: null,
    attendanceBySubject: [],
    availableLabsToday: [],
    todaySchedule: [],
    labManuals: [],
    activeCodingTests: [],
    pastCodingScores: [],
    activeMcqTests: [],
    pastMcqScores: [],
    overallToppers: [],
    filedComplaints: [],
    recentAnnouncements: []
  };

  try {
    if (user && user.role === 'student') {
      const [s] = await db.execute('SELECT student_id, usn, department, semester, section FROM students WHERE user_id=?', [user.id]);
      if (s.length) {
        const studentId = s[0].student_id;
        liveContext.studentProfile = { ...s[0], name: user.name };

        // Overall Attendance & 75% threshold calculation
        const [attOverall] = await db.execute(
          `SELECT COUNT(*) as total,
                  SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
                  SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent,
                  ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),2) AS pct
             FROM attendance WHERE student_id=?`,
          [studentId]
        );
        const total = Number(attOverall[0]?.total || 0);
        const present = Number(attOverall[0]?.present || 0);
        const absent = Number(attOverall[0]?.absent || 0);
        const pct = Number(attOverall[0]?.pct || 0);
        const neededFor75 = pct < 75 ? Math.max(0, Math.ceil((0.75 * total - present) / 0.25)) : 0;
        liveContext.attendanceSummary = { total, present, absent, pct, neededFor75 };

        // Subject-wise Attendance
        const [attSubj] = await db.execute(
          `SELECT subject,
                  COUNT(*) as total,
                  SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
                  ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),2) AS pct
             FROM attendance WHERE student_id=? GROUP BY subject`,
          [studentId]
        );
        liveContext.attendanceBySubject = attSubj.map(r => ({
          subject: r.subject || 'General',
          total: Number(r.total || 0),
          present: Number(r.present || 0),
          pct: Number(r.pct || 0)
        }));

        // Past MCQ scores
        const [mcqScores] = await db.execute(
          `SELECT t.title, t.subject, ts.score, ts.total_questions, ts.percentage, ts.created_at
             FROM test_submissions ts JOIN tests t ON t.test_id=ts.test_id
             WHERE ts.student_id=? ORDER BY ts.created_at DESC LIMIT 5`,
          [studentId]
        );
        liveContext.pastMcqScores = mcqScores;

        // Past Coding scores
        const [codeScores] = await db.execute(
          `SELECT ct.title, ct.subject, cs.score, cs.total_score, cs.created_at
             FROM coding_submissions cs JOIN coding_tests ct ON ct.test_id=cs.test_id
             WHERE cs.student_id=? ORDER BY cs.created_at DESC LIMIT 5`,
          [studentId]
        );
        liveContext.pastCodingScores = codeScores;

        // Student's filed complaints
        const [cList] = await db.execute(
          `SELECT c.title, c.description, c.status, c.resolution_notes, c.created_at, l.lab_name
             FROM complaints c LEFT JOIN labs l ON l.lab_id=c.lab_id
             WHERE c.raised_by=? ORDER BY c.created_at DESC LIMIT 5`,
          [user.id]
        );
        liveContext.filedComplaints = cList;
      }
    }

    // General context (Free Labs, Timetable, Manuals, Announcements, Toppers)
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = days[new Date().getDay()];
    const currentTime = new Date().toTimeString().split(' ')[0];

    const [freeLabs] = await db.execute(`
      SELECT l.lab_name, l.location, l.capacity 
      FROM labs l 
      WHERE l.status = 'available'
        AND l.lab_id NOT IN (
          SELECT lab_id FROM timetable 
          WHERE day_of_week = ? AND start_time <= ? AND end_time >= ?
        )
    `, [today, currentTime, currentTime]);
    liveContext.availableLabsToday = freeLabs;

    const [sched] = await db.execute(
      `SELECT t.subject, t.start_time, t.end_time, l.lab_name 
       FROM timetable t JOIN labs l ON l.lab_id=t.lab_id 
       WHERE t.day_of_week=? ORDER BY t.start_time ASC LIMIT 10`, 
      [today]
    );
    liveContext.todaySchedule = sched;

    const [manuals] = await db.execute(
      `SELECT manual_id, title, subject, description, file_url FROM lab_manuals ORDER BY manual_id DESC LIMIT 10`
    );
    liveContext.labManuals = manuals;

    const [codingActive] = await db.execute(
      `SELECT test_id, title, subject, duration_minutes, status, created_at FROM coding_tests WHERE status='active' LIMIT 5`
    );
    liveContext.activeCodingTests = codingActive;

    const [mcqActive] = await db.execute(
      `SELECT test_id, title, subject, duration_minutes, status, created_at FROM tests WHERE status='active' LIMIT 5`
    );
    liveContext.activeMcqTests = mcqActive;

    const [topList] = await db.execute(
      `SELECT u.full_name, s.usn, s.department, s.semester, 
              ROUND(AVG(ts.percentage),2) AS avg_score
         FROM test_submissions ts
         JOIN students s ON s.student_id=ts.student_id
         JOIN users u ON u.user_id=s.user_id
         GROUP BY s.student_id, u.full_name, s.usn, s.department, s.semester
         ORDER BY avg_score DESC LIMIT 5`
    );
    liveContext.overallToppers = topList;

    const [anns] = await db.execute(
      `SELECT title, content, category, created_at FROM announcements ORDER BY created_at DESC LIMIT 5`
    );
    liveContext.recentAnnouncements = anns;

  } catch (dbErr) {
    console.error('Zira context retrieval error:', dbErr.message);
  }

  // Attempt AI response if key is available
  if (apiKey) {
    try {
      const systemPrompt = `You are Zira, the dedicated AI Assistant exclusively for the Smart Lab Management System.

STRICT MANDATORY RULES & BOUNDARIES:
1. EXCLUSIVE SYSTEM SCOPE:
   - You are ONLY permitted to assist with Smart Lab Management System operations: student attendance & 75% threshold, available free labs & occupancy, lab manuals & experiment guides, active lab test schedules (MCQ/Coding tests) & student test scores, toppers leaderboard, complaints tracking/filing, announcements, and lab timetables.
2. NO GENERAL KNOWLEDGE & NO NON-LAB QUERIES:
   - You MUST REFUSE all general knowledge questions, general trivia, weather, recipes, stories, math problems, or non-lab topics.
   - Refusal response: "I am strictly an AI Assistant for the Smart Lab Management System. I cannot answer general knowledge queries or non-lab questions. Please ask me about your lab attendance, free labs, lab manuals, test schedules & scores, complaints, or announcements!"
3. NO CODING / PROGRAMMING GENERATION OR EXPLANATION:
   - You MUST STRICTLY REFUSE to write code, generate scripts, solve programming problems, debug code, or explain coding/computer science concepts or syntax.
   - Exception: You MAY report a student's active coding lab test schedule or past test scores from the live database context.
   - Refusal response: "I am strictly an AI Assistant for the Smart Lab Management System. I cannot write code, solve programming problems, or answer general coding questions. Please ask me about your lab attendance, free labs, lab manuals, test schedules & scores, complaints, or announcements!"
4. TONE:
   - Address the student warmly by their first name (${firstName}). Be polite, concise, and focused strictly on Smart Lab tasks.

LIVE DATABASE CONTEXT:
${JSON.stringify(liveContext, null, 2)}`;

      reply = await generateChatbotResponse(systemPrompt, query);
      usedAI = true;
    } catch (aiErr) {
      console.warn('AI call failed, falling back to Zira rule engine:', aiErr.message);
    }
  }

  // Fallback Zira Rule Engine (runs if AI fails or key is missing)
  if (!usedAI) {
    const att = liveContext.attendanceSummary;
    const attSubj = liveContext.attendanceBySubject;
    const freeLabs = liveContext.availableLabsToday;
    const manuals = liveContext.labManuals;
    const codingActive = liveContext.activeCodingTests;
    const pastCoding = liveContext.pastCodingScores;
    const mcqActive = liveContext.activeMcqTests;
    const pastMcq = liveContext.pastMcqScores;
    const toppers = liveContext.overallToppers;
    const complaints = liveContext.filedComplaints;
    const anns = liveContext.recentAnnouncements;

    if (intent === 'casual_polite') {
      reply = `You're super welcome, ${firstName}! 😊 Always happy to assist with your lab schedules and attendance.`;
    } else if (intent === 'greeting') {
      reply = `Hello ${firstName}! 👋 I'm **Zira**, your dedicated AI Assistant for the Smart Lab Management System. I am specialized strictly for lab-related tasks (attendance, free labs, manuals, test schedules, complaints, announcements). How can I assist you with your labs today?`;
    } else if (intent === 'attendance') {
      if (att) {
        let msg = `Hey ${firstName}! 👋 Here's your attendance breakdown:\n\n### 📊 Attendance Summary\n• **Overall Attendance**: ${att.pct}% (${att.present}/${att.total} sessions attended)\n`;
        if (att.pct < 75) {
          msg += `• ⚠️ **Status**: Below 75% eligibility threshold. You need **${att.neededFor75}** more class(es) to reach 75%.\n`;
        } else {
          msg += `• ✅ **Status**: Above 75% threshold. Great job!\n`;
        }
        if (attSubj.length) {
          msg += `\n**Subject Breakdown**:\n`;
          attSubj.forEach(s => {
            msg += `• **${s.subject}**: ${s.pct}% (${s.present}/${s.total})\n`;
          });
        }
        reply = msg;
      } else {
        reply = `Hey ${firstName}! I couldn't find any attendance records yet. Check the "Attendance" menu in the sidebar for details!`;
      }
    } else if (intent === 'free_labs') {
      if (freeLabs.length) {
        reply = `Hey ${firstName}! 👋 Here are the labs available right now:\n\n### 🧪 Available Free Labs Today\n` + freeLabs.map(l => `• **${l.lab_name}** (${l.location || '2F 01'}, Capacity: ${l.capacity})`).join('\n') + `\n\nTo reserve a slot, head to **Book Lab** in the sidebar!`;
      } else {
        reply = `Hey ${firstName}! Currently all labs are occupied for scheduled classes. Check the **Bookings** menu to request a future slot!`;
      }
    } else if (intent === 'lab_manuals') {
      if (manuals.length) {
        reply = `Hey ${firstName}! 📚 Here are your lab manuals:\n\n` + manuals.map(m => `• **${m.subject || 'Lab'}**: ${m.title} — [Download/View Manual](${m.file_url || '#'})`).join('\n');
      } else {
        reply = `Hey ${firstName}! No lab manuals have been uploaded yet. Check back soon in the **Lab Manuals** menu!`;
      }
    } else if (intent === 'coding_tests') {
      let msg = `Hey ${firstName}! 💻 Here's your Coding Arena update:\n\n`;
      if (codingActive.length) {
        msg += `**Upcoming / Active Coding Tests**:\n` + codingActive.map(t => `• 🚨 **${t.subject}**: ${t.title} (${t.duration_minutes}m)`).join('\n') + `\n\n`;
      }
      if (pastCoding.length) {
        msg += `**Past Test Scores**:\n` + pastCoding.map(s => `• **${s.subject}**: Score ${s.score}/${s.total_score}`).join('\n');
      }
      if (!codingActive.length && !pastCoding.length) {
        msg += `No active coding tests right now. Head to **Coding Lab Tests** to check out practice problems!`;
      }
      reply = msg;
    } else if (intent === 'mcq_tests') {
      let msg = `Hey ${firstName}! 📝 Here's your MCQ Test summary:\n\n`;
      if (mcqActive.length) {
        msg += `**Active Upcoming Tests**:\n` + mcqActive.map(t => `• 📢 **${t.subject}**: ${t.title} (${t.duration_minutes}m)`).join('\n') + `\n\n`;
      }
      if (pastMcq.length) {
        msg += `**Past Test Scores**:\n` + pastMcq.map(s => `• **${s.subject}**: ${s.percentage}% (${s.score}/${s.total_questions})`).join('\n');
      }
      if (!mcqActive.length && !pastMcq.length) {
        msg += `You have no pending MCQ tests right now. Check **MCQ Tests** anytime for practice quizzes!`;
      }
      reply = msg;
    } else if (intent === 'toppers') {
      if (toppers.length) {
        reply = `Hey ${firstName}! 🏆 Here is the current academic leaderboard:\n\n` + toppers.map((t, i) => `${i+1}. **${t.full_name}** (${t.usn}) — ${t.avg_score}% avg`).join('\n') + `\n\nCheck **Overall Toppers** in the sidebar to see detailed rankings!`;
      } else {
        reply = `Hey ${firstName}! Rankings update after test submissions. Check **Overall Toppers** for live leaderboard rankings!`;
      }
    } else if (intent === 'complaints') {
      if (complaints.length) {
        reply = `Hey ${firstName}! ⚠️ Here is the status of your complaints:\n\n` + complaints.map(c => `• **${c.title}** (${c.lab_name || 'Lab'}): Status: **${c.status.toUpperCase()}** ${c.resolution_notes ? `— ${c.resolution_notes}` : ''}`).join('\n') + `\n\nTo raise a new complaint, navigate to **Complaints** $\rightarrow$ **Raise Complaint**.`;
      } else {
        reply = `Hey ${firstName}! You have no active complaints. To report broken equipment or lab issues, tell me the lab name and issue details, or go to **Complaints** in the sidebar!`;
      }
    } else if (intent === 'announcements') {
      if (anns.length) {
        reply = `Hey ${firstName}! 📢 Here are the latest announcements:\n\n` + anns.map(a => `• **[${(a.category||'General').toUpperCase()}]** ${a.title}`).join('\n');
      } else {
        reply = `Hey ${firstName}! No active announcements right now. Check **Announcements** in the sidebar anytime!`;
      }
    } else {
      reply = `I am strictly an AI Assistant for the Smart Lab Management System. I cannot answer general knowledge queries, general conversation, or write code. Please ask me about your lab attendance, free lab availability, lab manuals, test schedules & scores, complaints, or announcements!`;
    }
  }

  // Log chatbot interaction
  try {
    await db.execute(
      'INSERT INTO chatbot_logs (user_id, user_query, bot_reply, intent) VALUES (?,?,?,?)',
      [user ? user.id : null, query, reply, usedAI ? 'ZIRA_AI' : intent]
    );
  } catch (e) {
    console.error('Failed to log Zira query:', e.message);
  }

  res.json({ intent: usedAI ? 'ZIRA_AI' : intent, reply });
};


const db = require('../config/db');
const { generateTestQuestions } = require('../services/aiProvider');

// In-memory live Kahoot rooms store
// pin -> { pin, hostId, hostName, subject, questions: [], currentQuestion: -1, status: 'lobby'|'question'|'leaderboard'|'ended', players: {}, responses: {} }
const kahootRooms = {};

function generateGamePin() {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (kahootRooms[pin]);
  return pin;
}

// Subject-Specific Academic Fallback Question Bank
const subjectQuestionBanks = {
  "DBMS (Database Management Systems)": [
    {
      question: "What is the primary requirement for a Primary Key in SQL relational databases?",
      options: ["Must be unique and NOT NULL", "Must be a Foreign Key", "Must be numeric integer only", "Can contain duplicate rows"],
      answerIndex: 0,
      timeLimit: 20
    },
    {
      question: "Which normal form eliminates transitive functional dependencies?",
      options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "Which ACID property guarantees that executed database transactions are permanently committed?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      answerIndex: 3,
      timeLimit: 20
    },
    {
      question: "Which SQL JOIN returns all matching records from both left and right tables?",
      options: ["INNER JOIN", "FULL OUTER JOIN", "LEFT JOIN", "RIGHT JOIN"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What index structure is most widely used in relational databases for fast B-tree lookups?",
      options: ["Binary Heap", "B+ Tree", "Red-Black Tree", "Trie"],
      answerIndex: 1,
      timeLimit: 20
    }
  ],
  "DATA STRUCTURES (Data Structures & Algorithms)": [
    {
      question: "Which data structure operates strictly on a Last-In, First-Out (LIFO) principle?",
      options: ["Queue", "Stack", "Binary Search Tree", "Linked List"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What is the average time complexity of searching in a balanced Binary Search Tree (BST)?",
      options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "In a Min-Heap data structure with n elements, what is the time complexity to extract the minimum element?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which graph traversal technique uses a Queue data structure?",
      options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Pre-order Traversal", "Topological Sort"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What technique resolves hash table key collisions by placing colliding elements into a linked list?",
      options: ["Open Addressing", "Linear Probing", "Separate Chaining", "Double Hashing"],
      answerIndex: 2,
      timeLimit: 20
    }
  ],
  "PYTHON (Python Core & Data Science)": [
    {
      question: "In Python, which keyword is used to define an inline anonymous function?",
      options: ["def", "fn", "function", "lambda"],
      answerIndex: 3,
      timeLimit: 20
    },
    {
      question: "Which built-in Python data structure is immutable?",
      options: ["List", "Dictionary", "Tuple", "Set"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What will `[x**2 for x in range(3)]` evaluate to in Python?",
      options: ["[1, 4, 9]", "[0, 1, 4]", "[0, 1, 2]", "[1, 2, 3]"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which module provides multi-dimensional array processing in Python Data Science?",
      options: ["NumPy", "Requests", "Flask", "PyGame"],
      answerIndex: 0,
      timeLimit: 20
    },
    {
      question: "What exception is raised when trying to access a dictionary key that does not exist?",
      options: ["IndexError", "KeyError", "ValueError", "TypeError"],
      answerIndex: 1,
      timeLimit: 20
    }
  ],
  "JAVA (Java Object Oriented Programming)": [
    {
      question: "Which keyword is used in Java for a subclass to inherit from a superclass?",
      options: ["implements", "extends", "inherits", "super"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What memory area in Java JVM stores instantiated Objects?",
      options: ["Stack Memory", "Heap Memory", "Method Area", "Program Counter Register"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Can a Java class implement multiple interfaces?",
      options: ["Yes, multiple interface implementation is supported", "No, only single interface allowed", "Only if methods are static", "Only in Java 8+"],
      answerIndex: 0,
      timeLimit: 20
    },
    {
      question: "Which modifier prevents a Java class from being extended by another class?",
      options: ["static", "abstract", "final", "private"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What is the default initial capacity of an ArrayList in Java?",
      options: ["5", "10", "16", "32"],
      answerIndex: 1,
      timeLimit: 20
    }
  ],
  "OPERATING SYSTEMS (OS Core Concepts)": [
    {
      question: "Which condition is NOT one of Coffman's four necessary conditions for OS Deadlock?",
      options: ["Mutual Exclusion", "Hold and Wait", "Preemption allowed", "Circular Wait"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What happens when a CPU references a virtual memory page not currently loaded in physical RAM?",
      options: ["Segmentation Fault", "Page Fault", "Bus Error", "General Protection Fault"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which CPU scheduling algorithm gives each process a fixed time slice (quantum)?",
      options: ["First-Come First-Served (FCFS)", "Shortest Job First (SJF)", "Round Robin (RR)", "Priority Scheduling"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What synchronization primitive uses integer counter variables to control concurrent resource access?",
      options: ["Mutex", "Semaphore", "Spinlock", "Barrier"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What system call creates a new child process in UNIX/Linux systems?",
      options: ["exec()", "fork()", "create()", "clone()"],
      answerIndex: 1,
      timeLimit: 20
    }
  ],
  "ADA (Analysis & Design of Algorithms)": [
    {
      question: "What is the worst-case time complexity of QuickSort when using an unoptimized pivot selection?",
      options: ["O(n log n)", "O(n)", "O(n^2)", "O(2^n)"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "Which algorithmic paradigm breaks a problem into overlapping subproblems and stores solutions?",
      options: ["Greedy Approach", "Divide and Conquer", "Dynamic Programming", "Backtracking"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "Dijkstra's algorithm finds single-source shortest paths in graphs with what constraint?",
      options: ["Must contain no cycles", "Must have non-negative edge weights", "Must be a DAG", "Must be unweighted"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What theorem is used to solve recurrence relations of Divide-and-Conquer algorithms?",
      options: ["Euler's Theorem", "Master Theorem", "Bayes' Theorem", "Fermat's Theorem"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What is the tight bound time complexity of MergeSort in all cases?",
      options: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      answerIndex: 0,
      timeLimit: 20
    }
  ],
  "AI (Artificial Intelligence & Machine Learning)": [
    {
      question: "Which type of machine learning uses labeled input-output pairs for model training?",
      options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Clustering"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "What problem occurs when a model learns training data noise too closely and fails on test data?",
      options: ["Underfitting", "Overfitting", "Convergence", "Gradient Vanishing"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which algorithm computes gradients to update weights in Artificial Neural Networks?",
      options: ["Forward Pass", "Backpropagation", "K-Means", "Principal Component Analysis"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which evaluation metric measures the ratio of true positive predictions to total predicted positives?",
      options: ["Accuracy", "Recall", "Precision", "F1-Score"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What activation function outputs values constrained strictly between 0 and 1?",
      options: ["ReLU", "Sigmoid", "Tanh", "Softmax"],
      answerIndex: 1,
      timeLimit: 20
    }
  ],
  "C (C Programming & Pointers)": [
    {
      question: "Which operator is used to access the memory address of a variable in C?",
      options: ["*", "&", "->", "%"],
      answerIndex: 1,
      timeLimit: 20
    },
    {
      question: "Which C standard library function allocates uninitialized dynamic memory on the heap?",
      options: ["calloc()", "realloc()", "malloc()", "free()"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What is the output of `sizeof(char)` in standard C?",
      options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
      answerIndex: 0,
      timeLimit: 20
    },
    {
      question: "Which keyword prevents modification of a variable's value after initialization in C?",
      options: ["static", "volatile", "const", "extern"],
      answerIndex: 2,
      timeLimit: 20
    },
    {
      question: "What operator is used to access structure members via a structure pointer in C?",
      options: [".", "->", "*", "&"],
      answerIndex: 1,
      timeLimit: 20
    }
  ]
};

function getSubjectFallback(subject, count = 5) {
  for (const key in subjectQuestionBanks) {
    if (subject.toLowerCase().includes(key.split(' ')[0].toLowerCase())) {
      return subjectQuestionBanks[key].slice(0, count);
    }
  }
  return subjectQuestionBanks["DBMS (Database Management Systems)"].slice(0, count);
}

// Helper to generate AI Kahoot Questions using Gemini AI service
async function generateAiKahootQuestions(subject, count = 5, timeLimit = 20) {
  const prompt = `You are a university Computer Science professor setting a live quiz for the course subject "${subject}".
Generate exactly ${count} multiple choice academic exam questions specifically testing core syllabus concepts of "${subject}".

Return ONLY a JSON array with objects matching this exact structure:
[
  {
    "question": "Clear technical question on ${subject} syllabus?",
    "options": ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"],
    "answerIndex": 0,
    "timeLimit": ${timeLimit}
  }
]

Requirements:
1. Focus strictly on academic Computer Science principles for "${subject}".
2. answerIndex MUST be 0, 1, 2, or 3 pointing to the correct option in the options array.
3. options MUST contain exactly 4 technical choices.
4. Do NOT include generic trivia. Keep questions strictly relevant to ${subject}.`;

  try {
    const rawQuestions = await generateTestQuestions(prompt);
    if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
      return rawQuestions.map(q => ({
        question: q.question || q.question_text || `Question on ${subject}`,
        options: Array.isArray(q.options) && q.options.length >= 4 
          ? q.options.slice(0, 4) 
          : ["Option A", "Option B", "Option C", "Option D"],
        answerIndex: typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3 
          ? q.answerIndex 
          : (typeof q.correct_option === 'number' ? q.correct_option : 0),
        timeLimit: Number(q.timeLimit) || timeLimit
      }));
    }
  } catch (err) {
    console.error(`AI Kahoot question generation failed for ${subject}, using subject fallback bank:`, err.message);
  }

  return getSubjectFallback(subject, count).map(q => ({ ...q, timeLimit }));
}

// -----------------------------------------------------------------------------
// 1. Create a Kahoot Live Room (HOD ONLY)
// -----------------------------------------------------------------------------
exports.createRoom = async (req, res) => {
  try {
    const { subject, questions, useAi, count, defaultTimeLimit } = req.body;
    const cleanSubject = (subject || 'DBMS (Database Management Systems)').trim();
    const pin = generateGamePin();
    const questionCount = Math.min(15, Math.max(1, Number(count) || 5));
    const timeLimit = Math.min(60, Math.max(10, Number(defaultTimeLimit) || 20));

    let roomQuestions = [];

    if (Array.isArray(questions) && questions.length > 0) {
      // Custom user-authored questions
      roomQuestions = questions.map(q => ({
        question: q.question?.trim() || "Question Text",
        options: (q.options || []).slice(0, 4),
        answerIndex: Number(q.answerIndex) || 0,
        timeLimit: Number(q.timeLimit) || timeLimit
      }));
    } else if (useAi) {
      roomQuestions = await generateAiKahootQuestions(cleanSubject, questionCount, timeLimit);
    } else {
      roomQuestions = getSubjectFallback(cleanSubject, questionCount).map(q => ({ ...q, timeLimit }));
    }

    kahootRooms[pin] = {
      pin,
      hostId: req.user?.id || 'hod_host',
      hostName: req.user?.name || req.user?.full_name || 'HOD Host',
      subject: cleanSubject,
      questions: roomQuestions,
      currentQuestion: -1,
      status: 'lobby',
      players: {}, // socketId -> { studentId, usn, nickname, score, streak, lastPoints }
      responses: {}, // qIndex -> { socketId -> { optionIndex, isCorrect, points } }
      createdAt: new Date()
    };

    res.json({
      message: 'Kahoot Game Room created!',
      pin,
      subject: cleanSubject,
      questionCount: roomQuestions.length,
      questions: roomQuestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Kahoot room: ' + err.message });
  }
};

// -----------------------------------------------------------------------------
// 2. Get Public Info for a Game Room by PIN
// -----------------------------------------------------------------------------
exports.getRoomInfo = async (req, res) => {
  const { pin } = req.params;
  const room = kahootRooms[pin];
  if (!room) {
    return res.status(404).json({ error: 'Game room not found or PIN expired.' });
  }

  res.json({
    pin: room.pin,
    subject: room.subject,
    hostName: room.hostName,
    questionCount: room.questions.length,
    playerCount: Object.keys(room.players).length,
    status: room.status,
    currentQuestion: room.currentQuestion
  });
};

// -----------------------------------------------------------------------------
// 3. List Active Live Rooms
// -----------------------------------------------------------------------------
exports.listActiveRooms = async (req, res) => {
  const activeList = Object.values(kahootRooms).map(r => ({
    pin: r.pin,
    subject: r.subject,
    hostName: r.hostName,
    questionCount: r.questions.length,
    playerCount: Object.keys(r.players).length,
    status: r.status,
    createdAt: r.createdAt
  }));
  res.json(activeList);
};

// Export active rooms store for socket handlers
exports.kahootRooms = kahootRooms;

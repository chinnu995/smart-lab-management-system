const db = require('../src/config/db');

async function setupCodingTables() {
  console.log('🚀 Setting up Coding Challenges database tables with weekly schedule...');

  // 1. Create coding_challenges table
  await db.query(`
    CREATE TABLE IF NOT EXISTS coding_challenges (
      problem_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
      category VARCHAR(80) NOT NULL,
      week_number INT DEFAULT 1,
      description TEXT NOT NULL,
      input_format TEXT,
      output_format TEXT,
      constraints TEXT,
      sample_cases JSONB NOT NULL,
      hidden_cases JSONB NOT NULL,
      starter_code JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure column week_number exists
  await db.query(`ALTER TABLE coding_challenges ADD COLUMN IF NOT EXISTS week_number INT DEFAULT 1`);

  // 2. Create coding_submissions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS coding_submissions (
      submission_id SERIAL PRIMARY KEY,
      problem_id INT NOT NULL REFERENCES coding_challenges(problem_id) ON DELETE CASCADE,
      student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
      language VARCHAR(30) NOT NULL,
      code TEXT NOT NULL,
      status VARCHAR(40) DEFAULT 'Pending',
      passed_cases INT DEFAULT 0,
      total_cases INT DEFAULT 0,
      execution_time_ms INT DEFAULT 0,
      stdout TEXT,
      submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ Tables coding_challenges and coding_submissions ready.');

  // Seed 10 Weekly Coding Challenges for JAVA and Curriculum Subjects
  const javaWeeklyProblems = [
    {
      title: 'Week 1: JAVA - Primitive Datatype Range',
      slug: 'java-week-1-datatypes',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 1,
      description: `Java has 4 primitive integer types: byte (8-bit), short (16-bit), int (32-bit), and long (64-bit).\n\nGiven an integer number n, determine which of the four primitive data types can store it. If there is more than one appropriate data type, print each one on its own line and order them by size (byte < short < int < long).\n\nIf the number cannot be stored in any of the four primitive data types, print:\n\`n can't be fitted anywhere.\``,
      input_format: 'The first line contains an integer T, denoting the number of test cases. Each of the next T lines contains an integer n.',
      output_format: 'For each input n, determine which primitive data type can fit it. Follow the exact output format shown in sample cases.',
      constraints: '1 <= T <= 100\n-10^18 <= n <= 10^18',
      sample_cases: [
        {
          input: '5\n-150\n150000\n1500000000\n213333333333333333333333333333333333\n-10000000000000',
          output: `-150 can be fitted in:\n* short\n* int\n* long\n150000 can be fitted in:\n* int\n* long\n1500000000 can be fitted in:\n* int\n* long\n213333333333333333333333333333333333 can't be fitted anywhere.\n-10000000000000 can be fitted in:\n* long`,
          explanation: '-150 fits in short (-32768 to 32767), int, and long.'
        }
      ],
      hidden_cases: [
        {
          input: '3\n-100\n30000\n9223372036854775807',
          output: `-100 can be fitted in:\n* byte\n* short\n* int\n* long\n30000 can be fitted in:\n* short\n* int\n* long\n9223372036854775807 can be fitted in:\n* long`
        }
      ],
      starter_code: {
        java: `import java.util.*;\nimport java.io.*;\n\nclass Solution {\n    public static void main(String []argh) {\n        Scanner sc = new Scanner(System.in);\n        int t = sc.nextInt();\n\n        for (int i = 0; i < t; i++) {\n            // Complete the code\n        }\n    }\n}`
      }
    },
    {
      title: 'Week 2: JAVA - String Tokens & Split',
      slug: 'java-week-2-tokens',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 2,
      description: 'Given a string s, matching the regular expression `[A-Za-z !,?._\'@]+`, split the string into tokens. We define a token to be one or more consecutive English alphabetic letters.',
      input_format: 'A single string s.',
      output_format: 'On the first line, print an integer n, denoting the number of tokens. On each of the next n lines, print a token.',
      constraints: '1 <= s.length <= 4 * 10^5',
      sample_cases: [{ input: 'He is a very very good boy, isn\'t he?', output: '10\nHe\nis\na\nvery\nvery\ngood\nboy\nisn\nt\nhe' }],
      hidden_cases: [{ input: 'Hello world', output: '2\nHello\nworld' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scan = new Scanner(System.in);\n        String s = scan.nextLine();\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 3: JAVA - Anagram Comparison',
      slug: 'java-week-3-anagrams',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 3,
      description: 'Two strings A and B are called anagrams if they contain all the same characters in the same frequencies. Case-insensitive anagram comparison.',
      input_format: 'First line string A, second line string B.',
      output_format: 'Print "Anagrams" if A and B are case-insensitive anagrams; otherwise print "Not Anagrams".',
      constraints: '1 <= A.length, B.length <= 50',
      sample_cases: [{ input: 'anagram\nmargana', output: 'Anagrams' }],
      hidden_cases: [{ input: 'Hello\nhello', output: 'Anagrams' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scan = new Scanner(System.in);\n        String a = scan.next();\n        String b = scan.next();\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 4: JAVA - Negative Subarray Sum',
      slug: 'java-week-4-subarrays',
      difficulty: 'Medium',
      category: 'JAVA',
      week_number: 4,
      description: 'Given an array of n integers, find and print the number of negative subarrays in the array.',
      input_format: 'First line size n, second line n space separated integers.',
      output_format: 'Print total number of negative subarrays.',
      constraints: '1 <= n <= 100',
      sample_cases: [{ input: '5\n1 -2 4 -5 1', output: '9' }],
      hidden_cases: [{ input: '3\n1 2 3', output: '0' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 5: JAVA - Exception Handling Try-Catch',
      slug: 'java-week-5-exceptions',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 5,
      description: 'You will be given two integers x and y. You have to compute x/y. If x and y are not 32-bit signed integers or if y is zero, handle exception.',
      input_format: 'Two integers x and y on two separate lines.',
      output_format: 'Print result of x/y or exception name.',
      constraints: 'Standard 32-bit integers',
      sample_cases: [{ input: '10\n3', output: '3' }],
      hidden_cases: [{ input: '10\n0', output: 'java.lang.ArithmeticException: / by zero' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 6: JAVA - ArrayList Operations',
      slug: 'java-week-6-arraylist',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 6,
      description: 'Given n lines of integers, answer q queries asking for the number at x-th line and y-th position.',
      input_format: 'Line 1: n lines. Next n lines: list of integers. Next line: q queries.',
      output_format: 'Print integer or "ERROR!".',
      constraints: '1 <= n <= 20000',
      sample_cases: [{ input: '5\n5 41 77 74 22 44\n1 12\n4 37 34 36 52\n0\n3 20 22 33\n5\n1 3\n3 4\n3 1\n4 3\n5 5', output: '74\n52\n37\nERROR!\nERROR!' }],
      hidden_cases: [{ input: '1\n2 10 20\n1\n1 2', output: '20' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 7: JAVA - HashMap Phone Book',
      slug: 'java-week-7-hashmap',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 7,
      description: 'Given n phone book entries (name and phone number), process queries searching for names in the phone book.',
      input_format: 'First line n entries. Next 2*n lines: name then phone. Followed by query names.',
      output_format: 'Print "name=phone" or "Not found".',
      constraints: '1 <= n <= 100000',
      sample_cases: [{ input: '3\nuncle sam\n99912222\ntom\n11122222\nharry\n12299933\nuncle sam\nuncle tom\nharry', output: 'uncle sam=99912222\nNot found\nharry=12299933' }],
      hidden_cases: [{ input: '1\nalice\n123456\nalice', output: 'alice=123456' }],
      starter_code: { java: `import java.util.*;\n\nclass Solution {\n    public static void main(String []argh) {\n        // Complete the code\n    }\n}` }
    },
    {
      title: 'Week 8: JAVA - Interface Implementation',
      slug: 'java-week-8-interface',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 8,
      description: 'Implement AdvancedArithmetic interface method divisor_sum(n) returning sum of all divisors of n.',
      input_format: 'An integer n.',
      output_format: 'Print sum of divisors of n.',
      constraints: '1 <= n <= 1000',
      sample_cases: [{ input: '6', output: '12' }],
      hidden_cases: [{ input: '1', output: '1' }],
      starter_code: { java: `import java.util.*;\n\nclass MyCalculator {\n    public int divisor_sum(int n) {\n        // Complete the code\n        return 0;\n    }\n}` }
    },
    {
      title: 'Week 9: JAVA - Method Overriding',
      slug: 'java-week-9-overriding',
      difficulty: 'Easy',
      category: 'JAVA',
      week_number: 9,
      description: 'Demonstrate method overriding in Java inheritance by calling overridden methods.',
      input_format: 'None',
      output_format: 'Generic Sports\nEach team has n players in Generic Sports\nSoccer Class\nEach team has 11 players in Soccer',
      constraints: 'N/A',
      sample_cases: [{ input: '', output: 'Generic Sports\nEach team has n players in Generic Sports\nSoccer Class\nEach team has 11 players in Soccer' }],
      hidden_cases: [{ input: '', output: 'Generic Sports\nEach team has n players in Generic Sports\nSoccer Class\nEach team has 11 players in Soccer' }],
      starter_code: { java: `class Sports {\n    String getName() { return "Generic Sports"; }\n}` }
    },
    {
      title: 'Week 10: JAVA - Regex Username Validator',
      slug: 'java-week-10-regex',
      difficulty: 'Medium',
      category: 'JAVA',
      week_number: 10,
      description: 'Validate usernames using regular expressions. Username must be 8-30 characters long, start with alphabet, contain alphanumeric or underscores.',
      input_format: 'Line 1: n usernames. Next n lines: username strings.',
      output_format: 'Print "Valid" or "Invalid".',
      constraints: '1 <= n <= 100',
      sample_cases: [{ input: '4\nJulia\nSamantha\nSamantha_21\n1Samantha', output: 'Invalid\nValid\nValid\nInvalid' }],
      hidden_cases: [{ input: '1\nUser_123', output: 'Valid' }],
      starter_code: { java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Complete the code\n    }\n}` }
    }
  ];

  // Also add Week 1 challenges for DBMS, MONGODB, AI, PYTHON, LATEX, OPERATING SYSTEMS
  const otherWeeklyProblems = [
    {
      title: 'Week 1: DBMS - SQL High Salary Filter',
      slug: 'dbms-sql-filter',
      difficulty: 'Easy',
      category: 'DBMS',
      week_number: 1,
      description: 'Query the `NAME` of all employees in the `EMPLOYEE` table earning more than `$2000` per month who have been employed for less than `10` months. Sort your result by ascending `EMPLOYEE_ID`.',
      input_format: 'Database table EMPLOYEE(employee_id INT, name VARCHAR, months INT, salary INT)',
      output_format: 'Print each employee name on a new line.',
      constraints: '1 <= employee_id <= 1000',
      sample_cases: [{ input: 'SELECT name FROM employee WHERE salary > 2000 AND months < 10 ORDER BY employee_id ASC;', output: 'Rose\nAngela\nFrank' }],
      hidden_cases: [{ input: 'SELECT name FROM employee WHERE salary > 2000 AND months < 10 ORDER BY employee_id ASC;', output: 'Rose\nAngela\nFrank' }],
      starter_code: { sql: `/* Enter your query here */\n` }
    },
    {
      title: 'Week 1: PYTHON - Anagram String Checker',
      slug: 'python-anagram-check',
      difficulty: 'Easy',
      category: 'PYTHON',
      week_number: 1,
      description: 'Given two strings s and t, return `true` if t is an anagram of s, and `false` otherwise.',
      input_format: 'Two lines, each containing a string.',
      output_format: 'Print `true` or `false`.',
      constraints: '1 <= s.length, t.length <= 5 * 10^4',
      sample_cases: [{ input: 'anagram\nnagaram', output: 'true' }],
      hidden_cases: [{ input: 'rat\ncar', output: 'false' }],
      starter_code: { python: `import sys\nlines = sys.stdin.read().split()\nif len(lines) >= 2:\n    pass` }
    },
    {
      title: 'Week 1: MONGODB - Document Count Query',
      slug: 'mongodb-doc-count',
      difficulty: 'Easy',
      category: 'MONGODB',
      week_number: 1,
      description: 'Write a MongoDB BSON query to count the total number of documents in the `inventory` collection where `status` is equal to `"A"` and `qty` is greater than or equal to `25`.',
      input_format: 'Collection inventory(item VARCHAR, qty INT, status VARCHAR)',
      output_format: 'Print the total document count as an integer.',
      constraints: '1 <= qty <= 1000',
      sample_cases: [{ input: 'db.inventory.countDocuments({ status: "A", qty: { $gte: 25 } })', output: '3' }],
      hidden_cases: [{ input: 'db.inventory.countDocuments({ status: "A", qty: { $gte: 25 } })', output: '3' }],
      starter_code: { javascript: `// Write your MongoDB query below\n` }
    },
    {
      title: 'Week 1: AI - Heuristic A* Distance',
      slug: 'ai-heuristic-distance',
      difficulty: 'Medium',
      category: 'AI',
      week_number: 1,
      description: 'Given two 2D grid coordinates (x1, y1) and (x2, y2), calculate the Manhattan Distance heuristic h(n) = |x1 - x2| + |y1 - y2|.',
      input_format: 'Line 1: x1 y1\nLine 2: x2 y2',
      output_format: 'Print the Manhattan Distance as an integer.',
      constraints: '-10^4 <= x, y <= 10^4',
      sample_cases: [{ input: '1 2\n4 6', output: '7' }],
      hidden_cases: [{ input: '0 0\n10 10', output: '20' }],
      starter_code: { python: `import sys\nlines = sys.stdin.read().split()\n# Calculate Manhattan Distance\n` }
    },
    {
      title: 'Week 1: LATEX - Section Header Command',
      slug: 'latex-section-command',
      difficulty: 'Easy',
      category: 'LATEX',
      week_number: 1,
      description: 'In LaTeX, identify the standard command used to create a numbered primary section heading.',
      input_format: 'Single string line containing section title.',
      output_format: 'Print the valid LaTeX command for section title.',
      constraints: 'Title length <= 100 chars',
      sample_cases: [{ input: 'Introduction', output: '\\section{Introduction}' }],
      hidden_cases: [{ input: 'Methodology', output: '\\section{Methodology}' }],
      starter_code: { python: `import sys\ntitle = sys.stdin.read().strip()\n` }
    },
    {
      title: 'Week 1: OPERATING SYSTEMS - Round Robin Quantum',
      slug: 'os-round-robin',
      difficulty: 'Medium',
      category: 'OPERATING SYSTEMS',
      week_number: 1,
      description: 'Given CPU burst times for N processes and time quantum Q, calculate total execution time required to complete all processes.',
      input_format: 'Line 1: N Q\nLine 2: N space-separated burst times',
      output_format: 'Print total execution time.',
      constraints: '1 <= N <= 100\n1 <= Q <= 10',
      sample_cases: [{ input: '3 2\n4 3 2', output: '9' }],
      hidden_cases: [{ input: '2 3\n5 2', output: '7' }],
      starter_code: { python: `import sys\nlines = sys.stdin.read().split()\n` }
    }
  ];

  const allProblems = [...javaWeeklyProblems, ...otherWeeklyProblems];

  for (const prob of allProblems) {
    await db.query(`
      INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        week_number = EXCLUDED.week_number,
        description = EXCLUDED.description,
        sample_cases = EXCLUDED.sample_cases,
        hidden_cases = EXCLUDED.hidden_cases,
        starter_code = EXCLUDED.starter_code
    `, [
      prob.title, prob.slug, prob.difficulty, prob.category, prob.week_number || 1, prob.description,
      prob.input_format, prob.output_format, prob.constraints,
      JSON.stringify(prob.sample_cases), JSON.stringify(prob.hidden_cases), JSON.stringify(prob.starter_code)
    ]);
  }

  console.log(`✓ Seeded ${allProblems.length} weekly coding challenges!`);
}

if (require.main === module) {
  setupCodingTables().then(() => process.exit(0)).catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

module.exports = { setupCodingTables };

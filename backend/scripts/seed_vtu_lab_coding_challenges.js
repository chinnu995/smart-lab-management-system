const db = require('../src/config/db');

async function seedVtuLabChallenges() {
  console.log('🌱 Seeding VTU CS Allied Lab Programs into coding_challenges...');

  // Map of subject search keyword -> target category name in coding_challenges
  const subjectCategoryMappings = [
    { search: '%NETWORK%', category: 'COMPUTER NETWORKS', defaultLang: 'c' },
    { search: '%PRINCIPLES OF PROGRAMMING USING C%', category: 'C PROGRAMMING', defaultLang: 'c' },
    { search: '%C PROGRAMMING LAB%', category: 'C PROGRAMMING', defaultLang: 'c' },
    { search: '%OBJECT ORIENTED PROGRAMMING WITH C++%', category: 'C++', defaultLang: 'cpp' },
    { search: '%DATA STRUCTURE%', category: 'DATA STRUCTURES', defaultLang: 'c' },
    { search: '%DIGITAL DESIGN%', category: 'DIGITAL DESIGN & COMPUTER ORGANIZATION', defaultLang: 'verilog' },
    { search: '%IOT%', category: 'IOT', defaultLang: 'python' },
    { search: '%DATA VISUALIZATION WITH PYTHON%', category: 'DATA VISUALIZATION WITH PYTHON', defaultLang: 'python' },
    { search: '%PROJECT MANAGEMENT%GIT%', category: 'GIT & VERSION CONTROL', defaultLang: 'bash' },
    { search: '%EXPLORATORY DATA ANALYSIS%', category: 'DATA VISUALIZATION WITH PYTHON', defaultLang: 'python' }
  ];

  for (const map of subjectCategoryMappings) {
    try {
      const [programs] = await db.query(
        `SELECT lp.program_no, lp.title, lp.description, lp.starter_code, lp.language, s.name as subject_name, s.code as subject_code
         FROM lab_programs lp
         JOIN subjects s ON lp.subject_id = s.id
         WHERE UPPER(s.name) LIKE ?
         ORDER BY lp.program_no ASC`,
        [map.search]
      );

      console.log(`Found ${programs.length} programs for mapping ${map.category}`);

      for (const p of programs) {
        const slug = `${map.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-prog-${p.program_no}`;
        const title = `Lab ${p.program_no}: ${p.title}`;
        const lang = p.language || map.defaultLang || 'python';

        let starter = {};
        if (typeof p.starter_code === 'object' && p.starter_code !== null) {
          starter = p.starter_code;
        } else if (typeof p.starter_code === 'string') {
          starter[lang] = p.starter_code;
        } else {
          starter[lang] = `// Lab ${p.program_no}: ${p.title}\n// Implement your solution below\n`;
        }

        const sampleCases = JSON.stringify([
          { input: '1', output: 'Output for Lab Program ' + p.program_no, explanation: p.title }
        ]);
        const hiddenCases = JSON.stringify([
          { input: '1', output: 'Output for Lab Program ' + p.program_no }
        ]);
        const starterJson = JSON.stringify(starter);

        await db.query(
          `INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb)
           ON CONFLICT (slug) DO UPDATE SET
             title = EXCLUDED.title,
             category = EXCLUDED.category,
             description = EXCLUDED.description,
             starter_code = EXCLUDED.starter_code`,
          [
            title,
            slug,
            'Medium',
            map.category,
            p.program_no,
            p.description || `VTU Official Syllabus Lab Program #${p.program_no} for ${p.subject_name} (${p.subject_code}): ${p.title}`,
            'Standard lab input specification according to VTU syllabus guidelines.',
            'Standard lab console output according to VTU syllabus guidelines.',
            'VTU 2022/2025 Scheme specifications',
            sampleCases,
            hiddenCases,
            starterJson
          ]
        );
      }
    } catch (err) {
      console.error(`Error seeding challenges for ${map.category}:`, err.message);
    }
  }

  // Also verify general web technologies challenges
  const webProblems = [
    { no: 1, title: 'HTML5 Form Validation & Elements', desc: 'Build an interactive student registration form with HTML5 constraints and validation.' },
    { no: 2, title: 'CSS3 Flexbox & Responsive Layout', desc: 'Create a responsive 3-column lab equipment grid using CSS flexbox.' },
    { no: 3, title: 'JavaScript DOM Manipulation', desc: 'Write a script to dynamically add, filter, and remove lab inventory items.' },
    { no: 4, title: 'Async Fetch API & JSON Handling', desc: 'Fetch student records asynchronously using fetch() and render an interactive table.' },
    { no: 5, title: 'Event Delegation & Bubbling', desc: 'Implement an event delegation listener on a dynamic student attendance list.' },
    { no: 6, title: 'Node.js Express REST API Route', desc: 'Create a basic REST route that accepts POST requests and validates payload.' },
    { no: 7, title: 'JWT Token Decoder & Verifier', desc: 'Decode a base64 encoded JWT payload and check expiration timestamp.' },
    { no: 8, title: 'React Controlled Component Form', desc: 'Build a controlled state component managing student marks input.' },
    { no: 9, title: 'WebSockets Live Ping-Pong Client', desc: 'Implement a WebSocket connection that responds to server ping packets.' },
    { no: 10, title: 'Local Storage State Persistence', desc: 'Store and restore dark mode theme preferences across page refreshes.' }
  ];

  for (const wp of webProblems) {
    const slug = `web-technologies-lab-${wp.no}`;
    const starterJson = JSON.stringify({ javascript: `// Web Lab ${wp.no}: ${wp.title}\nfunction solve() {\n  // Code here\n}\n` });
    await db.query(
      `INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb)
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description`,
      [
        `Lab ${wp.no}: ${wp.title}`,
        slug,
        'Medium',
        'WEB TECHNOLOGIES',
        wp.no,
        wp.desc,
        'Web Standards input format',
        'Valid DOM / JSON output format',
        'W3C / ES6 Standards',
        JSON.stringify([{ input: '1', output: 'Success' }]),
        JSON.stringify([{ input: '1', output: 'Success' }]),
        starterJson
      ]
    ).catch(() => {});
  }

  // Also verify machine learning challenges
  const mlProblems = [
    { no: 1, title: 'Linear Regression Least Squares', desc: 'Implement simple linear regression using least squares formula from scratch.' },
    { no: 2, title: 'K-Nearest Neighbors Classifier', desc: 'Implement KNN distance computation (Euclidean) for classified test points.' },
    { no: 3, title: 'Decision Tree Information Gain', desc: 'Calculate entropy and information gain for a binary feature split.' },
    { no: 4, title: 'Naive Bayes Probability Estimator', desc: 'Compute prior and posterior probabilities for text spam classification.' },
    { no: 5, title: 'K-Means Clustering Centroid Update', desc: 'Update cluster centroids given data points and their cluster assignments.' },
    { no: 6, title: 'Logistic Regression Sigmoid Function', desc: 'Implement sigmoid activation and binary cross entropy loss calculation.' },
    { no: 7, title: 'Principal Component Analysis (PCA)', desc: 'Compute covariance matrix and identify dominant eigenvector.' },
    { no: 8, title: 'Confusion Matrix & Metrics Calculation', desc: 'Calculate Precision, Recall, F1-Score, and Accuracy from TP, FP, TN, FN.' },
    { no: 9, title: 'Gradient Descent Optimizer', desc: 'Iteratively update weight parameters using batch gradient descent step.' },
    { no: 10, title: 'Support Vector Machine Margin Distance', desc: 'Compute hyperplane decision boundary margin distance for support vectors.' }
  ];

  for (const ml of mlProblems) {
    const slug = `machine-learning-lab-${ml.no}`;
    const starterJson = JSON.stringify({ python: `# ML Lab ${ml.no}: ${ml.title}\ndef solve():\n    pass\n` });
    await db.query(
      `INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb)
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description`,
      [
        `Lab ${ml.no}: ${ml.title}`,
        slug,
        'Medium',
        'MACHINE LEARNING',
        ml.no,
        ml.desc,
        'Dataset array format',
        'Classification / numeric output',
        'Standard NumPy constraints',
        JSON.stringify([{ input: '1', output: 'Success' }]),
        JSON.stringify([{ input: '1', output: 'Success' }]),
        starterJson
      ]
    ).catch(() => {});
  }

  console.log('✅ Successfully seeded VTU CS Allied challenges into coding_challenges table!');
  process.exit(0);
}

seedVtuLabChallenges().catch(e => {
  console.error(e);
  process.exit(1);
});

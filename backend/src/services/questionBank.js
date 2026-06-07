/**
 * Local Question Bank — 10 MCQs per subject
 * Used as fallback when Gemini API is unavailable
 */

const questionBank = {
  ADA: [
    { question: "What is the time complexity of binary search?", options: { a: "O(n)", b: "O(log n)", c: "O(n log n)", d: "O(1)" }, answer: "b" },
    { question: "Which sorting algorithm has the best average-case time complexity?", options: { a: "Bubble Sort", b: "Selection Sort", c: "Merge Sort", d: "Insertion Sort" }, answer: "c" },
    { question: "What is the worst-case time complexity of Quick Sort?", options: { a: "O(n log n)", b: "O(n)", c: "O(n²)", d: "O(log n)" }, answer: "c" },
    { question: "Which data structure is used in BFS traversal?", options: { a: "Stack", b: "Queue", c: "Linked List", d: "Tree" }, answer: "b" },
    { question: "What is the purpose of dynamic programming?", options: { a: "To use recursion", b: "To avoid recomputation of subproblems", c: "To sort arrays", d: "To search graphs" }, answer: "b" },
    { question: "Which algorithm is used to find the shortest path in a weighted graph?", options: { a: "DFS", b: "BFS", c: "Dijkstra's Algorithm", d: "Prim's Algorithm" }, answer: "c" },
    { question: "What is the space complexity of merge sort?", options: { a: "O(1)", b: "O(log n)", c: "O(n)", d: "O(n²)" }, answer: "c" },
    { question: "Which of the following is a greedy algorithm?", options: { a: "Floyd-Warshall", b: "Bellman-Ford", c: "Kruskal's MST", d: "Matrix Chain Multiplication" }, answer: "c" },
    { question: "What does Big-O notation represent?", options: { a: "Best case", b: "Average case", c: "Upper bound (worst case)", d: "Lower bound" }, answer: "c" },
    { question: "Which technique is used in the Knapsack problem?", options: { a: "Divide and Conquer", b: "Dynamic Programming", c: "Brute Force only", d: "Linear Search" }, answer: "b" }
  ],

  DBMS: [
    { question: "What does ACID stand for in database transactions?", options: { a: "Atomicity, Consistency, Isolation, Durability", b: "Association, Consistency, Isolation, Durability", c: "Atomicity, Concurrency, Isolation, Data", d: "Atomicity, Consistency, Integration, Durability" }, answer: "a" },
    { question: "Which normal form eliminates partial dependency?", options: { a: "1NF", b: "2NF", c: "3NF", d: "BCNF" }, answer: "b" },
    { question: "What is a primary key?", options: { a: "A key that can be null", b: "A unique identifier for each record in a table", c: "A foreign key reference", d: "An index on a table" }, answer: "b" },
    { question: "Which SQL command is used to retrieve data?", options: { a: "INSERT", b: "UPDATE", c: "SELECT", d: "DELETE" }, answer: "c" },
    { question: "What is a foreign key?", options: { a: "A key in the same table", b: "A key that references a primary key in another table", c: "A unique key", d: "An auto-increment key" }, answer: "b" },
    { question: "Which join returns all records from both tables?", options: { a: "INNER JOIN", b: "LEFT JOIN", c: "RIGHT JOIN", d: "FULL OUTER JOIN" }, answer: "d" },
    { question: "What is normalization?", options: { a: "Adding redundancy", b: "Process of organizing data to reduce redundancy", c: "Deleting tables", d: "Creating indexes" }, answer: "b" },
    { question: "Which command is used to remove a table?", options: { a: "DELETE TABLE", b: "REMOVE TABLE", c: "DROP TABLE", d: "TRUNCATE TABLE" }, answer: "c" },
    { question: "What does DDL stand for?", options: { a: "Data Definition Language", b: "Data Description Language", c: "Database Design Language", d: "Data Development Language" }, answer: "a" },
    { question: "Which of the following is a NoSQL database?", options: { a: "MySQL", b: "PostgreSQL", c: "MongoDB", d: "Oracle" }, answer: "c" }
  ],

  LATEX: [
    { question: "What command begins a LaTeX document?", options: { a: "\\startdocument", b: "\\begin{document}", c: "\\document{begin}", d: "\\open{document}" }, answer: "b" },
    { question: "Which command creates a section heading in LaTeX?", options: { a: "\\heading{}", b: "\\title{}", c: "\\section{}", d: "\\header{}" }, answer: "c" },
    { question: "How do you write bold text in LaTeX?", options: { a: "\\bold{text}", b: "\\textbf{text}", c: "\\bf{text}", d: "\\strong{text}" }, answer: "b" },
    { question: "Which package is used for including images in LaTeX?", options: { a: "imagepkg", b: "graphics", c: "graphicx", d: "picture" }, answer: "c" },
    { question: "What is the file extension for a LaTeX source file?", options: { a: ".ltx", b: ".latex", c: ".doc", d: ".tex" }, answer: "d" },
    { question: "Which environment is used for creating numbered lists?", options: { a: "itemize", b: "enumerate", c: "list", d: "numbering" }, answer: "b" },
    { question: "How do you include a mathematical formula inline?", options: { a: "\\math{}", b: "$$...$$", c: "$...$", d: "\\formula{}" }, answer: "c" },
    { question: "Which command is used to create a table in LaTeX?", options: { a: "\\table{}", b: "\\begin{tabular}", c: "\\maketable{}", d: "\\grid{}" }, answer: "b" },
    { question: "What does \\documentclass{article} specify?", options: { a: "Page size", b: "The type/class of the document", c: "Font size only", d: "Author name" }, answer: "b" },
    { question: "Which command generates a table of contents?", options: { a: "\\contents", b: "\\toc", c: "\\tableofcontents", d: "\\listsections" }, answer: "c" }
  ],

  MICROCONTROLLER: [
    { question: "How many bits does the 8051 microcontroller use?", options: { a: "4-bit", b: "8-bit", c: "16-bit", d: "32-bit" }, answer: "b" },
    { question: "What is the size of internal RAM in the 8051?", options: { a: "64 bytes", b: "128 bytes", c: "256 bytes", d: "512 bytes" }, answer: "b" },
    { question: "Which register is used as the accumulator in 8051?", options: { a: "B register", b: "R0", c: "A register", d: "DPTR" }, answer: "c" },
    { question: "How many timers does the standard 8051 have?", options: { a: "1", b: "2", c: "3", d: "4" }, answer: "b" },
    { question: "What is the crystal frequency commonly used with 8051?", options: { a: "8 MHz", b: "11.0592 MHz", c: "16 MHz", d: "20 MHz" }, answer: "b" },
    { question: "Which port in 8051 is used for serial communication?", options: { a: "Port 0", b: "Port 1", c: "Port 2", d: "Port 3" }, answer: "d" },
    { question: "What does UART stand for?", options: { a: "Universal Asynchronous Receiver Transmitter", b: "Unified Async Read Transfer", c: "Universal Analog Receiver Transmitter", d: "Unit Async Register Transfer" }, answer: "a" },
    { question: "What is the size of the program memory (ROM) in 8051?", options: { a: "2 KB", b: "4 KB", c: "8 KB", d: "16 KB" }, answer: "b" },
    { question: "Which instruction is used to move data in 8051?", options: { a: "LOAD", b: "MOV", c: "TRANSFER", d: "COPY" }, answer: "b" },
    { question: "What is an interrupt in a microcontroller?", options: { a: "A type of memory", b: "A signal that temporarily halts the main program to execute a specific routine", c: "A power-off signal", d: "A clock signal" }, answer: "b" }
  ],

  MONGODB: [
    { question: "What type of database is MongoDB?", options: { a: "Relational", b: "Document-oriented NoSQL", c: "Graph", d: "Key-Value" }, answer: "b" },
    { question: "What format does MongoDB use to store data?", options: { a: "XML", b: "CSV", c: "BSON (Binary JSON)", d: "Plain Text" }, answer: "c" },
    { question: "Which command inserts a document in MongoDB?", options: { a: "db.collection.add()", b: "db.collection.insertOne()", c: "db.collection.put()", d: "db.collection.save()" }, answer: "b" },
    { question: "What is a collection in MongoDB equivalent to in SQL?", options: { a: "Database", b: "Row", c: "Table", d: "Column" }, answer: "c" },
    { question: "Which method is used to find documents in MongoDB?", options: { a: "db.collection.search()", b: "db.collection.find()", c: "db.collection.query()", d: "db.collection.get()" }, answer: "b" },
    { question: "What is the default port for MongoDB?", options: { a: "3306", b: "5432", c: "27017", d: "8080" }, answer: "c" },
    { question: "What is a replica set in MongoDB?", options: { a: "A backup file", b: "A group of MongoDB servers maintaining the same data set", c: "A type of index", d: "A query optimizer" }, answer: "b" },
    { question: "Which operator is used for 'greater than' in MongoDB queries?", options: { a: "$greater", b: "$gt", c: "$more", d: "$above" }, answer: "b" },
    { question: "What does the _id field represent in MongoDB?", options: { a: "User-defined field", b: "A unique identifier automatically assigned to each document", c: "Database name", d: "Collection name" }, answer: "b" },
    { question: "Which aggregation stage is used to filter documents?", options: { a: "$project", b: "$group", c: "$match", d: "$sort" }, answer: "c" }
  ],

  AI: [
    { question: "What is Artificial Intelligence?", options: { a: "A programming language", b: "Simulation of human intelligence by machines", c: "A database system", d: "A networking protocol" }, answer: "b" },
    { question: "Which of the following is a type of machine learning?", options: { a: "Supervised Learning", b: "Database Learning", c: "Network Learning", d: "Protocol Learning" }, answer: "a" },
    { question: "What is a neural network inspired by?", options: { a: "Computer circuits", b: "Biological neurons in the brain", c: "Internet protocols", d: "File systems" }, answer: "b" },
    { question: "What does NLP stand for?", options: { a: "New Language Protocol", b: "Natural Language Processing", c: "Network Layer Processing", d: "Numeric Logic Programming" }, answer: "b" },
    { question: "Which algorithm is commonly used for classification?", options: { a: "Quick Sort", b: "Binary Search", c: "Decision Tree", d: "Merge Sort" }, answer: "c" },
    { question: "What is overfitting in machine learning?", options: { a: "Model performs well on all data", b: "Model performs well on training data but poorly on new data", c: "Model is too simple", d: "Model has no errors" }, answer: "b" },
    { question: "What is the Turing Test?", options: { a: "A test for hardware speed", b: "A test to determine if a machine can exhibit intelligent behavior", c: "A database query test", d: "A network speed test" }, answer: "b" },
    { question: "Which search algorithm uses a heuristic function?", options: { a: "BFS", b: "DFS", c: "A* Search", d: "Linear Search" }, answer: "c" },
    { question: "What is reinforcement learning?", options: { a: "Learning from labeled data", b: "Learning by receiving rewards or penalties for actions", c: "Learning from unlabeled data", d: "Memorizing data" }, answer: "b" },
    { question: "What is a chatbot an example of?", options: { a: "Hardware device", b: "AI application using NLP", c: "Database system", d: "Operating system" }, answer: "b" }
  ],

  JAVA: [
    { question: "Which keyword is used to create a class in Java?", options: { a: "struct", b: "object", c: "class", d: "define" }, answer: "c" },
    { question: "What is the entry point of a Java program?", options: { a: "start() method", b: "main() method", c: "run() method", d: "init() method" }, answer: "b" },
    { question: "Which of the following is not a primitive data type in Java?", options: { a: "int", b: "boolean", c: "String", d: "char" }, answer: "c" },
    { question: "What does JVM stand for?", options: { a: "Java Variable Machine", b: "Java Virtual Machine", c: "Java Visual Manager", d: "Java Version Manager" }, answer: "b" },
    { question: "Which concept allows a class to inherit from another class?", options: { a: "Polymorphism", b: "Encapsulation", c: "Inheritance", d: "Abstraction" }, answer: "c" },
    { question: "What is the default value of an int variable in Java?", options: { a: "null", b: "1", c: "0", d: "undefined" }, answer: "c" },
    { question: "Which keyword is used to handle exceptions in Java?", options: { a: "catch", b: "handle", c: "error", d: "try" }, answer: "d" },
    { question: "What is an interface in Java?", options: { a: "A type of variable", b: "A contract that classes must implement", c: "A loop structure", d: "A data type" }, answer: "b" },
    { question: "Which collection class allows duplicate elements?", options: { a: "HashSet", b: "TreeSet", c: "ArrayList", d: "HashMap" }, answer: "c" },
    { question: "What is method overloading?", options: { a: "Defining methods in different classes", b: "Defining multiple methods with the same name but different parameters", c: "Calling a method multiple times", d: "Overriding a parent method" }, answer: "b" }
  ]
};

/**
 * Returns 10 shuffled questions for the given subject from the local bank.
 * @param {string} subject - Subject name (case-insensitive, matched to uppercase key)
 * @returns {Array} - Array of question objects
 */
function getLocalQuestions(subject) {
  const key = subject.toUpperCase();
  const questions = questionBank[key];
  if (!questions) {
    throw new Error(`No local questions available for subject: ${subject}`);
  }
  // Shuffle and return
  return [...questions].sort(() => Math.random() - 0.5);
}

module.exports = { getLocalQuestions, questionBank };

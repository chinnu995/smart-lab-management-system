/**
 * VTU Syllabus MCQ Question Bank — Comprehensive Question Bank for 16 CS/IS/EC Subjects
 * Aligned with VTU University Curriculum Modules (ADA, DBMS, LATEX, MICROCONTROLLER, MONGODB,
 * AI, JAVA, PYTHON, OPERATING SYSTEMS, COMPUTER NETWORKS, WEB TECHNOLOGY, DATA STRUCTURES,
 * CYBER SECURITY, C LANGUAGE, SOFTWARE ENGINEERING, CLOUD COMPUTING)
 */

const questionBank = {
  ADA: [
    { question: "What is the tight asymptotic upper bound notation for algorithm complexity?", options: { a: "Big-O Notation [O]", b: "Big-Omega Notation [Ω]", c: "Theta Notation [Θ]", d: "Little-o Notation" }, answer: "a" },
    { question: "What is the average and worst-case time complexity of Merge Sort?", options: { a: "O(n log n) for both", b: "O(n) average, O(n²) worst", c: "O(n²) for both", d: "O(log n) average, O(n log n) worst" }, answer: "a" },
    { question: "Which algorithm design technique does Quick Sort utilize?", options: { a: "Greedy Approach", b: "Divide and Conquer", c: "Dynamic Programming", d: "Backtracking" }, answer: "b" },
    { question: "What is the worst-case time complexity of Quick Sort when array is already sorted?", options: { a: "O(n log n)", b: "O(n²)", c: "O(n)", d: "O(log n)" }, answer: "b" },
    { question: "Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights?", options: { a: "Dijkstra's Algorithm", b: "Floyd-Warshall Algorithm", c: "Bellman-Ford Algorithm", d: "Kruskal's Algorithm" }, answer: "a" },
    { question: "Which strategy does Prim's algorithm use to construct a Minimum Spanning Tree?", options: { a: "Dynamic Programming", b: "Greedy Strategy", c: "Brute Force", d: "Divide and Conquer" }, answer: "b" },
    { question: "What is the core principle of Dynamic Programming?", options: { a: "Using random choices", b: "Overlapping subproblems and optimal substructure", c: "Divide into non-overlapping subproblems", d: "Greedy choice at each step" }, answer: "b" },
    { question: "What is the time complexity of 0/1 Knapsack problem using Dynamic Programming?", options: { a: "O(N * W)", b: "O(N²)", c: "O(2^N)", d: "O(N log N)" }, answer: "a" },
    { question: "Which technique is used to solve the N-Queens problem?", options: { a: "Greedy Method", b: "Backtracking", c: "Dynamic Programming", d: "Divide and Conquer" }, answer: "b" },
    { question: "Which of the following problems belongs to the NP-Complete class?", options: { a: "Single Source Shortest Path", b: "Traveling Salesperson Problem (Decision Version)", c: "Binary Search", d: "Minimum Spanning Tree" }, answer: "b" },
    { question: "What is the minimum number of comparisons needed to find the maximum element in an unsorted array of size n?", options: { a: "n - 1", b: "n", c: "n log n", d: "n / 2" }, answer: "a" },
    { question: "Which graph traversal technique uses a Queue data structure?", options: { a: "Depth-First Search (DFS)", b: "Breadth-First Search (BFS)", c: "Preorder Traversal", d: "Topological Sorting" }, answer: "b" }
  ],

  DBMS: [
    { question: "Which property of ACID ensures that all operations in a transaction complete successfully or none are applied?", options: { a: "Atomicity", b: "Consistency", c: "Isolation", d: "Durability" }, answer: "a" },
    { question: "Which Normal Form eliminates partial functional dependencies?", options: { a: "1NF", b: "2NF", c: "3NF", d: "BCNF" }, answer: "b" },
    { question: "A relation is in 3NF if it is in 2NF and has no:", options: { a: "Multivalued dependencies", b: "Transitive dependencies", c: "Partial dependencies", d: "Join dependencies" }, answer: "b" },
    { question: "Which SQL command is classified under Data Definition Language (DDL)?", options: { a: "SELECT", b: "INSERT", c: "CREATE", d: "UPDATE" }, answer: "c" },
    { question: "Which type of SQL JOIN returns all rows from the left table and matched rows from the right table?", options: { a: "INNER JOIN", b: "LEFT OUTER JOIN", c: "RIGHT OUTER JOIN", d: "FULL OUTER JOIN" }, answer: "b" },
    { question: "What is a Foreign Key in relational database design?", options: { a: "A primary key in another relation referencing records", b: "A candidate key that cannot be null", c: "An index created on string columns", d: "A key that unique identifies rows in the current table" }, answer: "a" },
    { question: "Which indexing data structure is most commonly used in database storage engines for range queries?", options: { a: "Binary Search Tree", b: "B+ Tree", c: "Hash Index", d: "AVL Tree" }, answer: "b" },
    { question: "What is the purpose of the HAVING clause in SQL?", options: { a: "Filters individual rows before grouping", b: "Filters aggregated groups after GROUP BY", c: "Sorts query output in descending order", d: "Joins two tables on a foreign key" }, answer: "b" },
    { question: "Which operation is used to combine the results of two SELECT queries while removing duplicate rows?", options: { a: "JOIN", b: "UNION", c: "INTERSECT", d: "MINUS" }, answer: "b" },
    { question: "In a relational schema, what does the degree of a relation refer to?", options: { a: "Number of rows (tuples)", b: "Number of columns (attributes)", c: "Number of primary keys", d: "Number of foreign keys" }, answer: "b" },
    { question: "Which SQL constraint prevents NULL values from being inserted into a column?", options: { a: "CHECK", b: "UNIQUE", c: "NOT NULL", d: "DEFAULT" }, answer: "c" },
    { question: "Which log-based recovery technique writes logs to disk before database modifications occur?", options: { a: "Write-Ahead Logging (WAL)", b: "Shadow Paging", c: "Checkpoints", d: "Deferred Modification" }, answer: "a" }
  ],

  LATEX: [
    { question: "Which command marks the beginning of a LaTeX document source file?", options: { a: "\\startdocument", b: "\\begin{document}", c: "\\document{begin}", d: "\\open{document}" }, answer: "b" },
    { question: "Which command is used to include external graphics and images in LaTeX?", options: { a: "\\includesgraphic{}", b: "\\includegraphics{}", c: "\\insertimage{}", d: "\\picture{}" }, answer: "b" },
    { question: "Which LaTeX package is required for inserting mathematical equations and symbols?", options: { a: "graphicx", b: "amsmath", c: "hyperref", d: "geometry" }, answer: "b" },
    { question: "How is inline mathematical mode represented in LaTeX?", options: { a: "\\math{ ... }", b: "$ ... $", c: "[ ... ]", d: "{ ... }" }, answer: "b" },
    { question: "Which environment is used for creating unordered bulleted lists?", options: { a: "enumerate", b: "itemize", c: "description", d: "bulletlist" }, answer: "b" },
    { question: "Which command automatically generates a Table of Contents in a LaTeX document?", options: { a: "\\makecontents", b: "\\tableofcontents", c: "\\showtoc", d: "\\generatecontents" }, answer: "b" },
    { question: "What file extension is generated after successfully compiling a LaTeX file?", options: { a: ".doc", b: ".pdf", c: ".txt", d: ".html" }, answer: "b" },
    { question: "Which command is used to make text bold in LaTeX?", options: { a: "\\bold{text}", b: "\\textbf{text}", c: "\\bf{text}", d: "\\strong{text}" }, answer: "b" },
    { question: "Which environment is used to format tabular data into columns and rows?", options: { a: "\\begin{table}", b: "\\begin{tabular}", c: "\\begin{grid}", d: "\\begin{matrix}" }, answer: "b" },
    { question: "Which command adds hyperlinked references and clickable URLs to a PDF in LaTeX?", options: { a: "\\usepackage{hyperref}", b: "\\usepackage{url}", c: "\\usepackage{link}", d: "\\usepackage{nav}" }, answer: "a" }
  ],

  MICROCONTROLLER: [
    { question: "How many bits is the architecture of the 8051 microcontroller?", options: { a: "4-bit", b: "8-bit", c: "16-bit", d: "32-bit" }, answer: "b" },
    { question: "What is the size of internal RAM in the standard 8051 microcontroller?", options: { a: "64 Bytes", b: "128 Bytes", c: "256 Bytes", d: "1024 Bytes" }, answer: "b" },
    { question: "Which special function register (SFR) holds the 8051 program status flags?", options: { a: "ACC", b: "PSW (Program Status Word)", c: "DPTR", d: "SP" }, answer: "b" },
    { question: "What is the function of the DPTR register in 8051 microcontroller?", options: { a: "16-bit Data Pointer used to access external memory", b: "Stack Pointer for subroutines", c: "Timer 0 control register", d: "Program counter" }, answer: "a" },
    { question: "Which addressing mode is illustrated by the instruction: MOV A, #55H?", options: { a: "Direct Addressing", b: "Immediate Addressing", c: "Register Addressing", d: "Register Indirect" }, answer: "b" },
    { question: "How many hardware interrupts are available in the 8051 microcontroller?", options: { a: "2", b: "5", c: "8", d: "10" }, answer: "b" },
    { question: "Which register controls the operational mode of Timers (Timer 0 and Timer 1) in 8051?", options: { a: "TCON", b: "TMOD", c: "SCON", d: "PCON" }, answer: "b" },
    { question: "What happens to the Stack Pointer (SP) during a PUSH instruction in 8051?", options: { a: "Decremented by 1", b: "Incremented by 1", c: "Remains unchanged", d: "Cleared to 00H" }, answer: "b" },
    { question: "Which baud rate generation hardware is commonly used for serial communication in 8051?", options: { a: "Timer 0 in Mode 1", b: "Timer 1 in Mode 2 (8-bit Auto-reload)", c: "External interrupt INT0", d: "PCA counter" }, answer: "b" },
    { question: "What is the width of the Program Counter (PC) in the 8051 microcontroller?", options: { a: "8 bits", b: "16 bits", c: "24 bits", d: "32 bits" }, answer: "b" }
  ],

  MONGODB: [
    { question: "What type of data storage model does MongoDB use?", options: { a: "Relational Tables", b: "Document-oriented BSON (Binary JSON)", c: "Graph Nodes", d: "Columnar Storage" }, answer: "b" },
    { question: "Which command inserts a single document into a MongoDB collection?", options: { a: "db.collection.add()", b: "db.collection.insertOne()", c: "db.collection.saveDoc()", d: "db.collection.put()" }, answer: "b" },
    { question: "What is the equivalent of a Relational Database Table in MongoDB?", options: { a: "Document", b: "Collection", c: "Schema", d: "Tuple" }, answer: "b" },
    { question: "Which aggregation stage in MongoDB is used to filter documents based on a condition?", options: { a: "$project", b: "$match", c: "$group", d: "$unwind" }, answer: "b" },
    { question: "What is the mandatory primary key field automatically generated for every MongoDB document?", options: { a: "id", b: "_id", c: "doc_id", d: "key" }, answer: "b" },
    { question: "Which method is used to return only selected fields from a query result in MongoDB?", options: { a: "Projection", b: "Indexing", c: "Sharding", d: "Replication" }, answer: "a" },
    { question: "What mechanism does MongoDB use for horizontal scaling across multiple servers?", options: { a: "Replication", b: "Sharding", c: "Indexing", d: "Mirroring" }, answer: "b" },
    { question: "Which comparison operator represents 'Greater Than or Equal to' in MongoDB queries?", options: { a: "$gt", b: "$gte", c: "$eq", d: "$ne" }, answer: "b" },
    { question: "What is a Replica Set in MongoDB?", options: { a: "A backup archive on S3", b: "A cluster of mongod instances maintaining the same dataset for high availability", c: "An index cache", d: "A sharded collection key" }, answer: "b" },
    { question: "Which aggregation pipeline operator breaks an array field in a document into individual documents?", options: { a: "$group", b: "$unwind", c: "$lookup", d: "$facet" }, answer: "b" }
  ],

  AI: [
    { question: "Which uninformed search algorithm guarantees finding the shortest path on unweighted graphs?", options: { a: "Depth-First Search (DFS)", b: "Breadth-First Search (BFS)", c: "Depth-Limited Search", d: "Bidirectional Search" }, answer: "b" },
    { question: "What additional information does an Informed Search algorithm (like A*) utilize?", options: { a: "Random seed", b: "Heuristic Evaluation Function h(n)", c: "Stack order", d: "Backtracking history" }, answer: "b" },
    { question: "What is the condition for a heuristic h(n) to be Admissible in A* Search?", options: { a: "h(n) must never overestimate the true cost to reach the goal", b: "h(n) must equal zero for all nodes", c: "h(n) must overestimate the goal cost", d: "h(n) must be negative" }, answer: "a" },
    { question: "Which adversarial search algorithm is used by AI for two-player turn-based games like Chess?", options: { a: "Minimax with Alpha-Beta Pruning", b: "Genetic Algorithm", c: "Q-Learning", d: "Backpropagation" }, answer: "a" },
    { question: "What is the role of Alpha-Beta Pruning in Minimax search?", options: { a: "Increases tree depth", b: "Prunes branches that cannot influence the final decision to speed up search", c: "Replaces heuristic evaluation", d: "Guarantees infinite depth search" }, answer: "b" },
    { question: "Which machine learning paradigm involves learning through rewards and penalties?", options: { a: "Supervised Learning", b: "Unsupervised Learning", c: "Reinforcement Learning", d: "Semi-supervised Learning" }, answer: "c" },
    { question: "What issue occurs when a machine learning model fits training noise and fails to generalize to test data?", options: { a: "Underfitting", b: "Overfitting", c: "Optimal Fitting", d: "High Bias" }, answer: "b" },
    { question: "What activation function outputs values in the range (0, 1), commonly used for binary classification?", options: { a: "ReLU", b: "Sigmoid", c: "Tanh", d: "Leaky ReLU" }, answer: "b" },
    { question: "Which AI field deals with enabling computers to understand and generate human text and speech?", options: { a: "Computer Vision", b: "Natural Language Processing (NLP)", c: "Robotics", d: "Expert Systems" }, answer: "b" },
    { question: "In Artificial Neural Networks, which algorithm updates weights by propagating error backwards?", options: { a: "Forward Propagation", b: "Backpropagation", c: "Convolution", d: "K-Means Clustering" }, answer: "b" }
  ],

  JAVA: [
    { question: "Which feature of Java allows code written once to run on any operating system with a JVM?", options: { a: "Platform Independence (Bytecode)", b: "Garbage Collector", c: "Multiple Inheritance", d: "Pointers" }, answer: "a" },
    { question: "What is the entry point method signature for a Java application?", options: { a: "public void main(String[] args)", b: "public static void main(String[] args)", c: "private static void main(String args)", d: "static void main()" }, answer: "b" },
    { question: "Which keyword is used by a class to implement an interface in Java?", options: { a: "extends", b: "implements", c: "inherits", d: "using" }, answer: "b" },
    { question: "Which OOP principle hides internal implementation details and exposes only necessary features?", options: { a: "Polymorphism", b: "Abstraction", c: "Inheritance", d: "Encapsulation" }, answer: "b" },
    { question: "What is the difference between method Overloading and method Overriding?", options: { a: "Overloading happens in the same class (same name, different params); Overriding happens in sub-class (same signature)", b: "Overloading happens in subclasses only", c: "Overriding requires static methods", d: "They are identical in Java" }, answer: "a" },
    { question: "Which block in exception handling ALWAYS executes whether an exception occurs or not?", options: { a: "try", b: "catch", c: "finally", d: "throw" }, answer: "c" },
    { question: "Which Java Collection class guarantees unique elements and no duplicates?", options: { a: "ArrayList", b: "LinkedList", c: "HashSet", d: "Vector" }, answer: "c" },
    { question: "Which keyword prevents a variable from being re-assigned or a method from being overridden?", options: { a: "static", b: "final", c: "abstract", d: "synchronized" }, answer: "b" },
    { question: "What is the default initial capacity of an ArrayList in Java?", options: { a: "5", b: "10", c: "16", d: "20" }, answer: "b" },
    { question: "Which interface must be implemented to create a thread in Java?", options: { a: "Runnable", b: "Callable", c: "Threadable", d: "Process" }, answer: "a" },
    { question: "What happens when System.gc() is invoked in Java?", options: { a: "Instantly frees all RAM", b: "Requests JVM to run Garbage Collection", c: "Terminates the JVM process", d: "Clears stack frame" }, answer: "b" }
  ],

  C_LANGUAGE: [
    { question: "What is the size of int data type in standard 32-bit C compilers?", options: { a: "1 Byte", b: "2 Bytes", c: "4 Bytes", d: "8 Bytes" }, answer: "c" },
    { question: "Which operator is used to access the memory address of a variable in C?", options: { a: "* (Dereference)", b: "& (Address-of)", c: "-> (Structure Pointer)", d: ". (Dot)" }, answer: "b" },
    { question: "What does the function malloc() return if memory allocation fails?", options: { a: "0", b: "NULL pointer", c: "-1", d: "Void" }, answer: "b" },
    { question: "Which library function is used to dynamically reallocate memory in C?", options: { a: "calloc()", b: "realloc()", c: "free()", d: "alloc()" }, answer: "b" },
    { question: "What is the purpose of the 'break' statement in C switch-case structures?", options: { a: "Restarts the switch loop", b: "Exits from the current switch case block immediately", c: "Skips the default case", d: "Terminates the program" }, answer: "b" },
    { question: "What character automatically terminates every C string in memory?", options: { a: "'\\0' (Null Character)", b: "'\\n' (Newline)", c: "'\\t' (Tab)", d: "'EOF'" }, answer: "a" },
    { question: "Difference between structure (struct) and union in C memory allocation?", options: { a: "Struct allocates separate memory for each member; Union shares the memory of its largest member", b: "Union allocates more memory than struct", c: "Struct can store only integers", d: "There is no difference" }, answer: "a" },
    { question: "Which storage class variable retains its value between function calls throughout program execution?", options: { a: "auto", b: "register", c: "static", d: "extern" }, answer: "c" },
    { question: "What is the result of applying sizeof(\"Hello\") in C?", options: { a: "5", b: "6 (includes '\\0')", c: "4", d: "8" }, answer: "b" },
    { question: "Which mode in fopen() opens a file for writing, overwriting existing file content?", options: { a: "\"r\"", b: "\"w\"", c: "\"a\"", d: "\"r+\"" }, answer: "b" }
  ],

  PYTHON: [
    { question: "Which Python built-in data type is IMMUTABLE?", options: { a: "List", b: "Dictionary", c: "Tuple", d: "Set" }, answer: "c" },
    { question: "What is the output of print(3 * 2 ** 3) in Python?", options: { a: "216", b: "24", c: "18", d: "36" }, answer: "b" },
    { question: "Which method adds an element to the end of a List in Python?", options: { a: "append()", b: "extend()", c: "insert()", d: "push()" }, answer: "a" },
    { question: "What does the PEP 8 style guide recommend for Python indentation?", options: { a: "2 Spaces", b: "4 Spaces per indentation level", c: "1 Tab", d: "8 Spaces" }, answer: "b" },
    { question: "Which keyword is used to handle exceptions in Python?", options: { a: "catch", b: "except", c: "try", d: "finally" }, answer: "b" },
    { question: "What does a lambda function represent in Python?", options: { a: "A recursive class", b: "An anonymous inline function with a single expression", c: "A multi-line module", d: "A decorator" }, answer: "b" },
    { question: "Which library is widely used in Python for multidimensional matrix computation?", options: { a: "Pandas", b: "NumPy", c: "Requests", d: "Flask" }, answer: "b" },
    { question: "What does the list comprehension [x**2 for x in range(4)] return?", options: { a: "[0, 1, 4, 9]", b: "[1, 4, 9, 16]", c: "[0, 2, 4, 6]", d: "[1, 2, 3, 4]" }, answer: "a" },
    { question: "Which special method acts as the constructor in a Python class?", options: { a: "def construct(self):", b: "def __init__(self):", c: "def __create__(self):", d: "def main(self):" }, answer: "b" },
    { question: "What is the function of 'self' parameter in Python class methods?", options: { a: "Refers to the current instance of the class", b: "Refers to global scope", c: "It is a reserved Python system keyword", d: "Imports parent attributes" }, answer: "a" }
  ],

  OPERATING_SYSTEMS: [
    { question: "What is a Process Control Block (PCB) in Operating Systems?", options: { a: "Hardware controller chip", b: "Data structure containing all information about a specific process", c: "Disk memory sector", d: "CPU cache line" }, answer: "b" },
    { question: "Which CPU scheduling algorithm gives the lowest minimum average waiting time for a given set of processes?", options: { a: "First-Come, First-Served (FCFS)", b: "Shortest Job First (SJF)", c: "Round Robin (RR)", d: "Priority Scheduling" }, answer: "b" },
    { question: "Four conditions required simultaneously for a Deadlock to occur:", options: { a: "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", b: "Paging, Swapping, Thrashing, Segmentation", c: "Read, Write, Execute, Delete", d: "Dispatch, Yield, Interrupt, Signal" }, answer: "a" },
    { question: "What is Virtual Memory in modern operating systems?", options: { a: "ROM memory", b: "Technique that creates an illusion of larger main memory using disk space", c: "CPU L1 Cache", d: "High-speed RAM registers" }, answer: "b" },
    { question: "What is Thrashing in virtual memory management?", options: { a: "High CPU processing efficiency", b: "Condition where the OS spends more time swapping pages than executing instructions", c: "Disk formatting error", d: "Network packet drop" }, answer: "b" },
    { question: "What is a Semaphore in IPC and process synchronization?", options: { a: "An integer variable used for signaling and mutual exclusion", b: "A file locking algorithm", c: "A hardware bus signal", d: "A memory pointer" }, answer: "a" },
    { question: "Which system call creates a duplicate child process in Unix/Linux operating systems?", options: { a: "exec()", b: "fork()", c: "spawn()", d: "create()" }, answer: "b" },
    { question: "What is the main advantage of Paging over Segmentation?", options: { a: "Eliminates internal fragmentation", b: "Eliminates external fragmentation", c: "No page tables required", d: "Faster compilation" }, answer: "b" },
    { question: "Which page replacement algorithm suffers from Belady's Anomaly?", options: { a: "Least Recently Used (LRU)", b: "First-In, First-Out (FIFO)", c: "Optimal Page Replacement", d: "Second Chance" }, answer: "b" },
    { question: "What is the purpose of Banker's Algorithm in OS?", options: { a: "Deadlock Detection", b: "Deadlock Avoidance", c: "Deadlock Recovery", d: "Process Scheduling" }, answer: "b" }
  ],

  COMPUTER_NETWORKS: [
    { question: "How many layers are in the OSI Reference Model?", options: { a: "4", b: "5", c: "7", d: "8" }, answer: "c" },
    { question: "At which layer of the OSI model does a Router operate?", options: { a: "Data Link Layer (Layer 2)", b: "Network Layer (Layer 3)", c: "Transport Layer (Layer 4)", d: "Application Layer (Layer 7)" }, answer: "b" },
    { question: "What is the primary difference between TCP and UDP transport protocols?", options: { a: "TCP is connection-oriented & reliable; UDP is connectionless & fast", b: "UDP guarantees packet delivery order", c: "TCP is used for DNS lookup", d: "UDP uses 3-way handshake" }, answer: "a" },
    { question: "What is the subnet mask for a standard Class C IPv4 address network (/24)?", options: { a: "255.0.0.0", b: "255.255.0.0", c: "255.255.255.0", d: "255.255.255.255" }, answer: "c" },
    { question: "Which application protocol resolves Domain Names (e.g. google.com) to IP addresses?", options: { a: "DHCP", b: "DNS", c: "ARP", d: "FTP" }, answer: "b" },
    { question: "What is the length of an IPv6 address in bits?", options: { a: "32 bits", b: "64 bits", c: "128 bits", d: "256 bits" }, answer: "c" },
    { question: "Which protocol is used to map an IP address to a physical MAC address on a local network?", options: { a: "RARP", b: "ARP (Address Resolution Protocol)", c: "ICMP", d: "IGMP" }, answer: "b" },
    { question: "What mechanism does TCP use for flow control between sender and receiver?", options: { a: "Sliding Window Protocol", b: "Stop and Wait", c: "Token Bucket", d: "Choke Packets" }, answer: "a" },
    { question: "Which port number is default for secure HTTPS traffic?", options: { a: "80", b: "21", c: "443", d: "8080" }, answer: "c" },
    { question: "Which routing algorithm is based on Dijkstra's shortest path algorithm?", options: { a: "Distance Vector Routing", b: "Link State Routing (OSPF)", c: "BGP Path Vector", d: "Flooding" }, answer: "b" }
  ],

  WEB_TECHNOLOGY: [
    { question: "Which HTML5 tag is used to embed client-side interactive vector graphics and drawing?", options: { a: "<canvas>", b: "<svg>", c: "<picture>", d: "<graphic>" }, answer: "a" },
    { question: "Which CSS layout box model module allows 1D alignment of flex items along main and cross axes?", options: { a: "CSS Grid", b: "Flexbox", c: "Float Layout", d: "Position Absolute" }, answer: "b" },
    { question: "What output is generated by typeof NaN in JavaScript?", options: { a: "\"NaN\"", b: "\"undefined\"", c: "\"number\"", d: "\"object\"" }, answer: "c" },
    { question: "Which HTTP request method is Idempotent, used to update or replace a target resource?", options: { a: "POST", b: "PUT", c: "DELETE", d: "PATCH" }, answer: "b" },
    { question: "In React, what Hook is used to handle side effects like data fetching and subscription listeners?", options: { a: "useState", b: "useEffect", c: "useContext", d: "useReducer" }, answer: "b" },
    { question: "What does CORS stand for in Web Application Security?", options: { a: "Cross-Origin Resource Sharing", b: "Client Origin Redirect System", c: "Core Object Routing Service", d: "Cross-Site Request Shield" }, answer: "a" },
    { question: "What is the purpose of JWT (JSON Web Token) in Web Authentication?", options: { a: "Encrypting database tables", b: "Stateless transmission of user identity claims signed with a secret key", c: "CSS styling", d: "Managing WebSockets" }, answer: "b" },
    { question: "In Node.js, what is the Event Loop responsible for?", options: { a: "Executing synchronous CPU loops", b: "Handling asynchronous non-blocking I/O callbacks", c: "Compiling HTML templates", d: "Managing MySQL connections" }, answer: "b" },
    { question: "Which ES6 JavaScript feature extracts properties from objects into distinct variables?", options: { a: "Spread Operator", b: "Destructuring Assignment", c: "Template Literals", d: "Arrow Function" }, answer: "b" },
    { question: "What is the difference between localStorage and sessionStorage in Web Storage API?", options: { a: "localStorage persists data after browser close; sessionStorage clears data when tab closes", b: "sessionStorage holds 50MB", c: "localStorage sends data with every HTTP header", d: "They are identical" }, answer: "a" }
  ],

  DATA_STRUCTURES: [
    { question: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: { a: "Queue", b: "Stack", c: "Array", d: "Tree" }, answer: "b" },
    { question: "What is the time complexity of pushing an element onto a Stack implemented as a Linked List?", options: { a: "O(1)", b: "O(n)", c: "O(log n)", d: "O(n²)" }, answer: "a" },
    { question: "In a Binary Search Tree (BST), which traversal produces elements in strictly ASCENDING sorted order?", options: { a: "Preorder Traversal", b: "Inorder Traversal", c: "Postorder Traversal", d: "Level Order Traversal" }, answer: "b" },
    { question: "What is the maximum balance factor allowed for any node in an AVL Tree?", options: { a: "0", b: "{-1, 0, +1}", c: "{-2, +2}", d: "Infinite" }, answer: "b" },
    { question: "Which Queue variation allows insertion and deletion from both front and rear ends?", options: { a: "Circular Queue", b: "Deque (Double-Ended Queue)", c: "Priority Queue", d: "Simple Queue" }, answer: "b" },
    { question: "What technique resolves Hash Collisions by chaining multiple entries at the same hash index?", options: { a: "Linear Probing", b: "Separate Chaining (Open Hashing)", c: "Quadratic Probing", d: "Double Hashing" }, answer: "b" },
    { question: "What is the height of a balanced Binary Tree containing n nodes?", options: { a: "O(n)", b: "O(log n)", c: "O(n log n)", d: "O(1)" }, answer: "b" },
    { question: "Which traversal strategy is equivalent to Breadth-First Search (BFS) on a Tree?", options: { a: "Preorder", b: "Inorder", c: "Postorder", d: "Level-Order" }, answer: "d" },
    { question: "What is the main advantage of a Circular Linked List over a Singly Linked List?", options: { a: "Traverse whole list starting from any arbitrary node", b: "Uses less memory", c: "O(1) search time", d: "No pointers required" }, answer: "a" },
    { question: "What data structure is used to evaluate Postfix (Reverse Polish Notation) expressions?", options: { a: "Queue", b: "Stack", c: "Tree", d: "Graph" }, answer: "b" }
  ],
  DSA: [
    { question: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: { a: "Queue", b: "Stack", c: "Array", d: "Tree" }, answer: "b" },
    { question: "What is the time complexity of pushing an element onto a Stack implemented as a Linked List?", options: { a: "O(1)", b: "O(n)", c: "O(log n)", d: "O(n²)" }, answer: "a" },
    { question: "In a Binary Search Tree (BST), which traversal produces elements in strictly ASCENDING sorted order?", options: { a: "Preorder Traversal", b: "Inorder Traversal", c: "Postorder Traversal", d: "Level Order Traversal" }, answer: "b" },
    { question: "What is the maximum balance factor allowed for any node in an AVL Tree?", options: { a: "0", b: "{-1, 0, +1}", c: "{-2, +2}", d: "Infinite" }, answer: "b" },
    { question: "Which Queue variation allows insertion and deletion from both front and rear ends?", options: { a: "Circular Queue", b: "Deque (Double-Ended Queue)", c: "Priority Queue", d: "Simple Queue" }, answer: "b" },
    { question: "What technique resolves Hash Collisions by chaining multiple entries at the same hash index?", options: { a: "Linear Probing", b: "Separate Chaining (Open Hashing)", c: "Quadratic Probing", d: "Double Hashing" }, answer: "b" },
    { question: "What is the height of a balanced Binary Tree containing n nodes?", options: { a: "O(n)", b: "O(log n)", c: "O(n log n)", d: "O(1)" }, answer: "b" },
    { question: "Which traversal strategy is equivalent to Breadth-First Search (BFS) on a Tree?", options: { a: "Preorder", b: "Inorder", c: "Postorder", d: "Level-Order" }, answer: "d" },
    { question: "What is the main advantage of a Circular Linked List over a Singly Linked List?", options: { a: "Traverse whole list starting from any arbitrary node", b: "Uses less memory", c: "O(1) search time", d: "No pointers required" }, answer: "a" },
    { question: "What data structure is used to evaluate Postfix (Reverse Polish Notation) expressions?", options: { a: "Queue", b: "Stack", c: "Tree", d: "Graph" }, answer: "b" }
  ],

  CYBER_SECURITY: [
    { question: "Which type of encryption uses a single shared key for both encryption and decryption?", options: { a: "Symmetric Encryption (e.g. AES)", b: "Asymmetric Encryption (e.g. RSA)", c: "Hashing", d: "Steganography" }, answer: "a" },
    { question: "What property of Cryptographic Hash Functions (e.g. SHA-256) makes them irreversible?", options: { a: "One-Way Property", b: "Two-Way Decryption", c: "Public Key Exchange", d: "Symmetric key length" }, answer: "a" },
    { question: "Which web attack occurs when malicious SQL code is injected into user input fields to manipulate database queries?", options: { a: "Cross-Site Scripting (XSS)", b: "SQL Injection (SQLi)", c: "CSRF", d: "DDoS" }, answer: "b" },
    { question: "What type of attack involves an adversary secretly relaying and altering communication between two parties?", options: { a: "Man-in-the-Middle (MitM) Attack", b: "Buffer Overflow", c: "Phishing", d: "Zero-Day Exploit" }, answer: "a" },
    { question: "Which protocol secures web traffic between browser and server using SSL/TLS certificate handshakes?", options: { a: "HTTP", b: "HTTPS", c: "FTP", d: "SSH" }, answer: "b" },
    { question: "What is Cross-Site Scripting (XSS)?", options: { a: "Injecting client-side malicious scripts into trusted websites viewed by users", b: "Overloading server memory", c: "Cracking passwords via brute force", d: "Intercepting Wi-Fi packets" }, answer: "a" },
    { question: "Which asymmetric encryption algorithm relies on the mathematical difficulty of factoring large prime numbers?", options: { a: "AES", b: "RSA", c: "DES", d: "Blowfish" }, answer: "b" },
    { question: "What security component monitors network traffic and enforces rules to block unauthorized access?", options: { a: "Router", b: "Firewall", c: "Switch", d: "DNS Server" }, answer: "b" },
    { question: "What is Multi-Factor Authentication (MFA)?", options: { a: "Using 2 or more independent credentials (Password + OTP/Biometric) to verify identity", b: "Changing passwords every 30 days", c: "Using 2 passwords", d: "Logging into 2 devices" }, answer: "a" },
    { question: "What attack floods a target server with overwhelming traffic from multiple compromised devices?", options: { a: "Distributed Denial of Service (DDoS)", b: "Phishing", c: "Spoofing", d: "Port Scanning" }, answer: "a" }
  ],

  SOFTWARE_ENGINEERING: [
    { question: "Which SDLC model advocates short 2 to 4 week iterative development Sprints and daily standups?", options: { a: "Waterfall Model", b: "Agile Scrum Framework", c: "V-Model", d: "Big Bang Model" }, answer: "b" },
    { question: "What type of testing examines the internal logic, code paths, and structure of software?", options: { a: "Black Box Testing", b: "White Box Testing", c: "System Testing", d: "User Acceptance Testing (UAT)" }, answer: "b" },
    { question: "In UML diagrams, which diagram models static structure showing classes, attributes, methods, and relationships?", options: { a: "Sequence Diagram", b: "Class Diagram", c: "Use Case Diagram", d: "Activity Diagram" }, answer: "b" },
    { question: "What is Functional Requirement in software specification?", options: { a: "Specific behavior or feature the software system must perform", b: "Performance SLA target", c: "Security compliance policy", d: "Server hardware specs" }, answer: "a" },
    { question: "Which software design principle states that software entities should be open for extension but closed for modification?", options: { a: "Single Responsibility Principle", b: "Open-Closed Principle (SOLID)", c: "Liskov Substitution", d: "Dependency Inversion" }, answer: "b" },
    { question: "What is Integration Testing?", options: { a: "Testing individual functions", b: "Testing combined modules together to verify interaction", c: "User deployment test", d: "Stress load testing" }, answer: "b" },
    { question: "What is Refactoring in software development?", options: { a: "Rewriting code to change external functionality", b: "Restructuring existing code without altering its external behavior to improve maintainability", c: "Adding new database schemas", d: "Deleting unit test cases" }, answer: "b" },
    { question: "Which metric measures the degree of interdependence between software modules?", options: { a: "Cohesion", b: "Coupling", c: "Complexity", d: "Cyclomatic Index" }, answer: "b" },
    { question: "High Cohesion in software engineering implies:", options: { a: "Module elements are strongly focused on a single responsibility", b: "Modules are tightly coupled to each other", c: "Modules have global variables", d: "Large file sizes" }, answer: "a" },
    { question: "What does DevOps emphasize in software lifecycle management?", options: { a: "Strict separation between Devs and Ops", b: "Continuous Integration & Continuous Delivery (CI/CD) with automated deployment", c: "Manual QA testing only", d: "No documentation" }, answer: "b" }
  ],

  CLOUD_COMPUTING: [
    { question: "Which cloud service model provides virtualized computing infrastructure (VMs, storage, network) to users?", options: { a: "SaaS (Software as a Service)", b: "PaaS (Platform as a Service)", c: "IaaS (Infrastructure as a Service)", d: "FaaS (Function as a Service)" }, answer: "c" },
    { question: "Which cloud service model is illustrated by Google Workspace, Microsoft 365, and Salesforce?", options: { a: "IaaS", b: "PaaS", c: "SaaS", d: "BaaS" }, answer: "c" },
    { question: "What is a Hypervisor (Virtual Machine Monitor) in cloud virtualization?", options: { a: "Software/firmware that creates and runs virtual machines on host hardware", b: "Container engine", c: "Cloud database", d: "Load balancer" }, answer: "a" },
    { question: "Which containerization platform packages applications and dependencies into lightweight portable containers?", options: { a: "Kubernetes", b: "Docker", c: "Hyper-V", d: "VMware ESXi" }, answer: "b" },
    { question: "What open-source orchestration tool automates container deployment, scaling, and management?", options: { a: "Docker Swarm", b: "Kubernetes (K8s)", c: "Jenkins", d: "Terraform" }, answer: "b" },
    { question: "What is Serverless Computing (FaaS)?", options: { a: "Running applications without physical hardware anywhere", b: "Cloud execution model where cloud providers dynamically manage server allocation per event invocation", c: "Static website hosting", d: "Bare-metal hosting" }, answer: "b" },
    { question: "Which cloud deployment model combines both private on-premise infrastructure and public cloud resources?", options: { a: "Public Cloud", b: "Private Cloud", c: "Hybrid Cloud", d: "Community Cloud" }, answer: "c" },
    { question: "What cloud elasticity feature automatically adjusts active server instances based on real-time traffic spikes?", options: { a: "Auto Scaling", b: "Load Balancing", c: "Static Allocation", d: "Snapshotting" }, answer: "a" },
    { question: "Which AWS storage service provides object storage with high durability via REST HTTP APIs?", options: { a: "Amazon EBS", b: "Amazon S3 (Simple Storage Service)", c: "Amazon EFS", d: "Amazon RDS" }, answer: "b" },
    { question: "What infrastructure-as-code (IaC) tool enables declarative provisioning of multi-cloud resources?", options: { a: "Ansible", b: "Terraform", c: "Git", d: "Docker Compose" }, answer: "b" }
  ]
};

// Generic VTU Syllabus Questions Generator for unlisted subjects
function getGenericVTUQuestions(subjectName) {
  const s = subjectName.trim();
  return [
    { question: `What is the primary VTU curriculum objective of the course "${s}"?`, options: { a: `Mastering theoretical concepts, module fundamentals, and lab practicals in ${s}`, b: "Replacing standard hardware components", c: "Disabling security controls", d: "Manual formatted printing" }, answer: "a" },
    { question: `Which design principle is heavily emphasized in VTU syllabus for ${s}?`, options: { a: "Tight coupling of logic", b: `Modular design, error-handling, and efficient computation in ${s}`, c: "Ignoring exception handling", d: "Hardcoding fixed values" }, answer: "b" },
    { question: `In ${s}, why is practical laboratory experimentation vital?`, options: { a: "Validates theoretical models through hands-on implementation and debugging", b: "It is optional", c: "Increases memory overhead unnecessarily", d: "Replaces system architecture" }, answer: "a" },
    { question: `Which standard software/hardware methodology is used when building ${s} applications?`, options: { a: "Systematic modular design with clean documentation", b: "Trial and error patching", c: "Bypassing version control", d: "Disabling compiler warnings" }, answer: "a" },
    { question: `How does algorithmic complexity affect system design in ${s}?`, options: { a: "Decreases throughput", b: `Optimizes time and space resource utilization for ${s} workloads`, c: "Prevents execution", d: "Requires manual restarts" }, answer: "b" },
    { question: `Which assessment criteria is evaluated in VTU examinations for ${s}?`, options: { a: "Problem-solving accuracy, algorithm design, and conceptual clarity", b: "Syntax memorization only", c: "System formatting", d: "External file downloads" }, answer: "a" },
    { question: `Why is data security and validation essential when developing ${s} modules?`, options: { a: "Protects data integrity and prevents vulnerability exploits", b: "Slows down execution by 90%", c: "Applies to financial systems only", d: "Automated by OS" }, answer: "a" },
    { question: `What is the significance of optimization in ${s} solutions?`, options: { a: "Reduces execution latency and memory overhead", b: "Increases latency", c: "Makes code unreadable", d: "Prevents API integration" }, answer: "a" },
    { question: `Which development tools are recommended for ${s} VTU lab assignments?`, options: { a: "Standard IDEs, GCC/JDK/Node runtimes, and debugger tools", b: "Notepad without compiler", c: "Punch card readers", d: "Terminal consoles without syntax highlighting" }, answer: "a" },
    { question: `What is the expected outcome of completing the VTU ${s} lab module?`, options: { a: "Proficiency in program design, unit testing, and problem solving", b: "Generating random log files", c: "Resetting schemas", d: "Downloading external drivers" }, answer: "a" }
  ];
}

/**
 * Fisher-Yates (Knuth) Shuffle algorithm for unbiased uniform random shuffling
 */
function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles question option keys (a, b, c, d) and updates correct answer key
 */
function shuffleQuestionOptions(q) {
  const keys = ['a', 'b', 'c', 'd'];
  const origOpts = [
    { key: 'a', text: q.options.a },
    { key: 'b', text: q.options.b },
    { key: 'c', text: q.options.c },
    { key: 'd', text: q.options.d }
  ];

  const shuffled = fisherYatesShuffle(origOpts);
  const newOptions = {};
  let newAnswer = 'a';

  shuffled.forEach((opt, idx) => {
    const newKey = keys[idx];
    newOptions[newKey] = opt.text;
    if (opt.key === q.answer) {
      newAnswer = newKey;
    }
  });

  return {
    ...q,
    options: newOptions,
    answer: newAnswer
  };
}

/**
 * Returns 10 randomized & option-shuffled questions for the specified subject
 * @param {string} subject - Subject name
 * @returns {Array} - Array of 10 shuffled question objects
 */
function getLocalQuestions(subject) {
  const rawSubject = (subject || '').trim();
  const norm = rawSubject.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  
  let matchKey = null;

  // Direct key lookup
  if (questionBank[norm]) {
    matchKey = norm;
  } else {
    // Fuzzy matching against questionBank keys
    const bankKeys = Object.keys(questionBank);
    for (const key of bankKeys) {
      const cleanKey = key.replace(/_/g, ' ');
      const cleanNorm = norm.replace(/_/g, ' ');
      if (cleanNorm.includes(cleanKey) || cleanKey.includes(cleanNorm)) {
        matchKey = key;
        break;
      }
    }
  }

  let sourceQuestions = matchKey ? questionBank[matchKey] : getGenericVTUQuestions(rawSubject);
  
  // 1. Shuffle question list order with Fisher-Yates
  const shuffledQuestions = fisherYatesShuffle(sourceQuestions);

  // 2. Shuffle option choices (a, b, c, d) for every question
  const fullyShuffled = shuffledQuestions.map(q => shuffleQuestionOptions(q));

  // 3. Return 10 questions
  return fullyShuffled.slice(0, 10);
}

module.exports = { getLocalQuestions, questionBank, fisherYatesShuffle };

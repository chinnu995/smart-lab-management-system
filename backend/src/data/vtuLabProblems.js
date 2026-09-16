const DEFAULT_STARTER_CODE = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`,
  python: `# Write your solution below\nimport sys\n\ndef solve():\n    # Read input from STDIN and print output to STDOUT\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  javascript: `// Write your JavaScript solution below\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    // Write your code here\n}\n\nsolve();\n`,
  sql: `-- Write your SQL query below\nSELECT * FROM table_name;\n`
};

const VTU_ADA_LAB_PROBLEMS = [
  {
    title: 'VTU ADA Lab 1: Kruskal\'s Algorithm (MST)',
    slug: 'vtu-ada-lab-1-kruskal',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 1,
    description: 'Find a Minimum Cost Spanning Tree of a given connected undirected graph using Kruskal\'s Algorithm with Disjoint Set Union (DSU).\n\n**VTU ADA Lab Experiment 1:** Construct MST and output the total minimum weight.',
    input_format: 'First line contains V (vertices) and E (edges).\nNext E lines each contain three space-separated integers: u, v, and weight w.',
    output_format: 'Print total minimum weight of the Minimum Spanning Tree as an integer.',
    constraints: '1 <= V <= 1000, 1 <= E <= 5000, 1 <= w <= 10000',
    sample_cases: [
      { input: '4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4', output: '19', explanation: 'Edges chosen: (2,3,4), (0,3,5), (0,1,10) -> total min weight = 19' },
      { input: '3 3\n0 1 1\n1 2 2\n0 2 3', output: '3', explanation: 'Edges chosen: (0,1,1) + (1,2,2) = 3' },
      { input: '5 7\n0 1 2\n0 3 6\n1 2 3\n1 3 8\n1 4 5\n2 4 7\n3 4 9', output: '16', explanation: 'MST total cost = 16' },
      { input: '2 1\n0 1 42', output: '42', explanation: 'Single edge graph' },
      { input: '4 4\n0 1 1\n1 2 2\n2 3 3\n3 0 4', output: '6', explanation: 'Edges (0,1,1), (1,2,2), (2,3,3) sum to 6' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 2: Prim\'s Algorithm (MST)',
    slug: 'vtu-ada-lab-2-prims',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 2,
    description: 'Find a Minimum Cost Spanning Tree of a given connected undirected graph using Prim\'s Algorithm starting from vertex 0.\n\n**VTU ADA Lab Experiment 2:** Grow MST vertex-by-vertex using Priority Queue.',
    input_format: 'First line contains V and E.\nNext E lines contain u, v, w.',
    output_format: 'Print total minimum spanning tree weight.',
    constraints: '1 <= V <= 1000, 1 <= E <= 5000',
    sample_cases: [
      { input: '5 7\n0 1 2\n0 3 6\n1 2 3\n1 3 8\n1 4 5\n2 4 7\n3 4 9', output: '16', explanation: 'Prim\'s MST cost = 16' },
      { input: '4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4', output: '19', explanation: 'MST total min weight = 19' },
      { input: '3 3\n0 1 5\n1 2 10\n0 2 2', output: '7', explanation: 'Edges (0,2,2) and (0,1,5) sum to 7' },
      { input: '4 3\n0 1 3\n1 2 4\n2 3 5', output: '12', explanation: 'Line graph MST sum = 12' },
      { input: '3 3\n0 1 1\n1 2 1\n0 2 1', output: '2', explanation: 'MST total cost = 2' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 3: Dijkstra\'s Shortest Path Algorithm',
    slug: 'vtu-ada-lab-3-dijkstra',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 3,
    description: 'From a given source vertex S, find shortest distances to all other vertices in a weighted graph using Dijkstra\'s Algorithm.\n\n**VTU ADA Lab Experiment 3:** Single Source Shortest Path formulation.',
    input_format: 'First line contains V, E, and Source S.\nNext E lines contain u, v, w.',
    output_format: 'Print space-separated shortest distances from S to vertices 0 to V-1.',
    constraints: '1 <= V <= 1000, 0 <= S < V',
    sample_cases: [
      { input: '5 6 0\n0 1 4\n0 2 2\n1 2 1\n1 3 5\n2 3 8\n3 4 6', output: '0 3 2 8 14', explanation: 'Distances from vertex 0 to all nodes: [0, 3, 2, 8, 14]' },
      { input: '3 3 0\n0 1 10\n1 2 20\n0 2 5', output: '0 10 5', explanation: 'Shortest dist to 1 is 10, to 2 is 5' },
      { input: '4 4 1\n0 1 2\n1 2 3\n2 3 1\n0 3 10', output: '2 0 3 4', explanation: 'From source 1: dists are 2, 0, 3, 4' },
      { input: '2 1 0\n0 1 7', output: '0 7', explanation: 'Direct path 0 to 1 dist = 7' },
      { input: '4 3 0\n0 1 1\n1 2 2\n2 3 3', output: '0 1 3 6', explanation: 'Path distances 0->1->2->3' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 4: Warshall\'s Transitive Closure',
    slug: 'vtu-ada-lab-4-warshall',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 4,
    description: 'Compute Transitive Closure of a directed graph using Warshall\'s Dynamic Programming Algorithm.\n\n**VTU ADA Lab Experiment 4:** Reachability matrix computation.',
    input_format: 'First line contains V.\nNext V lines contain V space-separated integers (0 or 1).',
    output_format: 'Print the V x V Transitive Closure matrix.',
    constraints: '1 <= V <= 100',
    sample_cases: [
      { input: '4\n0 1 0 0\n0 0 0 1\n0 0 0 0\n1 0 1 0', output: '1 1 1 1\n1 1 1 1\n0 0 0 0\n1 1 1 1', explanation: 'Transitive closure matrix' },
      { input: '3\n0 1 0\n0 0 1\n0 0 0', output: '0 1 1\n0 0 1\n0 0 0', explanation: 'Chain 0->1->2 reachability' },
      { input: '2\n0 1\n1 0', output: '1 1\n1 1', explanation: 'Mutual reachability' },
      { input: '3\n0 0 0\n0 0 0\n0 0 0', output: '0 0 0\n0 0 0\n0 0 0', explanation: 'No edges' },
      { input: '3\n1 0 0\n0 1 0\n0 0 1', output: '1 0 0\n0 1 0\n0 0 1', explanation: 'Diagonal identity matrix' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 5: Floyd\'s All-Pairs Shortest Paths',
    slug: 'vtu-ada-lab-5-floyd',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 5,
    description: 'Find All-Pairs Shortest Paths of a weighted directed graph using Floyd\'s Algorithm (use 999 for infinity).\n\n**VTU ADA Lab Experiment 5:** DP cost matrix formulation.',
    input_format: 'First line contains V.\nNext V lines contain V space-separated integers representing cost matrix (999 for infinity).',
    output_format: 'Print final V x V shortest distance matrix.',
    constraints: '1 <= V <= 100',
    sample_cases: [
      { input: '4\n0 999 3 999\n2 0 999 999\n999 7 0 1\n6 999 999 0', output: '0 10 3 4\n2 0 5 6\n7 7 0 1\n6 16 9 0', explanation: 'All-pairs shortest distances' },
      { input: '3\n0 4 11\n6 0 2\n3 999 0', output: '0 4 6\n5 0 2\n3 7 0', explanation: 'Shortest paths matrix' },
      { input: '2\n0 5\n999 0', output: '0 5\n999 0', explanation: '2x2 graph' },
      { input: '3\n0 1 999\n999 0 2\n999 999 0', output: '0 1 3\n999 0 2\n999 999 0', explanation: 'Chain graph' },
      { input: '1\n0', output: '0', explanation: 'Single vertex matrix' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 6: 0/1 Knapsack Problem (Dynamic Programming)',
    slug: 'vtu-ada-lab-6-knapsack-dp',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 6,
    description: 'Solve 0/1 Knapsack Problem using Dynamic Programming method.\n\n**VTU ADA Lab Experiment 6:** DP table V[n+1][W+1] for optimal subset selection.',
    input_format: 'First line contains N and W.\nSecond line contains N values.\nThird line contains N weights.',
    output_format: 'Print maximum total value.',
    constraints: '1 <= N <= 100, 1 <= W <= 1000',
    sample_cases: [
      { input: '4 7\n10 40 30 50\n5 4 2 3', output: '90', explanation: 'Items with val 40 (wt 4) and 50 (wt 3) sum to 90' },
      { input: '3 50\n60 100 120\n10 20 30', output: '220', explanation: 'Items 2 & 3: wt 20+30=50, val 100+120=220' },
      { input: '3 10\n10 20 30\n1 2 3', output: '60', explanation: 'All items fit (wt 1+2+3=6 <= 10, val 60)' },
      { input: '1 5\n100\n10', output: '0', explanation: 'Item exceeds capacity' },
      { input: '2 10\n50 60\n5 5', output: '110', explanation: 'Both items fit in capacity 10' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 7: Topological Sorting of Graph',
    slug: 'vtu-ada-lab-7-topological-sort',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 7,
    description: 'Find a Topological Ordering of vertices in a Directed Acyclic Graph (DAG) using Source Removal / BFS algorithm.\n\n**VTU ADA Lab Experiment 7:** Topological ordering of DAG vertices.',
    input_format: 'First line contains V and E.\nNext E lines contain directed edges u v.',
    output_format: 'Print topological ordering of vertices separated by spaces.',
    constraints: '1 <= V <= 1000',
    sample_cases: [
      { input: '6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1', output: '4 5 0 2 3 1', explanation: 'Valid topological order' },
      { input: '4 3\n0 1\n1 2\n2 3', output: '0 1 2 3', explanation: 'Linear DAG ordering' },
      { input: '3 2\n2 0\n2 1', output: '2 0 1', explanation: 'Source node 2 processed first' },
      { input: '1 0', output: '0', explanation: 'Single node DAG' },
      { input: '3 3\n0 1\n0 2\n1 2', output: '0 1 2', explanation: 'Triangle DAG order' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 8: Sum of Subsets (Backtracking)',
    slug: 'vtu-ada-lab-8-sum-of-subsets',
    difficulty: 'Medium',
    category: 'ADA',
    week_number: 8,
    description: 'Find a subset of a given set S = {s1, s2, ..., sn} of n positive integers whose sum is equal to d using Backtracking.\n\n**VTU ADA Lab Experiment 8:** Print matching subset elements.',
    input_format: 'First line contains N and target d.\nSecond line contains N space-separated positive integers.',
    output_format: 'Print space-separated subset elements summing to d, or "No Solution".',
    constraints: '1 <= N <= 30, 1 <= d <= 1000',
    sample_cases: [
      { input: '5 10\n1 2 5 6 8', output: '2 8', explanation: 'Subset {2, 8} sums to 10' },
      { input: '6 30\n5 10 12 13 15 18', output: '5 10 15', explanation: '5 + 10 + 15 = 30' },
      { input: '4 100\n1 2 3 4', output: 'No Solution', explanation: 'Max sum is 10 < 100' },
      { input: '3 5\n1 2 3', output: '2 3', explanation: '2 + 3 = 5' },
      { input: '1 10\n10', output: '10', explanation: 'Single element subset' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 9: N-Queens Problem (Backtracking)',
    slug: 'vtu-ada-lab-9-n-queens',
    difficulty: 'Hard',
    category: 'ADA',
    week_number: 9,
    description: 'Place N non-attacking queens on an N x N chessboard using Backtracking.\n\n**VTU ADA Lab Experiment 9:** 1-based column positions for each row.',
    input_format: 'First line contains integer N (size of chessboard).',
    output_format: 'Print N space-separated integers representing 1-based column positions, or "No Solution".',
    constraints: '1 <= N <= 12',
    sample_cases: [
      { input: '4', output: '2 4 1 3', explanation: 'First valid solution for 4-Queens' },
      { input: '1', output: '1', explanation: 'Single queen at col 1' },
      { input: '2', output: 'No Solution', explanation: 'No solution for N=2' },
      { input: '3', output: 'No Solution', explanation: 'No solution for N=3' },
      { input: '5', output: '1 3 5 2 4', explanation: 'First valid solution for 5-Queens' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU ADA Lab 10: Traveling Salesperson Problem (TSP)',
    slug: 'vtu-ada-lab-10-tsp-dp',
    difficulty: 'Hard',
    category: 'ADA',
    week_number: 10,
    description: 'Find minimum tour cost visiting all N cities exactly once and returning to starting city using Bitmask Dynamic Programming.\n\n**VTU ADA Lab Experiment 10:** TSP min tour cost.',
    input_format: 'First line contains N.\nNext N lines contain N space-separated integers representing cost matrix.',
    output_format: 'Print minimum integer TSP tour cost.',
    constraints: '1 <= N <= 15',
    sample_cases: [
      { input: '4\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0', output: '80', explanation: 'Optimal tour cost 0->1->3->2->0 = 80' },
      { input: '4\n0 20 42 25\n20 0 30 34\n42 30 0 10\n25 34 10 0', output: '85', explanation: 'Optimal tour cost = 85' },
      { input: '2\n0 5\n5 0', output: '10', explanation: '2 cities tour cost = 10' },
      { input: '3\n0 1 2\n1 0 3\n2 3 0', output: '6', explanation: 'Tour 0->1->2->0 cost = 6' },
      { input: '1\n0', output: '0', explanation: 'Single city cost = 0' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_DBMS_LAB_PROBLEMS = [
  {
    title: 'VTU DBMS Lab 1: Employee Salary Threshold Filter',
    slug: 'vtu-dbms-lab-1-salary-filter',
    difficulty: 'Easy',
    category: 'DBMS',
    week_number: 1,
    description: '**VTU DBMS Lab Experiment 1:** Given employee record rows (ID, Name, Dept, Salary), query the names of employees earning greater than or equal to a given target salary S sorted by ID in ascending order.',
    input_format: 'First line contains N (number of employees) and target salary S.\nNext N lines each contain employee_id name department salary.',
    output_format: 'Print matching employee names line by line, or "No Employees" if none match.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3 50000\n1 Alice CS 60000\n2 Bob EC 45000\n3 Charlie CS 55000', output: 'Alice\nCharlie', explanation: 'Alice and Charlie earn >= 50000' },
      { input: '2 70000\n10 John IT 65000\n11 Mary IT 68000', output: 'No Employees', explanation: 'No employees earn >= 70000' },
      { input: '1 30000\n1 David Mech 30000', output: 'David', explanation: 'David earns exactly 30000' },
      { input: '4 40000\n1 E1 CS 40000\n2 E2 CS 39999\n3 E3 CS 40001\n4 E4 CS 50000', output: 'E1\nE3\nE4', explanation: '3 employees match salary threshold' },
      { input: '2 10000\n1 A CS 15000\n2 B CS 20000', output: 'A\nB', explanation: 'All employees match' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 2: Supplier Parts Join Query',
    slug: 'vtu-dbms-lab-2-supplier-parts',
    difficulty: 'Easy',
    category: 'DBMS',
    week_number: 2,
    description: '**VTU DBMS Lab Experiment 2:** Perform Inner Join between Supplier and Catalog records to find suppliers who supply a specific part name with cost less than C.',
    input_format: 'First line contains N (records) and max cost C.\nNext N lines contain supplier_name part_name cost.',
    output_format: 'Print distinct supplier names separated by space, or "None".',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3 100\nSupA Bolt 50\nSupB Nut 120\nSupC Bolt 80', output: 'SupA SupC', explanation: 'Suppliers supplying Bolt under cost 100' },
      { input: '2 10\nS1 Gear 25\nS2 Gear 30', output: 'None', explanation: 'No parts cost <= 10' },
      { input: '1 500\nGlobalParts Engine 450', output: 'GlobalParts', explanation: 'Matches cost requirement' },
      { input: '4 200\nS1 P1 100\nS2 P1 150\nS3 P1 250\nS1 P2 50', output: 'S1 S2', explanation: 'Suppliers with cost <= 200' },
      { input: '2 50\nS1 Screw 50\nS2 Screw 49', output: 'S1 S2', explanation: 'Both match' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 3: Bank Customer Account Balance Aggregation',
    slug: 'vtu-dbms-lab-3-bank-balance',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 3,
    description: '**VTU DBMS Lab Experiment 3:** Compute Total Account Balance grouped by Branch Name and filter branches having total balance greater than threshold T.',
    input_format: 'First line contains N and threshold T.\nNext N lines contain branch_name customer_name account_balance.',
    output_format: 'Print branch_name and total_balance sorted alphabetically by branch.',
    constraints: '1 <= N <= 5000',
    sample_cases: [
      { input: '4 10000\nMG_Road John 6000\nMG_Road Mary 5000\nIndiranagar Bob 4000\nIndiranagar Sam 3000', output: 'MG_Road 11000', explanation: 'MG_Road total 11000 > 10000' },
      { input: '2 5000\nBranchA A 2000\nBranchB B 3000', output: 'None', explanation: 'No branch exceeds 5000' },
      { input: '3 100\nB1 X 100\nB1 Y 50\nB2 Z 200', output: 'B1 150\nB2 200', explanation: 'Both branches exceed 100' },
      { input: '1 0\nMain A 1', output: 'Main 1', explanation: 'Main branch exceeds 0' },
      { input: '3 1000\nBranch1 A 500\nBranch1 B 600\nBranch2 C 1200', output: 'Branch1 1100\nBranch2 1200', explanation: 'Both branch totals match' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 4: Student Grade Subquery',
    slug: 'vtu-dbms-lab-4-student-subquery',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 4,
    description: '**VTU DBMS Lab Experiment 4:** Find students who scored above average marks in a specific subject using relational subqueries.',
    input_format: 'First line contains N.\nNext N lines contain usn student_name marks.',
    output_format: 'Print student_name of students scoring strictly above average marks sorted by USN.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '4\n101 Alice 85\n102 Bob 65\n103 Charlie 90\n104 David 40', output: 'Alice\nCharlie', explanation: 'Avg = 70. Alice (85) and Charlie (90) > 70' },
      { input: '2\n1 A 50\n2 B 50', output: 'None', explanation: 'Avg = 50. No score strictly greater than average' },
      { input: '3\n1 X 10\n2 Y 20\n3 Z 30', output: 'Z', explanation: 'Avg = 20. Z (30) > 20' },
      { input: '1\n1 Single 100', output: 'None', explanation: 'Single student score equals average' },
      { input: '5\n1 S1 10\n2 S2 20\n3 S3 30\n4 S4 40\n5 S5 50', output: 'S4\nS5', explanation: 'Avg = 30. S4 and S5 > 30' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 5: Order Warehouse Inventory Aggregation',
    slug: 'vtu-dbms-lab-5-warehouse-inventory',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 5,
    description: '**VTU DBMS Lab Experiment 5:** Calculate total item quantity ordered per warehouse and list top warehouse by total volume.',
    input_format: 'First line contains N.\nNext N lines contain warehouse_id item_id order_quantity.',
    output_format: 'Print warehouse_id with maximum total quantity.',
    constraints: '1 <= N <= 5000',
    sample_cases: [
      { input: '4\nW1 ItemA 10\nW1 ItemB 20\nW2 ItemA 15\nW3 ItemC 5', output: 'W1', explanation: 'W1 total = 30' },
      { input: '2\nW10 X 50\nW20 Y 100', output: 'W20', explanation: 'W20 total = 100' },
      { input: '1\nW5 Z 42', output: 'W5', explanation: 'Single warehouse W5' },
      { input: '3\nW1 A 10\nW2 B 20\nW3 C 30', output: 'W3', explanation: 'W3 has max quantity 30' },
      { input: '4\nW1 A 5\nW1 B 5\nW2 C 8\nW2 D 8', output: 'W2', explanation: 'W2 total 16 > W1 total 10' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 6: Library Book Loans Pattern Matching',
    slug: 'vtu-dbms-lab-6-library-loans',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 6,
    description: '**VTU DBMS Lab Experiment 6:** Filter book loan records by author pattern matching and return count of active borrowed books.',
    input_format: 'First line contains N and search prefix keyword.\nNext N lines contain book_title author_name borrow_status (Borrowed/Available).',
    output_format: 'Print count of borrowed books matching author prefix.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3 Tanenbaum\nOS Tanenbaum Borrowed\nNetworks Tanenbaum Available\nArch Tanenbaum Borrowed', output: '2', explanation: '2 books borrowed by Tanenbaum' },
      { input: '2 Korth\nDBMS Korth Available\nSQL Korth Available', output: '0', explanation: '0 borrowed books' },
      { input: '1 Cormen\nADA Cormen Borrowed', output: '1', explanation: '1 borrowed book' },
      { input: '4 Elmasri\nDB1 Elmasri Borrowed\nDB2 Elmasri Borrowed\nDB3 Elmasri Borrowed\nDB4 Elmasri Available', output: '3', explanation: '3 borrowed books' },
      { input: '2 AuthorX\nB1 AuthorY Borrowed\nB2 AuthorZ Borrowed', output: '0', explanation: 'Author prefix mismatch' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 7: Company Project Assignment Union & Intersect',
    slug: 'vtu-dbms-lab-7-project-union',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 7,
    description: '**VTU DBMS Lab Experiment 7:** Find employees assigned to both Project A and Project B (Set Intersection).',
    input_format: 'First line contains N (project A count) and M (project B count).\nSecond line contains N employee names.\nThird line contains M employee names.',
    output_format: 'Print space-separated employee names in both projects sorted alphabetically, or "None".',
    constraints: '1 <= N, M <= 1000',
    sample_cases: [
      { input: '3 3\nAlice Bob Charlie\nBob Charlie David', output: 'Bob Charlie', explanation: 'Bob and Charlie are in both projects' },
      { input: '2 2\nJohn Mary\nAlex Sam', output: 'None', explanation: 'No common employees' },
      { input: '1 1\nSingle\nSingle', output: 'Single', explanation: 'Single employee in both' },
      { input: '4 3\nE1 E2 E3 E4\nE2 E4 E5', output: 'E2 E4', explanation: 'Intersection E2 E4' },
      { input: '3 1\nA B C\nB', output: 'B', explanation: 'Employee B matches' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 8: Employee Salary Grade CASE Evaluation',
    slug: 'vtu-dbms-lab-8-salary-grade',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 8,
    description: '**VTU DBMS Lab Experiment 8:** Assign salary grade (Grade A >= 80000, Grade B >= 50000, else Grade C) using CASE WHEN queries.',
    input_format: 'First line contains N.\nNext N lines contain employee_name salary.',
    output_format: 'Print name and assigned grade separated by space.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3\nAlice 90000\nBob 60000\nCharlie 30000', output: 'Alice Grade A\nBob Grade B\nCharlie Grade C', explanation: 'Grades assigned according to thresholds' },
      { input: '1\nJohn 80000', output: 'John Grade A', explanation: '80000 equals Grade A threshold' },
      { input: '1\nMary 50000', output: 'Mary Grade B', explanation: '50000 equals Grade B threshold' },
      { input: '2\nE1 49999\nE2 79999', output: 'E1 Grade C\nE2 Grade B', explanation: 'Threshold edge cases' },
      { input: '1\nE3 100000', output: 'E3 Grade A', explanation: 'Exceeds 80000' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 9: Hospital Patient Registration Index Search',
    slug: 'vtu-dbms-lab-9-patient-search',
    difficulty: 'Medium',
    category: 'DBMS',
    week_number: 9,
    description: '**VTU DBMS Lab Experiment 9:** Search patient diagnosis records by doctor ID and age group using indexed search simulation.',
    input_format: 'First line contains N, doctor_id, and min_age.\nNext N lines contain patient_id name age doc_id diagnosis.',
    output_format: 'Print patient names matching doctor ID and age >= min_age sorted by patient_id.',
    constraints: '1 <= N <= 2000',
    sample_cases: [
      { input: '3 D101 40\n1 P1 45 D101 Fever\n2 P2 30 D101 Cold\n3 P3 50 D102 Flu', output: 'P1', explanation: 'P1 matches D101 and age 45 >= 40' },
      { input: '2 D200 60\n10 A 55 D200 X\n11 B 50 D200 Y', output: 'None', explanation: 'No patients >= 60' },
      { input: '1 D1 18\n1 Adult 18 D1 Checkup', output: 'Adult', explanation: '18 matches min_age' },
      { input: '4 D5 25\n1 P1 25 D5 A\n2 P2 30 D5 B\n3 P3 20 D5 C\n4 P4 40 D6 D', output: 'P1\nP2', explanation: 'P1 and P2 match doctor D5 and age >= 25' },
      { input: '2 D1 0\n1 P1 1 D1 A\n2 P2 2 D1 B', output: 'P1\nP2', explanation: 'All match age >= 0' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DBMS Lab 10: Flight Passenger Reservation Multi-Join Filter',
    slug: 'vtu-dbms-lab-10-flight-reservation',
    difficulty: 'Hard',
    category: 'DBMS',
    week_number: 10,
    description: '**VTU DBMS Lab Experiment 10:** Multi-table join between Passengers, Flights, and Bookings to calculate total revenue per flight destination.',
    input_format: 'First line contains N bookings.\nNext N lines contain flight_number destination ticket_price.',
    output_format: 'Print destination and total revenue sorted alphabetically by destination.',
    constraints: '1 <= N <= 5000',
    sample_cases: [
      { input: '4\nF101 Delhi 5000\nF102 Mumbai 6000\nF103 Delhi 4500\nF104 Chennai 3000', output: 'Chennai 3000\nDelhi 9500\nMumbai 6000', explanation: 'Revenue grouped by destination' },
      { input: '2\nF1 Goa 4000\nF2 Goa 4000', output: 'Goa 8000', explanation: 'Total revenue for Goa = 8000' },
      { input: '1\nF100 NYC 12000', output: 'NYC 12000', explanation: 'Single destination' },
      { input: '3\nF1 A 100\nF2 B 200\nF3 A 300', output: 'A 400\nB 200', explanation: 'Grouped revenue A=400, B=200' },
      { input: '2\nF1 X 50\nF2 Y 50', output: 'X 50\nY 50', explanation: 'Two destinations' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_JAVA_LAB_PROBLEMS = [
  {
    title: 'VTU JAVA Lab 1: Quadratic Equation Roots Solver',
    slug: 'vtu-java-lab-1-quadratic-roots',
    difficulty: 'Easy',
    category: 'JAVA',
    week_number: 1,
    description: '**VTU JAVA Lab Experiment 1:** Compute real or complex roots of a quadratic equation `ax^2 + bx + c = 0` given coefficients a, b, c.',
    input_format: 'Single line containing three space-separated floating-point numbers a, b, c.',
    output_format: 'Print "Real and Equal: r1", "Real and Distinct: r1 r2", or "Complex Roots". (Format float to 2 decimal places)',
    constraints: 'a != 0',
    sample_cases: [
      { input: '1 -5 6', output: 'Real and Distinct: 3.00 2.00', explanation: 'Discriminant > 0, roots 3.00 and 2.00' },
      { input: '1 -4 4', output: 'Real and Equal: 2.00', explanation: 'Discriminant = 0, root 2.00' },
      { input: '1 2 5', output: 'Complex Roots', explanation: 'Discriminant < 0' },
      { input: '2 4 2', output: 'Real and Equal: -1.00', explanation: 'Single root -1.00' },
      { input: '1 0 -4', output: 'Real and Distinct: 2.00 -2.00', explanation: 'Roots 2.00 and -2.00' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 2: Student SGPA & Grade Calculator',
    slug: 'vtu-java-lab-2-student-sgpa',
    difficulty: 'Easy',
    category: 'JAVA',
    week_number: 2,
    description: '**VTU JAVA Lab Experiment 2:** Calculate Semester Grade Point Average (SGPA) for a student given course credits and marks out of 100.',
    input_format: 'First line contains N (number of subjects).\nNext N lines contain credits and marks.',
    output_format: 'Print "SGPA: X.XX" formatted to 2 decimal places.',
    constraints: '1 <= N <= 10',
    sample_cases: [
      { input: '3\n4 85\n4 75\n3 90', output: 'SGPA: 8.73', explanation: 'Grade points computed per subject and averaged by total credits' },
      { input: '1\n4 100', output: 'SGPA: 10.00', explanation: 'Perfect 10.00 SGPA' },
      { input: '2\n3 50\n3 50', output: 'SGPA: 6.00', explanation: 'Grade 6.00' },
      { input: '4\n4 80\n4 80\n4 80\n4 80', output: 'SGPA: 9.00', explanation: 'Uniform 9.00 SGPA' },
      { input: '2\n4 40\n4 40', output: 'SGPA: 4.00', explanation: 'Minimum pass SGPA' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 3: Book Encapsulation & Discount Evaluation',
    slug: 'vtu-java-lab-3-book-class',
    difficulty: 'Easy',
    category: 'JAVA',
    week_number: 3,
    description: '**VTU JAVA Lab Experiment 3:** Design a Book class with name, author, price, and num_pages. Compute net price after discount.',
    input_format: 'First line contains name, author, price, num_pages, and discount percentage D.',
    output_format: 'Print "Book: [name], Author: [author], Net Price: [net_price]".',
    constraints: 'price > 0, 0 <= D <= 100',
    sample_cases: [
      { input: 'JavaProg Gosling 500 400 10', output: 'Book: JavaProg, Author: Gosling, Net Price: 450.00', explanation: '10% discount on 500 = 450.00' },
      { input: 'Algorithms Cormen 1000 800 20', output: 'Book: Algorithms, Author: Cormen, Net Price: 800.00', explanation: '20% discount on 1000 = 800.00' },
      { input: 'PythonBook Guido 300 250 0', output: 'Book: PythonBook, Author: Guido, Net Price: 300.00', explanation: '0% discount' },
      { input: 'CleanCode Martin 600 300 50', output: 'Book: CleanCode, Author: Martin, Net Price: 300.00', explanation: '50% discount' },
      { input: 'OS Book 100 100 5', output: 'Book: OS, Author: Book, Net Price: 95.00', explanation: '5% discount' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 4: Bank Account Inheritance & Interest Calculation',
    slug: 'vtu-java-lab-4-bank-inheritance',
    difficulty: 'Medium',
    category: 'JAVA',
    week_number: 4,
    description: '**VTU JAVA Lab Experiment 4:** Create Account base class and SavingsAccount subclass. Deposit funds, compute compound interest, and withdraw with minimum balance checks.',
    input_format: 'First line contains initial_balance, interest_rate, and years.\nSecond line contains deposit_amount and withdraw_amount.',
    output_format: 'Print "Final Balance: X.XX" or "Insufficient Balance".',
    constraints: 'balance >= 0',
    sample_cases: [
      { input: '10000 5 2\n2000 1000', output: 'Final Balance: 12025.00', explanation: 'Interest applied on balance after deposit' },
      { input: '1000 0 1\n0 2000', output: 'Insufficient Balance', explanation: 'Withdrawal exceeds balance' },
      { input: '5000 10 1\n0 0', output: 'Final Balance: 5500.00', explanation: '10% interest added' },
      { input: '2000 5 1\n1000 500', output: 'Final Balance: 2625.00', explanation: 'Deposit 1000, 5% interest, withdraw 500' },
      { input: '500 0 1\n0 500', output: 'Final Balance: 0.00', explanation: 'Exact withdrawal' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 5: Shape Abstract Class & Area Polymorphism',
    slug: 'vtu-java-lab-5-shape-polymorphism',
    difficulty: 'Medium',
    category: 'JAVA',
    week_number: 5,
    description: '**VTU JAVA Lab Experiment 5:** Abstract class Shape with printArea() method implemented by Rectangle, Triangle, and Circle subclasses.',
    input_format: 'First line shape_type (Rectangle/Triangle/Circle).\nSecond line dimensions (width height for Rect/Tri, radius for Circle).',
    output_format: 'Print "Area: X.XX" formatted to 2 decimal places.',
    constraints: 'dimensions > 0',
    sample_cases: [
      { input: 'Rectangle\n4 5', output: 'Area: 20.00', explanation: 'Rectangle area = 4 * 5 = 20.00' },
      { input: 'Triangle\n4 5', output: 'Area: 10.00', explanation: 'Triangle area = 0.5 * 4 * 5 = 10.00' },
      { input: 'Circle\n3', output: 'Area: 28.27', explanation: 'Circle area = pi * 3^2 = 28.27' },
      { input: 'Rectangle\n10 10', output: 'Area: 100.00', explanation: 'Square rectangle area' },
      { input: 'Triangle\n6 8', output: 'Area: 24.00', explanation: 'Triangle area = 24.00' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 6: Package & Interface Unit Converter',
    slug: 'vtu-java-lab-6-package-interface',
    difficulty: 'Medium',
    category: 'JAVA',
    week_number: 6,
    description: '**VTU JAVA Lab Experiment 6:** Create package converters with CurrencyConverter, DistanceConverter, and TimeConverter implementing Converter interface.',
    input_format: 'First line converter_type (USD_to_INR / KM_to_MILES / HOURS_to_MINS).\nSecond line numerical value.',
    output_format: 'Print converted value formatted to 2 decimal places.',
    constraints: 'value >= 0',
    sample_cases: [
      { input: 'USD_to_INR\n100', output: '8300.00', explanation: '100 USD = 8300.00 INR' },
      { input: 'KM_to_MILES\n10', output: '6.21', explanation: '10 KM = 6.21 Miles' },
      { input: 'HOURS_to_MINS\n2.5', output: '150.00', explanation: '2.5 Hours = 150.00 Mins' },
      { input: 'USD_to_INR\n1', output: '83.00', explanation: '1 USD = 83.00 INR' },
      { input: 'HOURS_to_MINS\n1', output: '60.00', explanation: '1 Hour = 60.00 Mins' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 7: Custom Age Exception Handling',
    slug: 'vtu-java-lab-7-custom-exception',
    difficulty: 'Medium',
    category: 'JAVA',
    week_number: 7,
    description: '**VTU JAVA Lab Experiment 7:** Define custom exception WrongAgeException. Throw exception if Father\'s age <= Son\'s age or if age < 0.',
    input_format: 'First line father_age, second line son_age.',
    output_format: 'Print "Valid Ages" or "WrongAgeException: [error message]".',
    constraints: 'ages can be any integer',
    sample_cases: [
      { input: '50 20', output: 'Valid Ages', explanation: '50 > 20 and both positive' },
      { input: '30 35', output: 'WrongAgeException: Father age must be greater than Son age', explanation: 'Father younger than Son' },
      { input: '-5 20', output: 'WrongAgeException: Age cannot be negative', explanation: 'Negative age' },
      { input: '40 40', output: 'WrongAgeException: Father age must be greater than Son age', explanation: 'Equal ages invalid' },
      { input: '60 0', output: 'Valid Ages', explanation: 'Newborn son' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 8: Multithreaded Greeting & Prime Generator',
    slug: 'vtu-java-lab-8-multithreading',
    difficulty: 'Medium',
    category: 'JAVA',
    week_number: 8,
    description: '**VTU JAVA Lab Experiment 8:** Create two threads: Thread 1 prints "BMSCE" every 1000ms and Thread 2 prints prime numbers up to N.',
    input_format: 'Single integer N.',
    output_format: 'Print space-separated prime numbers up to N.',
    constraints: '2 <= N <= 1000',
    sample_cases: [
      { input: '10', output: '2 3 5 7', explanation: 'Primes up to 10' },
      { input: '20', output: '2 3 5 7 11 13 17 19', explanation: 'Primes up to 20' },
      { input: '2', output: '2', explanation: 'First prime number' },
      { input: '5', output: '2 3 5', explanation: 'Primes up to 5' },
      { input: '30', output: '2 3 5 7 11 13 17 19 23 29', explanation: 'Primes up to 30' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 9: Generic Stack Implementation',
    slug: 'vtu-java-lab-9-generic-stack',
    difficulty: 'Hard',
    category: 'JAVA',
    week_number: 9,
    description: '**VTU JAVA Lab Experiment 9:** Implement generic class Stack<T> supporting push, pop, and peek operations.',
    input_format: 'First line number of operations Q.\nNext Q lines contain operation (PUSH val / POP / PEEK).',
    output_format: 'Print output of POP and PEEK operations line by line (or "Stack Empty").',
    constraints: '1 <= Q <= 100',
    sample_cases: [
      { input: '4\nPUSH 10\nPUSH 20\nPEEK\nPOP', output: '20\n20', explanation: 'Peek returns top 20, Pop removes top 20' },
      { input: '2\nPOP\nPEEK', output: 'Stack Empty\nStack Empty', explanation: 'Pop on empty stack' },
      { input: '3\nPUSH Hello\nPEEK\nPOP', output: 'Hello\nHello', explanation: 'Generic string stack' },
      { input: '5\nPUSH 5\nPUSH 15\nPOP\nPOP\nPOP', output: '15\n5\nStack Empty', explanation: 'Multiple pop operations' },
      { input: '1\nPUSH 100', output: '', explanation: 'Push produces no stdout output' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU JAVA Lab 10: File Character, Word & Line Counter',
    slug: 'vtu-java-lab-10-file-counter',
    difficulty: 'Hard',
    category: 'JAVA',
    week_number: 10,
    description: '**VTU JAVA Lab Experiment 10:** Read text content from stdin/file and display total line count, word count, and character count.',
    input_format: 'Multiline text input.',
    output_format: 'Print "Lines: L, Words: W, Chars: C".',
    constraints: 'text length <= 10000',
    sample_cases: [
      { input: 'Hello World\nJava Programming Lab', output: 'Lines: 2, Words: 5, Chars: 32', explanation: '2 lines, 5 words, 32 total chars including newlines' },
      { input: 'VTU ADA', output: 'Lines: 1, Words: 2, Chars: 7', explanation: 'Single line text' },
      { input: 'A B C\nD E F', output: 'Lines: 2, Words: 6, Chars: 11', explanation: 'Multispace lines' },
      { input: 'Test', output: 'Lines: 1, Words: 1, Chars: 4', explanation: 'Single word' },
      { input: 'Line1\nLine2\nLine3', output: 'Lines: 3, Words: 3, Chars: 17', explanation: '3 lines counter' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_PYTHON_LAB_PROBLEMS = [
  {
    title: 'VTU PYTHON Lab 1: Student Marksheet Evaluation',
    slug: 'vtu-python-lab-1-marksheet',
    difficulty: 'Easy',
    category: 'PYTHON',
    week_number: 1,
    description: '**VTU PYTHON Lab Experiment 1:** Calculate total marks, percentage, and grade (Distinction >= 75%, First Class >= 60%, Second Class >= 50%, Pass >= 40%, else Fail) for 3 test scores.',
    input_format: 'Single line with 3 space-separated integer test scores.',
    output_format: 'Print "Total: T, Percentage: P.PP%, Grade: G".',
    constraints: '0 <= score <= 100',
    sample_cases: [
      { input: '80 85 90', output: 'Total: 255, Percentage: 85.00%, Grade: Distinction', explanation: 'Avg 85% = Distinction' },
      { input: '60 65 70', output: 'Total: 195, Percentage: 65.00%, Grade: First Class', explanation: 'Avg 65% = First Class' },
      { input: '35 40 45', output: 'Total: 120, Percentage: 40.00%, Grade: Pass', explanation: 'Avg 40% = Pass' },
      { input: '30 30 30', output: 'Total: 90, Percentage: 30.00%, Grade: Fail', explanation: 'Under 40% = Fail' },
      { input: '50 55 50', output: 'Total: 155, Percentage: 51.67%, Grade: Second Class', explanation: 'Second Class' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 2: Fibonacci Sequence & Palindrome Generator',
    slug: 'vtu-python-lab-2-fibonacci-palindrome',
    difficulty: 'Easy',
    category: 'PYTHON',
    week_number: 2,
    description: '**VTU PYTHON Lab Experiment 2:** Generate N terms of Fibonacci sequence and check if N is a palindrome number.',
    input_format: 'Single integer N.',
    output_format: 'First line: N Fibonacci terms space-separated.\nSecond line: "Palindrome" or "Not Palindrome".',
    constraints: '1 <= N <= 30',
    sample_cases: [
      { input: '5', output: '0 1 1 2 3\nNot Palindrome', explanation: 'First 5 Fibonacci numbers' },
      { input: '1', output: '0\nPalindrome', explanation: '1 term = 0 is Palindrome' },
      { input: '121', output: '0 1 1 2 3 ...\nPalindrome', explanation: '121 is Palindrome' },
      { input: '3', output: '0 1 1\nNot Palindrome', explanation: '3 terms' },
      { input: '7', output: '0 1 1 2 3 5 8\nNot Palindrome', explanation: '7 terms' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 3: Sentence Word Frequency Analyzer',
    slug: 'vtu-python-lab-3-word-frequency',
    difficulty: 'Easy',
    category: 'PYTHON',
    week_number: 3,
    description: '**VTU PYTHON Lab Experiment 3:** Count frequency of each word in a given text sentence using Python dictionary.',
    input_format: 'Single line text string.',
    output_format: 'Print word: count pairs sorted alphabetically by word.',
    constraints: 'length <= 1000',
    sample_cases: [
      { input: 'apple banana apple orange banana apple', output: 'apple: 3\nbanana: 2\norange: 1', explanation: 'Word occurrences counted' },
      { input: 'hello world hello', output: 'hello: 2\nworld: 1', explanation: 'Frequencies sorted' },
      { input: 'python python python', output: 'python: 3', explanation: 'Single repeated word' },
      { input: 'a b c a b a', output: 'a: 3\nb: 2\nc: 1', explanation: 'Alphabetical frequency print' },
      { input: 'vtu lab python', output: 'lab: 1\npython: 1\nvtu: 1', explanation: 'Single occurrence words' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 4: Matrix Addition & Transpose',
    slug: 'vtu-python-lab-4-matrix-ops',
    difficulty: 'Medium',
    category: 'PYTHON',
    week_number: 4,
    description: '**VTU PYTHON Lab Experiment 4:** Perform matrix addition of two R x C matrices and compute the transpose of the resulting sum matrix.',
    input_format: 'First line R and C.\nNext R lines Matrix A.\nNext R lines Matrix B.',
    output_format: 'Print C x R transpose matrix.',
    constraints: '1 <= R, C <= 50',
    sample_cases: [
      { input: '2 2\n1 2\n3 4\n5 6\n7 8', output: '6 10\n8 12', explanation: 'Sum matrix [[6,8],[10,12]], transpose [[6,10],[8,12]]' },
      { input: '1 2\n1 2\n3 4', output: '4\n6', explanation: '1x2 sum [[4,6]], transpose 2x1' },
      { input: '2 1\n1\n2\n3\n4', output: '4 6', explanation: '2x1 transpose' },
      { input: '1 1\n10\n20', output: '30', explanation: '1x1 matrix sum and transpose' },
      { input: '2 2\n0 0\n0 0\n0 0\n0 0', output: '0 0\n0 0', explanation: 'Zero matrix transpose' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 5: File Line Reversal & Substring Search',
    slug: 'vtu-python-lab-5-file-search',
    difficulty: 'Medium',
    category: 'PYTHON',
    week_number: 5,
    description: '**VTU PYTHON Lab Experiment 5:** Read lines of text, reverse the line order, and search for a target query substring.',
    input_format: 'First line query substring.\nNext lines input text.',
    output_format: 'Print matching reversed lines containing query string, or "No Match".',
    constraints: 'lines <= 100',
    sample_cases: [
      { input: 'vtu\npython lab\nvtu ada lab\nlearning vtu', output: 'learning vtu\nvtu ada lab', explanation: 'Reversed matching lines' },
      { input: 'xyz\nline 1\nline 2', output: 'No Match', explanation: 'Substring not found' },
      { input: 'test\nthis is a test line', output: 'this is a test line', explanation: 'Single line match' },
      { input: 'a\na1\nb2\na3', output: 'a3\na1', explanation: 'Reversed line search' },
      { input: 'code\ncode 1\ncode 2\ncode 3', output: 'code 3\ncode 2\ncode 1', explanation: 'All lines match reversed' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 6: Student Class with Marks Evaluation',
    slug: 'vtu-python-lab-6-student-class',
    difficulty: 'Medium',
    category: 'PYTHON',
    week_number: 6,
    description: '**VTU PYTHON Lab Experiment 6:** Define Student class with attributes usn, name, and marks. Instantiate N students and return top ranker.',
    input_format: 'First line N.\nNext N lines contain usn name marks.',
    output_format: 'Print "Top Ranker: [name] (USN: [usn], Marks: [marks])".',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3\n101 Alice 95\n102 Bob 88\n103 Charlie 92', output: 'Top Ranker: Alice (USN: 101, Marks: 95)', explanation: 'Alice has highest score 95' },
      { input: '1\n1 John 100', output: 'Top Ranker: John (USN: 1, Marks: 100)', explanation: 'Single student' },
      { input: '2\n10 A 50\n20 B 75', output: 'Top Ranker: B (USN: 20, Marks: 75)', explanation: 'B has higher marks' },
      { input: '3\n1 X 40\n2 Y 60\n3 Z 60', output: 'Top Ranker: Y (USN: 2, Marks: 60)', explanation: 'First student with max score' },
      { input: '2\n100 P1 80\n101 P2 85', output: 'Top Ranker: P2 (USN: 101, Marks: 85)', explanation: 'P2 top score' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 7: Custom List Deduplication & Sorting',
    slug: 'vtu-python-lab-7-dedup-sort',
    difficulty: 'Medium',
    category: 'PYTHON',
    week_number: 7,
    description: '**VTU PYTHON Lab Experiment 7:** Deduplicate an integer list and sort elements in ascending order without using built-in set() or sort().',
    input_format: 'First line N.\nSecond line N space-separated integers.',
    output_format: 'Print space-separated deduplicated sorted integers.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '6\n4 2 4 1 2 3', output: '1 2 3 4', explanation: 'Unique elements sorted' },
      { input: '3\n5 5 5', output: '5', explanation: 'Single unique element' },
      { input: '4\n10 20 30 40', output: '10 20 30 40', explanation: 'Already unique and sorted' },
      { input: '5\n-1 0 -1 2 1', output: '-1 0 1 2', explanation: 'Deduplicated negative integers' },
      { input: '2\n2 1', output: '1 2', explanation: 'Sorted 2 elements' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 8: Regex Email & Phone Extractor',
    slug: 'vtu-python-lab-8-regex-extractor',
    difficulty: 'Medium',
    category: 'PYTHON',
    week_number: 8,
    description: '**VTU PYTHON Lab Experiment 8:** Use Python re module to extract valid Indian phone numbers (10 digits starting with 6-9) and email addresses.',
    input_format: 'Input text containing phone numbers and emails.',
    output_format: 'Print extracted phones line by line followed by extracted emails.',
    constraints: 'length <= 5000',
    sample_cases: [
      { input: 'Call 9876543210 or email test@vtu.ac.in for details.', output: 'Phone: 9876543210\nEmail: test@vtu.ac.in', explanation: 'Valid phone and email extracted' },
      { input: 'No contacts here 12345', output: 'No Contacts Found', explanation: 'Invalid phone format' },
      { input: 'Reach admin@bmsce.ac.in or 8123456789', output: 'Phone: 8123456789\nEmail: admin@bmsce.ac.in', explanation: 'Extracted successfully' },
      { input: 'Contact: 7000000000', output: 'Phone: 7000000000', explanation: 'Phone only match' },
      { input: 'Email user@domain.com', output: 'Email: user@domain.com', explanation: 'Email only match' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 9: Merge Two Sorted Files',
    slug: 'vtu-python-lab-9-file-merge',
    difficulty: 'Hard',
    category: 'PYTHON',
    week_number: 9,
    description: '**VTU PYTHON Lab Experiment 9:** Merge contents of two sorted integer sequences into a third combined sorted sequence.',
    input_format: 'First line N space-separated integers.\nSecond line M space-separated integers.',
    output_format: 'Print combined N+M space-separated sorted integers.',
    constraints: '1 <= N, M <= 5000',
    sample_cases: [
      { input: '1 3 5 7\n2 4 6 8', output: '1 2 3 4 5 6 7 8', explanation: 'Merged two 4-element sequences' },
      { input: '10 20\n5 15 25', output: '5 10 15 20 25', explanation: 'Merged lists' },
      { input: '1\n2', output: '1 2', explanation: 'Single element sequences' },
      { input: '0\n1 2 3', output: '1 2 3', explanation: 'First sequence empty' },
      { input: '5 10 15\n5 10 15', output: '5 5 10 10 15 15', explanation: 'Duplicate values merged' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU PYTHON Lab 10: Binary Search & Selection Sort',
    slug: 'vtu-python-lab-10-search-sort',
    difficulty: 'Hard',
    category: 'PYTHON',
    week_number: 10,
    description: '**VTU PYTHON Lab Experiment 10:** Sort an integer array using Selection Sort and perform Binary Search for a target value.',
    input_format: 'First line N and target.\nSecond line N unsorted integers.',
    output_format: 'First line: Sorted array space-separated.\nSecond line: "Found at index [idx]" or "Not Found".',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '5 30\n50 10 30 20 40', output: '10 20 30 40 50\nFound at index 2', explanation: 'Sorted array [10,20,30,40,50], 30 found at index 2' },
      { input: '3 99\n5 1 2', output: '1 2 5\nNot Found', explanation: 'Target 99 missing' },
      { input: '1 10\n10', output: '10\nFound at index 0', explanation: 'Single element match' },
      { input: '4 1\n4 3 2 1', output: '1 2 3 4\nFound at index 0', explanation: '1 found at index 0' },
      { input: '2 5\n10 20', output: '10 20\nNot Found', explanation: 'Not found' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_MONGODB_LAB_PROBLEMS = [
  {
    title: 'VTU MONGODB Lab 1: Insert & Find Student Documents',
    slug: 'vtu-mongodb-lab-1-insert-find',
    difficulty: 'Easy',
    category: 'MONGODB',
    week_number: 1,
    description: '**VTU MONGODB Lab Experiment 1:** Insert student JSON documents into MongoDB collection and query all students in CS department.',
    input_format: 'First line N.\nNext N lines contain student JSON strings.',
    output_format: 'Print JSON matching CS department students sorted by USN.',
    constraints: '1 <= N <= 500',
    sample_cases: [
      { input: '2\n{"usn":"101","name":"Alice","dept":"CS"}\n{"usn":"102","name":"Bob","dept":"EC"}', output: '101 Alice CS', explanation: 'Only Alice belongs to CS' },
      { input: '1\n{"usn":"1","name":"John","dept":"IT"}', output: 'No Documents Found', explanation: 'No CS students' },
      { input: '2\n{"usn":"10","name":"A","dept":"CS"}\n{"usn":"20","name":"B","dept":"CS"}', output: '10 A CS\n20 B CS', explanation: 'Both match CS' },
      { input: '1\n{"usn":"5","name":"Single","dept":"CS"}', output: '5 Single CS', explanation: 'Single CS student' },
      { input: '3\n{"usn":"1","name":"X","dept":"ME"}\n{"usn":"2","name":"Y","dept":"CS"}\n{"usn":"3","name":"Z","dept":"EC"}', output: '2 Y CS', explanation: 'Y matches CS' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 2: Filter Documents by Marks Threshold',
    slug: 'vtu-mongodb-lab-2-filter-marks',
    difficulty: 'Easy',
    category: 'MONGODB',
    week_number: 2,
    description: '**VTU MONGODB Lab Experiment 2:** Filter MongoDB documents using `$gt` operator for marks > 75.',
    input_format: 'First line N.\nNext N lines student_id name marks.',
    output_format: 'Print student names scoring > 75 sorted by student_id.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3\n1 Alice 80\n2 Bob 70\n3 Charlie 90', output: 'Alice\nCharlie', explanation: 'Alice (80) and Charlie (90) > 75' },
      { input: '2\n10 A 75\n20 B 60', output: 'None', explanation: '75 is not strictly greater than 75' },
      { input: '1\n1 Top 100', output: 'Top', explanation: 'Scores 100 > 75' },
      { input: '4\n1 S1 76\n2 S2 77\n3 S3 74\n4 S4 80', output: 'S1\nS2\nS4', explanation: 'S1, S2, S4 score > 75' },
      { input: '2\n1 Low 0\n2 High 76', output: 'High', explanation: 'High scores > 75' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 3: Update Designation & Salary Scale',
    slug: 'vtu-mongodb-lab-3-update-salary',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 3,
    description: '**VTU MONGODB Lab Experiment 3:** Use `$set` and `$inc` operators to update employee designation and increase salary by bonus percentage B.',
    input_format: 'First line emp_id, new_designation, and bonus_pct B.\nNext line current_designation and salary.',
    output_format: 'Print "Updated Document: [emp_id] [new_designation] [updated_salary]".',
    constraints: 'salary > 0, B >= 0',
    sample_cases: [
      { input: 'E101 SeniorDev 10\nDev 50000', output: 'Updated Document: E101 SeniorDev 55000.00', explanation: '10% bonus added to 50000 = 55000.00' },
      { input: 'E1 Lead 0\nDev 100000', output: 'Updated Document: E1 Lead 100000.00', explanation: '0% bonus' },
      { input: 'E2 Manager 20\nAssoc 60000', output: 'Updated Document: E2 Manager 72000.00', explanation: '20% bonus added' },
      { input: 'E3 Exec 5\nStaff 40000', output: 'Updated Document: E3 Exec 42000.00', explanation: '5% bonus added' },
      { input: 'E4 VP 50\nDir 200000', output: 'Updated Document: E4 VP 300000.00', explanation: '50% bonus added' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 4: Aggregation Pipeline Average Grade',
    slug: 'vtu-mongodb-lab-4-aggregation-avg',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 4,
    description: '**VTU MONGODB Lab Experiment 4:** MongoDB aggregation `$group` pipeline to compute average marks per semester.',
    input_format: 'First line N.\nNext N lines semester marks.',
    output_format: 'Print semester and average marks formatted to 2 decimal places sorted by semester.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '4\n5 80\n5 90\n6 70\n6 75', output: 'Sem 5: 85.00\nSem 6: 72.50', explanation: 'Avg for sem 5 is 85.00, sem 6 is 72.50' },
      { input: '1\n1 100', output: 'Sem 1: 100.00', explanation: 'Single semester' },
      { input: '3\n3 60\n3 60\n3 60', output: 'Sem 3: 60.00', explanation: 'Uniform marks' },
      { input: '2\n7 50\n8 100', output: 'Sem 7: 50.00\nSem 8: 100.00', explanation: 'Two semesters' },
      { input: '4\n4 10\n4 20\n4 30\n4 40', output: 'Sem 4: 25.00', explanation: 'Avg = 25.00' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 5: Array Field Unwind Search Query',
    slug: 'vtu-mongodb-lab-5-unwind-array',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 5,
    description: '**VTU MONGODB Lab Experiment 5:** Use `$unwind` operator on skills array field to find all candidates having a target skill S.',
    input_format: 'First line target skill S.\nNext lines candidate_name comma_separated_skills.',
    output_format: 'Print candidate names separated by space, or "None".',
    constraints: 'skills count <= 10 per candidate',
    sample_cases: [
      { input: 'Python\nAlice Python,Java,C++\nBob Java,SQL\nCharlie Python,Node.js', output: 'Alice Charlie', explanation: 'Alice and Charlie possess Python skill' },
      { input: 'Rust\nJohn C,C++\nMary Java', output: 'None', explanation: 'No candidates have Rust skill' },
      { input: 'SQL\nDev1 SQL\nDev2 SQL,Python', output: 'Dev1 Dev2', explanation: 'Both possess SQL' },
      { input: 'Java\nUser1 Java', output: 'User1', explanation: 'Single candidate' },
      { input: 'Go\nA Go,Python\nB C++,Go', output: 'A B', explanation: 'Both possess Go' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 6: Text Indexing Keyword Search',
    slug: 'vtu-mongodb-lab-6-text-index',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 6,
    description: '**VTU MONGODB Lab Experiment 6:** Perform text search query using `$text` and `$search` operators on article content collection.',
    input_format: 'First line keyword K.\nNext lines article_id article_text.',
    output_format: 'Print matching article IDs sorted by ID.',
    constraints: 'articles <= 500',
    sample_cases: [
      { input: 'database\n101 Introduction to database systems\n102 Learn Python programming\n103 Relational database management', output: '101\n103', explanation: 'Articles 101 and 103 match keyword "database"' },
      { input: 'cloud\n1 Java basics\n2 Web development', output: 'None', explanation: 'No matching articles' },
      { input: 'AI\n1 AI and ML lab\n2 Deep learning', output: '1', explanation: 'Article 1 matches "AI"' },
      { input: 'NoSQL\n1 MongoDB NoSQL database\n2 NoSQL document model', output: '1\n2', explanation: 'Both match NoSQL' },
      { input: 'vtu\n1 VTU syllabus lab', output: '1', explanation: 'Article 1 matches vtu' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 7: Customer Order Revenue Aggregation',
    slug: 'vtu-mongodb-lab-7-order-revenue',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 7,
    description: '**VTU MONGODB Lab Experiment 7:** Group order documents by customer_id and sum total purchase spending.',
    input_format: 'First line N.\nNext N lines customer_id item_price.',
    output_format: 'Print customer_id and total spending sorted by customer_id.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '4\nC101 500\nC101 300\nC102 400\nC102 100', output: 'C101: 800.00\nC102: 500.00', explanation: 'C101 total = 800.00, C102 total = 500.00' },
      { input: '1\nC1 1000', output: 'C1: 1000.00', explanation: 'Single order' },
      { input: '2\nC1 10\nC2 20', output: 'C1: 10.00\nC2: 20.00', explanation: 'Two customers' },
      { input: '3\nC5 50\nC5 50\nC5 50', output: 'C5: 150.00', explanation: 'C5 total = 150.00' },
      { input: '2\nC100 2.5\nC200 7.5', output: 'C100: 2.50\nC200: 7.50', explanation: 'Float spending totals' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 8: Embedded Subdocument Address Search',
    slug: 'vtu-mongodb-lab-8-embedded-subdoc',
    difficulty: 'Medium',
    category: 'MONGODB',
    week_number: 8,
    description: '**VTU MONGODB Lab Experiment 8:** Query nested address subdocument fields (city, pincode) to find residents in a given target city.',
    input_format: 'First line target city.\nNext lines person_name city pincode.',
    output_format: 'Print matching person names line by line sorted alphabetically.',
    constraints: 'persons <= 500',
    sample_cases: [
      { input: 'Bangalore\nAlice Bangalore 560001\nBob Mysore 570001\nCharlie Bangalore 560002', output: 'Alice\nCharlie', explanation: 'Alice and Charlie reside in Bangalore' },
      { input: 'Delhi\nJohn Mumbai 400001', output: 'None', explanation: 'No residents in Delhi' },
      { input: 'Mysore\nUser1 Mysore 570001', output: 'User1', explanation: 'User1 matches Mysore' },
      { input: 'Hubli\nA Hubli 580001\nB Hubli 580002', output: 'A\nB', explanation: 'Both match Hubli' },
      { input: 'Chennai\nSam Chennai 600001', output: 'Sam', explanation: 'Single resident match' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 9: Range Query & Limit Pagination',
    slug: 'vtu-mongodb-lab-9-range-limit',
    difficulty: 'Hard',
    category: 'MONGODB',
    week_number: 9,
    description: '**VTU MONGODB Lab Experiment 9:** Perform range query for prices between min_P and max_P, sort descending, and return top K results using `$limit`.',
    input_format: 'First line min_P, max_P, and K.\nNext lines product_name price.',
    output_format: 'Print top K product names and prices sorted by price descending.',
    constraints: 'K >= 1',
    sample_cases: [
      { input: '100 1000 2\nPhone 500\nLaptop 2000\nWatch 300\nPen 10', output: 'Phone 500.00\nWatch 300.00', explanation: 'Top 2 products between 100 and 1000' },
      { input: '10 50 1\nItemA 100\nItemB 5', output: 'None', explanation: 'No products in range [10, 50]' },
      { input: '0 100 1\nA 50', output: 'A 50.00', explanation: 'Single product match' },
      { input: '100 500 3\nP1 100\nP2 200\nP3 300\nP4 400', output: 'P4 400.00\nP3 300.00\nP2 200.00', explanation: 'Top 3 descending' },
      { input: '10 20 1\nX 15\nY 18', output: 'Y 18.00', explanation: 'Highest price in range' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU MONGODB Lab 10: Soft Delete Status Auditing',
    slug: 'vtu-mongodb-lab-10-soft-delete',
    difficulty: 'Hard',
    category: 'MONGODB',
    week_number: 10,
    description: '**VTU MONGODB Lab Experiment 10:** Update document is_deleted flag to true and query active non-deleted documents.',
    input_format: 'First line N and deleted_id.\nNext N lines doc_id title status (Active/Inactive).',
    output_format: 'Print active non-deleted document titles sorted by doc_id.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '3 2\n1 DocA Active\n2 DocB Active\n3 DocC Active', output: 'DocA\nDocC', explanation: 'DocB soft-deleted (id 2)' },
      { input: '1 1\n1 Single Active', output: 'None', explanation: 'Single active document deleted' },
      { input: '2 99\n10 A Active\n20 B Active', output: 'A\nB', explanation: 'No matching deleted_id' },
      { input: '3 1\n1 X Active\n2 Y Active\n3 Z Active', output: 'Y\nZ', explanation: 'Doc 1 deleted' },
      { input: '4 3\n1 A Active\n2 B Active\n3 C Active\n4 D Active', output: 'A\nB\nD', explanation: 'Doc 3 deleted' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_AI_LAB_PROBLEMS = [
  {
    title: 'VTU AI Lab 1: A* Heuristic Graph Search',
    slug: 'vtu-ai-lab-1-a-star',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 1,
    description: '**VTU AI Lab Experiment 1:** Implement A* Search algorithm to find shortest path cost from start node 0 to goal node G using evaluation function `f(n) = g(n) + h(n)`.',
    input_format: 'First line V, E, Start S, Goal G.\nNext line V heuristic values h(n).\nNext E lines u v w.',
    output_format: 'Print minimum A* path cost to Goal G, or -1 if unreachable.',
    constraints: '1 <= V <= 1000',
    sample_cases: [
      { input: '4 4 0 3\n7 6 2 0\n0 1 1\n0 2 4\n1 3 12\n2 3 3', output: '7', explanation: 'Path 0->2->3 cost = 4 + 3 = 7' },
      { input: '2 1 0 1\n5 0\n0 1 10', output: '10', explanation: 'Direct path 0->1 cost = 10' },
      { input: '3 1 0 2\n10 5 0\n0 1 2', output: '-1', explanation: 'Goal 2 unreachable' },
      { input: '3 3 0 2\n3 2 0\n0 1 1\n1 2 1\n0 2 5', output: '2', explanation: 'Shortest path 0->1->2 cost = 2' },
      { input: '1 0 0 0\n0', output: '0', explanation: 'Start equals goal' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 2: Candidate Elimination Machine Learning Algorithm',
    slug: 'vtu-ai-lab-2-candidate-elimination',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 2,
    description: '**VTU AI Lab Experiment 2:** Implement Candidate Elimination Algorithm to output Specific Hypothesis (S) and General Hypothesis (G) from training instances.',
    input_format: 'First line N (attributes count) and M (examples count).\nNext M lines contain N attribute values and target label (Yes/No).',
    output_format: 'First line: Specific Hypothesis S.\nSecond line: General Hypothesis G.',
    constraints: '1 <= N <= 10, 1 <= M <= 100',
    sample_cases: [
      { input: '4 3\nSunny Warm Normal Strong Yes\nSunny Warm High Strong Yes\nRainy Cold High Strong No', output: 'S: [\'Sunny\', \'Warm\', \'?\', \'Strong\']\nG: [[\'Sunny\', \'?\', \'?\', \'?\'], [\'?\', \'Warm\', \'?\', \'?\']]', explanation: 'Specific and General hypotheses updated' },
      { input: '2 1\nSmall Red Yes', output: 'S: [\'Small\', \'Red\']\nG: [[\'?\', \'?\']]', explanation: 'Single positive example' },
      { input: '2 2\nSmall Red Yes\nBig Red No', output: 'S: [\'Small\', \'Red\']\nG: [[\'Small\', \'?\']]', explanation: 'Updated S and G' },
      { input: '1 1\nA Yes', output: 'S: [\'A\']\nG: [[\'?\']]', explanation: 'Single attribute' },
      { input: '2 2\nA B Yes\nA C Yes', output: 'S: [\'A\', \'?\']\nG: [[\'A\', \'?\']]', explanation: 'Generalization over attribute 2' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 3: Decision Tree Induction ID3 Algorithm',
    slug: 'vtu-ai-lab-3-id3-decision-tree',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 3,
    description: '**VTU AI Lab Experiment 3:** Compute Entropy and Information Gain to select root attribute for ID3 Decision Tree algorithm.',
    input_format: 'First line target class counts (Pos Neg).\nSecond line attribute branch counts for each value.',
    output_format: 'Print attribute Information Gain formatted to 4 decimal places.',
    constraints: 'counts >= 0',
    sample_cases: [
      { input: '9 5\n6 2 3 3', output: 'Information Gain: 0.2467', explanation: 'Gain computed from entropy difference' },
      { input: '5 5\n5 0 0 5', output: 'Information Gain: 1.0000', explanation: 'Perfect split gain = 1.0000' },
      { input: '10 0\n5 0 5 0', output: 'Information Gain: 0.0000', explanation: 'Zero gain for pure set' },
      { input: '4 4\n2 2 2 2', output: 'Information Gain: 0.0000', explanation: 'No information gained' },
      { input: '8 2\n8 0 0 2', output: 'Information Gain: 0.5211', explanation: 'Attribute split gain' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 4: Backpropagation Artificial Neural Network',
    slug: 'vtu-ai-lab-4-backprop-ann',
    difficulty: 'Hard',
    category: 'AI',
    week_number: 4,
    description: '**VTU AI Lab Experiment 4:** Implement Artificial Neural Network with Backpropagation learning algorithm for XOR / binary classification.',
    input_format: 'First line learning_rate eta and epochs.\nNext 4 lines binary inputs x1 x2 and target y.',
    output_format: 'Print final output layer weights formatted to 4 decimal places.',
    constraints: 'eta > 0, epochs >= 100',
    sample_cases: [
      { input: '0.1 1000\n0 0 0\n0 1 1\n1 0 1\n1 1 0', output: 'ANN Training Complete. Final MSE < 0.05', explanation: 'Backpropagation converges on XOR logic' },
      { input: '0.5 500\n0 0 0\n0 1 0\n1 0 0\n1 1 1', output: 'ANN Training Complete. Final MSE < 0.01', explanation: 'AND logic convergence' },
      { input: '0.1 100\n0 0 0\n1 1 1', output: 'ANN Training Complete. Final MSE < 0.10', explanation: 'Simple binary convergence' },
      { input: '0.2 200\n0 0 0\n0 1 1\n1 0 1\n1 1 1', output: 'ANN Training Complete. Final MSE < 0.02', explanation: 'OR logic convergence' },
      { input: '0.1 500\n0 1 1\n1 0 0', output: 'ANN Training Complete. Final MSE < 0.01', explanation: 'Binary classifier' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 5: Naïve Bayesian Text Classifier',
    slug: 'vtu-ai-lab-5-naive-bayes',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 5,
    description: '**VTU AI Lab Experiment 5:** Compute Prior and Posterior probabilities for Naïve Bayes text classifier to predict document class (Sports / Tech).',
    input_format: 'First line query word string.\nNext lines document_text class_label.',
    output_format: 'Print "Predicted Class: [Class] (Probability: X.XXXX)".',
    constraints: 'documents <= 100',
    sample_cases: [
      { input: 'football match\nfootball goal match Sports\npython code compiler Tech', output: 'Predicted Class: Sports (Probability: 0.8571)', explanation: 'Higher posterior probability for Sports' },
      { input: 'java code\njava programming compiler Tech\ncricket match run Sports', output: 'Predicted Class: Tech (Probability: 0.9000)', explanation: 'Predicted Tech' },
      { input: 'algorithm\ncode algorithm Tech\nmatch goal Sports', output: 'Predicted Class: Tech (Probability: 0.7500)', explanation: 'Predicted Tech' },
      { input: 'tennis\ntennis racket match Sports', output: 'Predicted Class: Sports (Probability: 0.9500)', explanation: 'Predicted Sports' },
      { input: 'compiler\ncompiler code Tech', output: 'Predicted Class: Tech (Probability: 0.9900)', explanation: 'High probability Tech' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 6: K-Means Clustering Algorithm',
    slug: 'vtu-ai-lab-6-kmeans-clustering',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 6,
    description: '**VTU AI Lab Experiment 6:** Cluster 1D / 2D numerical data points into K clusters using Euclidean distance and centroid updates.',
    input_format: 'First line N data points and K clusters.\nSecond line N space-separated numbers.',
    output_format: 'Print final K cluster centroids formatted to 2 decimal places sorted ascending.',
    constraints: '1 <= K <= N <= 1000',
    sample_cases: [
      { input: '6 2\n2 4 10 12 3 11', output: 'Centroids: 3.00 11.00', explanation: 'Cluster 1: [2,3,4] (avg 3.00), Cluster 2: [10,11,12] (avg 11.00)' },
      { input: '3 1\n10 20 30', output: 'Centroids: 20.00', explanation: 'Single cluster average = 20.00' },
      { input: '4 2\n1 2 100 101', output: 'Centroids: 1.50 100.50', explanation: 'Centroids at 1.50 and 100.50' },
      { input: '2 2\n5 15', output: 'Centroids: 5.00 15.00', explanation: '2 points 2 centroids' },
      { input: '5 1\n1 1 1 1 1', output: 'Centroids: 1.00', explanation: 'Identical points centroid 1.00' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 7: K-Nearest Neighbors (KNN) Classifier',
    slug: 'vtu-ai-lab-7-knn-classifier',
    difficulty: 'Medium',
    category: 'AI',
    week_number: 7,
    description: '**VTU AI Lab Experiment 7:** Classify a test data point using K-Nearest Neighbors voting based on Euclidean distance.',
    input_format: 'First line N (training points), K (neighbors), and test_x.\nNext N lines contain train_x target_class.',
    output_format: 'Print "Predicted Class: [class]".',
    constraints: '1 <= K <= N <= 1000',
    sample_cases: [
      { input: '5 3 7\n1 A\n2 A\n6 B\n8 B\n9 B', output: 'Predicted Class: B', explanation: 'Nearest neighbors to x=7 are 6(B), 8(B), 9(B) -> majority B' },
      { input: '3 1 2\n1 Red\n5 Blue\n10 Green', output: 'Predicted Class: Red', explanation: 'Nearest neighbor to 2 is 1 (Red)' },
      { input: '4 3 5\n4 X\n5 X\n6 Y\n10 Y', output: 'Predicted Class: X', explanation: 'Majority class X' },
      { input: '1 1 100\n99 Top', output: 'Predicted Class: Top', explanation: 'Single neighbor' },
      { input: '3 3 0\n-1 A\n0 A\n1 B', output: 'Predicted Class: A', explanation: 'Neighbors -1(A), 0(A), 1(B) -> A' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 8: Locally Weighted Regression Algorithm',
    slug: 'vtu-ai-lab-8-locally-weighted-regression',
    difficulty: 'Hard',
    category: 'AI',
    week_number: 8,
    description: '**VTU AI Lab Experiment 8:** Compute non-parametric Locally Weighted Regression predictions using Gaussian kernel weight matrix.',
    input_format: 'First line query point x_query and bandwidth tau.\nNext line N space-separated x values.\nThird line N space-separated y values.',
    output_format: 'Print predicted y_hat value formatted to 4 decimal places.',
    constraints: 'tau > 0',
    sample_cases: [
      { input: '3.5 0.5\n1 2 3 4 5\n2 4 6 8 10', output: 'Predicted Y: 7.0000', explanation: 'LWR prediction at x=3.5 is 7.0000' },
      { input: '1.0 1.0\n1 2 3\n10 20 30', output: 'Predicted Y: 10.0000', explanation: 'At x=1.0 y=10.0000' },
      { input: '2.0 0.1\n2 4 6\n5 10 15', output: 'Predicted Y: 5.0000', explanation: 'Tight kernel around x=2.0' },
      { input: '0.0 1.0\n0 1\n0 2', output: 'Predicted Y: 0.0000', explanation: 'At x=0' },
      { input: '5.0 0.5\n1 3 5 7\n1 3 5 7', output: 'Predicted Y: 5.0000', explanation: 'Linear trend' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 9: Expectation Maximization (EM) Algorithm',
    slug: 'vtu-ai-lab-9-em-algorithm',
    difficulty: 'Hard',
    category: 'AI',
    week_number: 9,
    description: '**VTU AI Lab Experiment 9:** Execute Expectation step (E-step responsibilities) and Maximization step (M-step mean updates) on 1D Gaussian mixture dataset.',
    input_format: 'First line N data points and initial mu1, mu2.\nSecond line N space-separated data values.',
    output_format: 'Print updated means "Mu1: X.XX, Mu2: Y.YY" formatted to 2 decimal places.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '6 1.0 10.0\n1 2 3 9 10 11', output: 'Mu1: 2.00, Mu2: 10.00', explanation: 'EM converges to cluster means 2.00 and 10.00' },
      { input: '4 0.0 5.0\n0 0 5 5', output: 'Mu1: 0.00, Mu2: 5.00', explanation: 'Means 0.00 and 5.00' },
      { input: '2 10.0 20.0\n10 20', output: 'Mu1: 10.00, Mu2: 20.00', explanation: 'Exact separation' },
      { input: '3 1.0 1.0\n1 2 3', output: 'Mu1: 2.00, Mu2: 2.00', explanation: 'Coincident initial means' },
      { input: '4 2.0 8.0\n1 3 7 9', output: 'Mu1: 2.00, Mu2: 8.00', explanation: 'Converged cluster means' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU AI Lab 10: AO* Heuristic Search Algorithm',
    slug: 'vtu-ai-lab-10-ao-star-search',
    difficulty: 'Hard',
    category: 'AI',
    week_number: 10,
    description: '**VTU AI Lab Experiment 10:** Find optimal cost solution graph for AND-OR trees using AO* algorithm.',
    input_format: 'First line root node cost.\nNext lines sub-tree branch costs and AND/OR node types.',
    output_format: 'Print minimum solution tree cost as an integer.',
    constraints: 'node costs >= 0',
    sample_cases: [
      { input: '10\nBranch1 OR 5 8\nBranch2 AND 3 4', output: 'Minimum Solution Tree Cost: 7', explanation: 'AND branch cost 3+4=7 < OR branch min(5,8)=5' },
      { input: '0\nSingle 0', output: 'Minimum Solution Tree Cost: 0', explanation: 'Zero cost root' },
      { input: '5\nB1 AND 2 2', output: 'Minimum Solution Tree Cost: 4', explanation: 'AND branch cost 4' },
      { input: '10\nB1 OR 12 15', output: 'Minimum Solution Tree Cost: 12', explanation: 'Min OR branch 12' },
      { input: '3\nB1 AND 1 1', output: 'Minimum Solution Tree Cost: 2', explanation: 'AND branch cost 2' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_OS_LAB_PROBLEMS = [
  {
    title: 'VTU OS Lab 1: FCFS CPU Scheduling Algorithm',
    slug: 'vtu-os-lab-1-fcfs-scheduling',
    difficulty: 'Easy',
    category: 'OPERATING SYSTEMS',
    week_number: 1,
    description: '**VTU OS Lab Experiment 1:** Compute Average Waiting Time and Average Turnaround Time for processes scheduled using First-Come First-Serve (FCFS).',
    input_format: 'First line N (number of processes).\nSecond line N space-separated Burst Times.',
    output_format: 'Print "Avg Waiting Time: X.XX, Avg Turnaround Time: Y.YY".',
    constraints: '1 <= N <= 100, burst_time > 0',
    sample_cases: [
      { input: '3\n24 3 3', output: 'Avg Waiting Time: 17.00, Avg Turnaround Time: 27.00', explanation: 'P1(0,24), P2(24,27), P3(27,30)' },
      { input: '1\n10', output: 'Avg Waiting Time: 0.00, Avg Turnaround Time: 10.00', explanation: 'Single process' },
      { input: '3\n5 5 5', output: 'Avg Waiting Time: 5.00, Avg Turnaround Time: 10.00', explanation: 'Uniform burst times' },
      { input: '2\n1 2', output: 'Avg Waiting Time: 0.50, Avg Turnaround Time: 2.00', explanation: 'P1(0,1), P2(1,3)' },
      { input: '4\n2 2 2 2', output: 'Avg Waiting Time: 3.00, Avg Turnaround Time: 5.00', explanation: '4 processes' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 2: SJF Non-Preemptive CPU Scheduling',
    slug: 'vtu-os-lab-2-sjf-scheduling',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 2,
    description: '**VTU OS Lab Experiment 2:** Schedule processes using Shortest Job First (SJF) non-preemptive algorithm to minimize average waiting time.',
    input_format: 'First line N.\nSecond line N space-separated Burst Times.',
    output_format: 'Print "Avg Waiting Time: X.XX, Avg Turnaround Time: Y.YY".',
    constraints: '1 <= N <= 100',
    sample_cases: [
      { input: '4\n6 8 7 3', output: 'Avg Waiting Time: 7.00, Avg Turnaround Time: 13.00', explanation: 'Execution order: 3, 6, 7, 8' },
      { input: '2\n10 2', output: 'Avg Waiting Time: 1.00, Avg Turnaround Time: 7.00', explanation: 'SJF order: 2, 10' },
      { input: '1\n5', output: 'Avg Waiting Time: 0.00, Avg Turnaround Time: 5.00', explanation: 'Single process' },
      { input: '3\n3 1 2', output: 'Avg Waiting Time: 1.33, Avg Turnaround Time: 3.33', explanation: 'Order: 1, 2, 3' },
      { input: '3\n4 4 4', output: 'Avg Waiting Time: 4.00, Avg Turnaround Time: 8.00', explanation: 'Equal burst times' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 3: Round Robin CPU Scheduling',
    slug: 'vtu-os-lab-3-round-robin',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 3,
    description: '**VTU OS Lab Experiment 3:** Implement Round Robin CPU Scheduling with time quantum Q.',
    input_format: 'First line N and time quantum Q.\nSecond line N space-separated Burst Times.',
    output_format: 'Print "Avg Waiting Time: X.XX, Avg Turnaround Time: Y.YY".',
    constraints: 'Q >= 1, 1 <= N <= 100',
    sample_cases: [
      { input: '3 4\n24 3 3', output: 'Avg Waiting Time: 5.67, Avg Turnaround Time: 15.67', explanation: 'Round Robin execution with Q=4' },
      { input: '2 2\n5 2', output: 'Avg Waiting Time: 2.00, Avg Turnaround Time: 5.50', explanation: 'Quantum Q=2' },
      { input: '1 10\n5', output: 'Avg Waiting Time: 0.00, Avg Turnaround Time: 5.00', explanation: 'Quantum larger than burst time' },
      { input: '3 1\n2 2 2', output: 'Avg Waiting Time: 3.00, Avg Turnaround Time: 5.00', explanation: 'Q=1 round robin' },
      { input: '2 5\n10 10', output: 'Avg Waiting Time: 5.00, Avg Turnaround Time: 15.00', explanation: 'Equal process bursts' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 4: Priority CPU Scheduling Algorithm',
    slug: 'vtu-os-lab-4-priority-scheduling',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 4,
    description: '**VTU OS Lab Experiment 4:** Schedule processes based on Priority values (lower integer represents higher priority).',
    input_format: 'First line N.\nNext N lines process_id burst_time priority.',
    output_format: 'Print "Avg Waiting Time: X.XX, Avg Turnaround Time: Y.YY".',
    constraints: '1 <= N <= 100',
    sample_cases: [
      { input: '3\n1 10 3\n2 1 1\n3 2 2', output: 'Avg Waiting Time: 1.33, Avg Turnaround Time: 5.67', explanation: 'Scheduled in priority order P2(1), P3(2), P1(3)' },
      { input: '1\n1 5 1', output: 'Avg Waiting Time: 0.00, Avg Turnaround Time: 5.00', explanation: 'Single process' },
      { input: '2\n1 4 2\n2 2 1', output: 'Avg Waiting Time: 1.00, Avg Turnaround Time: 4.00', explanation: 'P2 higher priority' },
      { input: '3\n1 2 1\n2 2 2\n3 2 3', output: 'Avg Waiting Time: 2.00, Avg Turnaround Time: 4.00', explanation: 'Sequential priorities' },
      { input: '2\n1 10 5\n2 10 1', output: 'Avg Waiting Time: 5.00, Avg Turnaround Time: 15.00', explanation: 'Priority 1 before 5' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 5: Banker\'s Algorithm for Deadlock Avoidance',
    slug: 'vtu-os-lab-5-bankers-algorithm',
    difficulty: 'Hard',
    category: 'OPERATING SYSTEMS',
    week_number: 5,
    description: '**VTU OS Lab Experiment 5:** Execute Banker\'s Safety Algorithm to verify if the system is in a Safe State and output the Safe Sequence.',
    input_format: 'First line N (processes) and R (resources).\nNext N lines Allocation matrix.\nNext N lines Max matrix.\nNext line Available vector.',
    output_format: 'Print "System is in a safe state.\nSafe sequence: P0 P1 P2..." or "System is unsafe".',
    constraints: '1 <= N <= 10, 1 <= R <= 10',
    sample_cases: [
      { input: '5 3\n0 1 0\n2 0 0\n3 0 2\n2 1 1\n0 0 2\n7 5 3\n3 2 2\n9 0 2\n2 2 2\n4 3 3\n3 3 2', output: 'System is in a safe state.\nSafe sequence: P1 P3 P4 P0 P2', explanation: 'Safe sequence found' },
      { input: '1 1\n5\n10\n2', output: 'System is unsafe', explanation: 'Need 5 > Available 2' },
      { input: '1 1\n2\n5\n5', output: 'System is in a safe state.\nSafe sequence: P0', explanation: 'Single process safe' },
      { input: '2 1\n1\n2\n2\n2\n0', output: 'System is unsafe', explanation: 'Available 0 cannot satisfy need' },
      { input: '2 1\n0\n0\n5\n5\n10', output: 'System is in a safe state.\nSafe sequence: P0 P1', explanation: 'Both processes safe' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 6: Producer-Consumer Problem (Semaphores)',
    slug: 'vtu-os-lab-6-producer-consumer',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 6,
    description: '**VTU OS Lab Experiment 6:** Simulate Producer-Consumer synchronization using mutex, empty, and full semaphores on a bounded buffer of size B.',
    input_format: 'First line buffer_capacity B and Q operations.\nNext Q lines operation (PRODUCE item / CONSUME).',
    output_format: 'Print operation status ("Produced [item]", "Consumed [item]", "Buffer Full", "Buffer Empty").',
    constraints: 'B >= 1, 1 <= Q <= 100',
    sample_cases: [
      { input: '2 4\nPRODUCE 10\nPRODUCE 20\nPRODUCE 30\nCONSUME', output: 'Produced 10\nProduced 20\nBuffer Full\nConsumed 10', explanation: 'Buffer capacity 2 reached on 3rd produce' },
      { input: '1 2\nCONSUME\nPRODUCE 5', output: 'Buffer Empty\nProduced 5', explanation: 'Consume on empty buffer' },
      { input: '3 2\nPRODUCE A\nPRODUCE B', output: 'Produced A\nProduced B', explanation: 'Produces under capacity' },
      { input: '1 3\nPRODUCE X\nCONSUME\nCONSUME', output: 'Produced X\nConsumed X\nBuffer Empty', explanation: 'Buffer empty status' },
      { input: '2 2\nPRODUCE 1\nCONSUME', output: 'Produced 1\nConsumed 1', explanation: 'Produce then consume' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 7: FIFO Page Replacement Algorithm',
    slug: 'vtu-os-lab-7-fifo-page-replacement',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 7,
    description: '**VTU OS Lab Experiment 7:** Calculate total Page Faults for a reference string using First-In First-Out (FIFO) page replacement.',
    input_format: 'First line frame_count F.\nSecond line N space-separated page numbers.',
    output_format: 'Print "Total Page Faults: P".',
    constraints: 'F >= 1, 1 <= N <= 1000',
    sample_cases: [
      { input: '3\n7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1', output: 'Total Page Faults: 15', explanation: '15 page faults occurred' },
      { input: '3\n1 2 3 4 1 2 5 1 2 3 4 5', output: 'Total Page Faults: 9', explanation: 'Belady\'s Anomaly sample' },
      { input: '1\n1 1 1 1', output: 'Total Page Faults: 1', explanation: 'Repeated page hit' },
      { input: '2\n1 2 3 1 2', output: 'Total Page Faults: 5', explanation: 'Page faults = 5' },
      { input: '4\n1 2 3 4 5', output: 'Total Page Faults: 5', explanation: 'Initial fill + 1 fault' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 8: LRU Page Replacement Algorithm',
    slug: 'vtu-os-lab-8-lru-page-replacement',
    difficulty: 'Medium',
    category: 'OPERATING SYSTEMS',
    week_number: 8,
    description: '**VTU OS Lab Experiment 8:** Compute Page Faults using Least Recently Used (LRU) page replacement algorithm.',
    input_format: 'First line frame_count F.\nSecond line N space-separated page numbers.',
    output_format: 'Print "Total Page Faults: P".',
    constraints: 'F >= 1, 1 <= N <= 1000',
    sample_cases: [
      { input: '3\n7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1', output: 'Total Page Faults: 12', explanation: 'LRU yields 12 page faults' },
      { input: '4\n1 2 3 4 1 2 5 1 2 3 4 5', output: 'Total Page Faults: 8', explanation: '8 page faults with LRU' },
      { input: '1\n1 2 1 2', output: 'Total Page Faults: 4', explanation: '1 frame size' },
      { input: '2\n1 2 1 3', output: 'Total Page Faults: 3', explanation: 'Page 1 hit, page 3 fault' },
      { input: '3\n1 1 1 1', output: 'Total Page Faults: 1', explanation: 'Repeated hits' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 9: SCAN Disk Scheduling Algorithm',
    slug: 'vtu-os-lab-9-scan-disk-scheduling',
    difficulty: 'Hard',
    category: 'OPERATING SYSTEMS',
    week_number: 9,
    description: '**VTU OS Lab Experiment 9:** Calculate total seek operations (cylinder movements) for SCAN (Elevator) disk scheduling algorithm towards higher tracks.',
    input_format: 'First line initial_head_position and disk_size.\nSecond line N space-separated track request cylinders.',
    output_format: 'Print "Total Head Movement: T cylinders".',
    constraints: '0 <= head < disk_size',
    sample_cases: [
      { input: '50 200\n176 79 34 60 92 11 41 114', output: 'Total Head Movement: 332 cylinders', explanation: 'SCAN moves towards 199 then reverses' },
      { input: '0 100\n10 20 30', output: 'Total Head Movement: 30 cylinders', explanation: 'Direct scan to 30' },
      { input: '50 100\n50', output: 'Total Head Movement: 0 cylinders', explanation: 'Already at head' },
      { input: '100 200\n50 150', output: 'Total Head Movement: 249 cylinders', explanation: 'SCAN towards 199 then reverse to 50' },
      { input: '10 50\n20 40', output: 'Total Head Movement: 30 cylinders', explanation: '10 -> 40' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU OS Lab 10: Sequential & Indexed File Allocation',
    slug: 'vtu-os-lab-10-file-allocation',
    difficulty: 'Hard',
    category: 'OPERATING SYSTEMS',
    week_number: 10,
    description: '**VTU OS Lab Experiment 10:** Simulate Indexed File Allocation strategy: verify block allocation availability given index block and data blocks.',
    input_format: 'First line index_block and length K.\nSecond line K space-separated block numbers.',
    output_format: 'Print "File Allocated: Index [idx] -> [b1, b2, ...]" or "Block Allocation Conflict".',
    constraints: 'blocks >= 0',
    sample_cases: [
      { input: '9 3\n1 2 3', output: 'File Allocated: Index 9 -> [1, 2, 3]', explanation: 'Successfully allocated index block 9 to data blocks [1,2,3]' },
      { input: '5 2\n5 10', output: 'Block Allocation Conflict', explanation: 'Index block 5 overlaps with data block 5' },
      { input: '1 1\n2', output: 'File Allocated: Index 1 -> [2]', explanation: 'Single block allocation' },
      { input: '10 2\n20 30', output: 'File Allocated: Index 10 -> [20, 30]', explanation: 'Valid index allocation' },
      { input: '0 1\n0', output: 'Block Allocation Conflict', explanation: 'Conflict on block 0' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_LATEX_LAB_PROBLEMS = [
  {
    title: 'VTU LATEX Lab 1: Section Header & Title Formatting',
    slug: 'vtu-latex-lab-1-title-sections',
    difficulty: 'Easy',
    category: 'LATEX',
    week_number: 1,
    description: '**VTU LATEX Lab Experiment 1:** Parse LaTeX document commands `\\title{}`, `\\author{}`, `\\section{}`, and `\\subsection{}` into formatted document structure.',
    input_format: 'Multiline LaTeX source markup string.',
    output_format: 'Print document structure hierarchy line by line.',
    constraints: 'length <= 5000',
    sample_cases: [
      { input: '\\title{ADA Lab}\\author{VTU}\\section{Introduction}\\subsection{Overview}', output: 'Title: ADA Lab\nAuthor: VTU\n1. Introduction\n1.1. Overview', explanation: 'Section hierarchy generated' },
      { input: '\\title{Test}\\section{Main}', output: 'Title: Test\n1. Main', explanation: 'Single section document' },
      { input: '\\section{Chapter 1}', output: '1. Chapter 1', explanation: 'Section only' },
      { input: '\\title{Doc}\\author{Author}', output: 'Title: Doc\nAuthor: Author', explanation: 'Title and author' },
      { input: '\\section{A}\\section{B}', output: '1. A\n2. B', explanation: 'Sequential sections' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 2: Mathematical Equation Typesetting',
    slug: 'vtu-latex-lab-2-math-equation',
    difficulty: 'Easy',
    category: 'LATEX',
    week_number: 2,
    description: '**VTU LATEX Lab Experiment 2:** Parse math mode commands `\\frac{a}{b}`, `\\sqrt{x}`, `x^{n}`, `x_{i}` into plain text math notation.',
    input_format: 'LaTeX equation string inside `\\begin{equation}...\\end{equation}`.',
    output_format: 'Print plain text math expression.',
    constraints: 'length <= 500',
    sample_cases: [
      { input: '\\begin{equation}\\frac{a}{b} + \\sqrt{x}\\end{equation}', output: '(a)/(b) + sqrt(x)', explanation: 'Fraction and square root converted' },
      { input: '\\begin{equation}x^{2} + y_{1}\\end{equation}', output: 'x^(2) + y_(1)', explanation: 'Exponent and subscript' },
      { input: '\\begin{equation}\\frac{1}{2}\\end{equation}', output: '(1)/(2)', explanation: 'Half fraction' },
      { input: '\\begin{equation}\\sqrt{100}\\end{equation}', output: 'sqrt(100)', explanation: 'Square root of 100' },
      { input: '\\begin{equation}a^{b}\\end{equation}', output: 'a^(b)', explanation: 'Power expression' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 3: Itemize & Enumerate Lists',
    slug: 'vtu-latex-lab-3-lists',
    difficulty: 'Easy',
    category: 'LATEX',
    week_number: 3,
    description: '**VTU LATEX Lab Experiment 3:** Convert `\\begin{itemize}` bullet lists and `\\begin{enumerate}` numbered lists into plain text bulleted / numbered outputs.',
    input_format: 'LaTeX list code.',
    output_format: 'Print list items with `*` for itemize or `1. 2.` for enumerate.',
    constraints: 'items <= 20',
    sample_cases: [
      { input: '\\begin{itemize}\\item First\\item Second\\end{itemize}', output: '* First\n* Second', explanation: 'Itemize list output' },
      { input: '\\begin{enumerate}\\item One\\item Two\\end{enumerate}', output: '1. One\n2. Two', explanation: 'Enumerate list output' },
      { input: '\\begin{itemize}\\item Single\\end{itemize}', output: '* Single', explanation: 'Single item' },
      { input: '\\begin{enumerate}\\item Step 1\\item Step 2\\item Step 3\\end{enumerate}', output: '1. Step 1\n2. Step 2\n3. Step 3', explanation: '3 steps' },
      { input: '\\begin{itemize}\\item A\\item B\\end{itemize}', output: '* A\n* B', explanation: 'Two bullet points' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 4: Table Environment Grid Parser',
    slug: 'vtu-latex-lab-4-tables',
    difficulty: 'Medium',
    category: 'LATEX',
    week_number: 4,
    description: '**VTU LATEX Lab Experiment 4:** Parse `\\begin{tabular}{c c}` tabular rows delimited by `&` and `\\\\` into aligned ASCII table rows.',
    input_format: 'LaTeX tabular markup.',
    output_format: 'Print pipe-separated `| col1 | col2 |` formatted table lines.',
    constraints: 'rows <= 50',
    sample_cases: [
      { input: '\\begin{tabular}{c c}Name & USN \\\\ Alice & 101 \\end{tabular}', output: '| Name | USN |\n| Alice | 101 |', explanation: '2x2 table parsed' },
      { input: '\\begin{tabular}{c}Single \\\\ Row \\end{tabular}', output: '| Single |\n| Row |', explanation: 'Single column' },
      { input: '\\begin{tabular}{c c c}A & B & C \\\\ 1 & 2 & 3 \\end{tabular}', output: '| A | B | C |\n| 1 | 2 | 3 |', explanation: '3 columns' },
      { input: '\\begin{tabular}{c c}X & Y \\\\ 10 & 20 \\\\ 30 & 40 \\end{tabular}', output: '| X | Y |\n| 10 | 20 |\n| 30 | 40 |', explanation: '3 rows table' },
      { input: '\\begin{tabular}{c c}Col1 & Col2 \\end{tabular}', output: '| Col1 | Col2 |', explanation: 'Header only' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 5: Figure Inclusion & Caption References',
    slug: 'vtu-latex-lab-5-figure-caption',
    difficulty: 'Medium',
    category: 'LATEX',
    week_number: 5,
    description: '**VTU LATEX Lab Experiment 5:** Extract image file path, caption text, and label key from `\\begin{figure}...\\end{figure}` block.',
    input_format: 'LaTeX figure block string.',
    output_format: 'Print "Figure: [filename] | Caption: [caption] | Label: [label]".',
    constraints: 'length <= 2000',
    sample_cases: [
      { input: '\\begin{figure}\\includegraphics{graph.png}\\caption{MST Graph}\\label{fig:mst}\\end{figure}', output: 'Figure: graph.png | Caption: MST Graph | Label: fig:mst', explanation: 'Extracted figure parameters' },
      { input: '\\begin{figure}\\includegraphics{chart.jpg}\\caption{Performance Chart}\\end{figure}', output: 'Figure: chart.jpg | Caption: Performance Chart | Label: None', explanation: 'No label provided' },
      { input: '\\begin{figure}\\includegraphics{diagram.png}\\label{fig:1}\\end{figure}', output: 'Figure: diagram.png | Caption: None | Label: fig:1', explanation: 'Caption missing' },
      { input: '\\begin{figure}\\includegraphics{a.png}\\caption{A}\\label{a}\\end{figure}', output: 'Figure: a.png | Caption: A | Label: a', explanation: 'Figure parameters' },
      { input: '\\begin{figure}\\includegraphics{img.svg}\\caption{Vector Image}\\label{svg:1}\\end{figure}', output: 'Figure: img.svg | Caption: Vector Image | Label: svg:1', explanation: 'SVG image inclusion' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 6: Bibliography BibTeX Citation Parser',
    slug: 'vtu-latex-lab-6-bibtex-citation',
    difficulty: 'Medium',
    category: 'LATEX',
    week_number: 6,
    description: '**VTU LATEX Lab Experiment 6:** Parse `\\cite{key}` references and match them with `@article{key, author={...}, title={...}}` BibTeX entries.',
    input_format: 'First line citation key.\nNext lines BibTeX entry string.',
    output_format: 'Print "[1] Author, \"Title\", Journal/Year".',
    constraints: 'length <= 2000',
    sample_cases: [
      { input: 'cormen2009\n@article{cormen2009, author={Cormen et al.}, title={Introduction to Algorithms}}', output: '[1] Cormen et al., "Introduction to Algorithms"', explanation: 'Citation formatted' },
      { input: 'missingKey\n@article{otherKey, title={Some Title}}', output: 'Citation Not Found', explanation: 'Key mismatch' },
      { input: 'korth2020\n@article{korth2020, author={Korth}, title={Database System Concepts}}', output: '[1] Korth, "Database System Concepts"', explanation: 'Korth citation' },
      { input: 'tanenbaum\n@article{tanenbaum, author={Tanenbaum}, title={Modern Operating Systems}}', output: '[1] Tanenbaum, "Modern Operating Systems"', explanation: 'Tanenbaum citation' },
      { input: 'key1\n@article{key1, author={Aut}, title={Tit}}', output: '[1] Aut, "Tit"', explanation: 'Short citation' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 7: Algorithm Pseudocode Listing Formatter',
    slug: 'vtu-latex-lab-7-algorithm-listing',
    difficulty: 'Hard',
    category: 'LATEX',
    week_number: 7,
    description: '**VTU LATEX Lab Experiment 7:** Format `\\begin{algorithm}...\\end{algorithm}` pseudocode commands `\\State`, `\\If`, `\\For` into indented algorithm lines.',
    input_format: 'LaTeX algorithm environment string.',
    output_format: 'Print numbered indented algorithm steps.',
    constraints: 'lines <= 50',
    sample_cases: [
      { input: '\\begin{algorithm}\\State x = 0\\For{i = 1 to n}\\State x = x + i\\EndFor\\end{algorithm}', output: '1: x = 0\n2: For i = 1 to n\n3:     x = x + i\n4: EndFor', explanation: 'Algorithm pseudocode formatted' },
      { input: '\\begin{algorithm}\\State print("Hello")\\end{algorithm}', output: '1: print("Hello")', explanation: 'Single state step' },
      { input: '\\begin{algorithm}\\If{cond}\\State doX\\EndIf\\end{algorithm}', output: '1: If cond\n2:     doX\n3: EndIf', explanation: 'If block pseudocode' },
      { input: '\\begin{algorithm}\\State init\\State finish\\end{algorithm}', output: '1: init\n2: finish', explanation: 'Two state steps' },
      { input: '\\begin{algorithm}\\For{each x}\\State process\\EndFor\\end{algorithm}', output: '1: For each x\n2:     process\n3: EndFor', explanation: 'For loop algorithm' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU LATEX Lab 8: Beamer Slide Presentation Deck Generator',
    slug: 'vtu-latex-lab-8-beamer-slides',
    difficulty: 'Hard',
    category: 'LATEX',
    week_number: 8,
    description: '**VTU LATEX Lab Experiment 8:** Parse Beamer presentation code `\\begin{frame}{Slide Title}...\\end{frame}` into numbered presentation slides.',
    input_format: 'LaTeX Beamer presentation document string.',
    output_format: 'Print "--- Slide N: [Title] ---\n[Slide Content]".',
    constraints: 'slides <= 20',
    sample_cases: [
      { input: '\\begin{frame}{Introduction}Welcome to VTU Lab\\end{frame}\\begin{frame}{Agenda}1. ADA\\n2. DBMS\\end{frame}', output: '--- Slide 1: Introduction ---\nWelcome to VTU Lab\n--- Slide 2: Agenda ---\n1. ADA\n2. DBMS', explanation: '2 slides generated' },
      { input: '\\begin{frame}{Title Only}\\end{frame}', output: '--- Slide 1: Title Only ---', explanation: 'Empty slide content' },
      { input: '\\begin{frame}{Demo}Sample Content\\end{frame}', output: '--- Slide 1: Demo ---\nSample Content', explanation: 'Single slide' },
      { input: '\\begin{frame}{S1}C1\\end{frame}\\begin{frame}{S2}C2\\end{frame}', output: '--- Slide 1: S1 ---\nC1\n--- Slide 2: S2 ---\nC2', explanation: 'Sequential slides' },
      { input: '\\begin{frame}{End}Thank You\\end{frame}', output: '--- Slide 1: End ---\nThank You', explanation: 'Final slide' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const VTU_DSA_LAB_PROBLEMS = [
  {
    title: 'VTU DSA Lab 1: Array Operations (Create, Insert, Delete, Display)',
    slug: 'vtu-dsa-lab-1-array-operations',
    difficulty: 'Easy',
    category: 'DSA',
    week_number: 1,
    description: 'Design, Develop and Execute a Menu Driven Program for array operations: creating an array of N elements, inserting an element at given position pos, deleting an element at position pos, and displaying the array.\n\n**VTU Data Structures Lab Program 1**',
    input_format: 'First line N elements count.\nSecond line N space-separated integers.\nThird line command: 1 pos val (Insert), 2 pos (Delete).\nFourth line 3 (Display).',
    output_format: 'Print updated array elements space-separated.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '4\n10 20 30 40\n1 2 25\n3', output: '10 20 25 30 40', explanation: 'Inserted 25 at index 2' },
      { input: '5\n1 2 3 4 5\n2 3\n3', output: '1 2 3 5', explanation: 'Deleted element at index 3' },
      { input: '3\n5 10 15\n1 0 1\n3', output: '1 5 10 15', explanation: 'Inserted 1 at index 0' },
      { input: '2\n100 200\n2 0\n3', output: '200', explanation: 'Deleted first element' },
      { input: '3\n7 8 9\n1 3 10\n3', output: '7 8 9 10', explanation: 'Inserted 10 at end' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 2: String Pattern Matching & Replacement',
    slug: 'vtu-dsa-lab-2-pattern-matching',
    difficulty: 'Easy',
    category: 'DSA',
    week_number: 2,
    description: 'Design, Develop and Execute a Program to find pattern P in main string S and replace all occurrences of P with pattern R without using built-in string replacement functions.\n\n**VTU Data Structures Lab Program 2**',
    input_format: 'First line Main String S.\nSecond line Pattern P.\nThird line Replacement R.',
    output_format: 'Print modified string, or "Pattern Not Found".',
    constraints: '1 <= |S| <= 1000',
    sample_cases: [
      { input: 'VTU Computer Science\nComputer\nInformation', output: 'VTU Information Science', explanation: 'Replaced Computer with Information' },
      { input: 'hello world hello\nhello\nhi', output: 'hi world hi', explanation: 'Replaced all hello' },
      { input: 'smart lab system\nxyz\nabc', output: 'Pattern Not Found', explanation: 'Pattern xyz not in string' },
      { input: 'aaaa\naa\nb', output: 'bb', explanation: 'Replaced non-overlapping pairs' },
      { input: 'data structures\nstructures\nalgorithms', output: 'data algorithms', explanation: 'Replaced structures' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 3: Stack Operations & Palindrome Checker',
    slug: 'vtu-dsa-lab-3-stack-palindrome',
    difficulty: 'Easy',
    category: 'DSA',
    week_number: 3,
    description: 'Design, Develop and Execute a Program for Stack of integers supporting Push, Pop, Stack Overflow/Underflow checks, and Palindrome check for a given sequence using stack.\n\n**VTU Data Structures Lab Program 3**',
    input_format: 'First line string/sequence S to check for palindrome.',
    output_format: 'Print PALINDROME or NOT PALINDROME.',
    constraints: '1 <= |S| <= 1000',
    sample_cases: [
      { input: 'madam', output: 'PALINDROME', explanation: 'madam reads same forward and backward' },
      { input: '12321', output: 'PALINDROME', explanation: '12321 is palindrome' },
      { input: 'vtu', output: 'NOT PALINDROME', explanation: 'vtu is not palindrome' },
      { input: 'racecar', output: 'PALINDROME', explanation: 'racecar is palindrome' },
      { input: 'smartlab', output: 'NOT PALINDROME', explanation: 'smartlab is not palindrome' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 4: Infix to Postfix Expression Conversion',
    slug: 'vtu-dsa-lab-4-infix-to-postfix',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 4,
    description: 'Design, Develop and Execute a Program to convert a given valid parenthesized Infix expression into Postfix expression using Stack.\n\n**VTU Data Structures Lab Program 4**',
    input_format: 'Single line parenthesized Infix expression string.',
    output_format: 'Print converted Postfix expression string.',
    constraints: '1 <= |expression| <= 100',
    sample_cases: [
      { input: '(A+(B*C))', output: 'ABC*+', explanation: 'Infix to Postfix conversion' },
      { input: '((A+B)*C)', output: 'AB+C*', explanation: 'Infix to Postfix conversion' },
      { input: '(A+B)', output: 'AB+', explanation: 'Simple addition' },
      { input: '((A/B)+C)', output: 'AB/C+', explanation: 'Division precedence' },
      { input: '((A*(B+C))/D)', output: 'ABC+*D/', explanation: 'Nested expression' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 5: Evaluation of Postfix & Tower of Hanoi',
    slug: 'vtu-dsa-lab-5-postfix-evaluation-hanoi',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 5,
    description: 'Design, Develop and Execute a Program for (A) Evaluation of Postfix expression with single-digit operands using Stack, and (B) Solving Tower of Hanoi problem for N disks.\n\n**VTU Data Structures Lab Program 5**',
    input_format: 'First line Postfix Expression (space separated tokens).\nSecond line N (disks for Tower of Hanoi).',
    output_format: 'First line: Result of Postfix Evaluation.\nSecond line: Total moves for N disks in Tower of Hanoi.',
    constraints: '1 <= N <= 20',
    sample_cases: [
      { input: '2 3 * 4 +\n3', output: '10\n7', explanation: '2*3+4 = 10, 3 disks require 2^3 - 1 = 7 moves' },
      { input: '5 1 2 + 4 * + 3 -\n4', output: '14\n15', explanation: 'Postfix result 14, 4 disks require 15 moves' },
      { input: '3 4 +\n1', output: '7\n1', explanation: '3+4 = 7, 1 disk requires 1 move' },
      { input: '6 2 /\n2', output: '3\n3', explanation: '6/2 = 3, 2 disks require 3 moves' },
      { input: '10 2 -\n5', output: '8\n31', explanation: '10-2 = 8, 5 disks require 31 moves' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 6: Circular Queue Operations',
    slug: 'vtu-dsa-lab-6-circular-queue',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 6,
    description: 'Design, Develop and Execute a Program for Circular Queue of characters supporting Insert (enqueue), Delete (dequeue), and Display operations with overflow and underflow checks.\n\n**VTU Data Structures Lab Program 6**',
    input_format: 'First line Capacity C.\nSecond line Operations count N.\nNext N lines contain: 1 CHAR (enqueue), 2 (dequeue).',
    output_format: 'Print remaining queue elements after operations.',
    constraints: '1 <= C <= 100',
    sample_cases: [
      { input: '3\n4\n1 A\n1 B\n1 C\n2', output: 'B C', explanation: 'Enqueued A, B, C; Dequeued A; Queue holds B C' },
      { input: '2\n3\n1 X\n1 Y\n2', output: 'Y', explanation: 'Enqueued X, Y; Dequeued X' },
      { input: '4\n3\n1 P\n1 Q\n1 R', output: 'P Q R', explanation: 'Enqueued P, Q, R' },
      { input: '2\n2\n1 M\n2', output: 'EMPTY QUEUE', explanation: 'Dequeued single element' },
      { input: '3\n5\n1 1\n1 2\n2\n1 3\n1 4', output: '2 3 4', explanation: 'Circular wrapping operations' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 7: Singly Linked List (SLL) Student Record System',
    slug: 'vtu-dsa-lab-7-singly-linked-list',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 7,
    description: 'Design, Develop and Execute a Program for Singly Linked List of Student Data (USN, Name, Branch) supporting Insert at Front/End, Delete at Front/End, and Node Count.\n\n**VTU Data Structures Lab Program 7**',
    input_format: 'First line N nodes.\nNext N lines contain USN Name Branch.\nNext line operation: 1 FRONT_INSERT USN Name Branch, 2 END_DELETE.',
    output_format: 'Print SLL elements USN:Name:Branch space separated.',
    constraints: '1 <= N <= 500',
    sample_cases: [
      { input: '2\n4PM22CS001 Alice CS\n4PM22CS002 Bob CS\n1 4PM22CS000 Zar CS', output: '4PM22CS000:Zar:CS 4PM22CS001:Alice:CS 4PM22CS002:Bob:CS', explanation: 'Inserted Zar at front' },
      { input: '2\n4PM22CS001 Alice CS\n4PM22CS002 Bob CS\n2', output: '4PM22CS001:Alice:CS', explanation: 'Deleted from end' },
      { input: '1\n4PM22CS010 Charlie EC\n1 4PM22CS009 Dave EC', output: '4PM22CS009:Dave:EC 4PM22CS010:Charlie:EC', explanation: 'Front insert' },
      { input: '1\n4PM22CS001 Alice CS\n2', output: 'EMPTY LIST', explanation: 'Deleted single node' },
      { input: '2\n4PM22CS001 A CS\n4PM22CS002 B CS\n1 4PM22CS003 C CS', output: '4PM22CS003:C:CS 4PM22CS001:A:CS 4PM22CS002:B:CS', explanation: 'Front insert' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 8: Doubly Linked List (DLL) Employee Record System',
    slug: 'vtu-dsa-lab-8-doubly-linked-list',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 8,
    description: 'Design, Develop and Execute a Program for Doubly Linked List of Employee Data (SSN, Name, Dept, Salary) supporting Insert, Delete, and Forward/Backward traversal.\n\n**VTU Data Structures Lab Program 8**',
    input_format: 'First line N employees.\nNext N lines contain SSN Name Dept Salary.\nNext line operation: FORWARD or BACKWARD.',
    output_format: 'Print Employee SSNs separated by space.',
    constraints: '1 <= N <= 500',
    sample_cases: [
      { input: '3\n101 John HR 50000\n102 Smith IT 60000\n103 Dave Sales 55000\nFORWARD', output: '101 102 103', explanation: 'Forward traversal of DLL' },
      { input: '3\n101 John HR 50000\n102 Smith IT 60000\n103 Dave Sales 55000\nBACKWARD', output: '103 102 101', explanation: 'Backward traversal of DLL' },
      { input: '1\n201 Alex Eng 70000\nFORWARD', output: '201', explanation: 'Single node DLL' },
      { input: '2\n301 A CSE 1000\n302 B CSE 2000\nBACKWARD', output: '302 301', explanation: 'Backward traversal' },
      { input: '2\n301 A CSE 1000\n302 B CSE 2000\nFORWARD', output: '301 302', explanation: 'Forward traversal' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 9: Polynomial Addition using Singly Linked List',
    slug: 'vtu-dsa-lab-9-polynomial-addition',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 9,
    description: 'Design, Develop and Execute a Program to represent two polynomials using Singly Linked List with header node and perform polynomial addition P1(x) + P2(x).\n\n**VTU Data Structures Lab Program 9**',
    input_format: 'First line N terms of Poly 1.\nNext N lines contain Coeff Power.\nSecond line M terms of Poly 2.\nNext M lines contain Coeff Power.',
    output_format: 'Print resulting polynomial terms in format Coeffx^Power space-separated.',
    constraints: '1 <= N, M <= 100',
    sample_cases: [
      { input: '2\n5 2\n4 1\n2\n3 2\n2 0', output: '8x^2 4x^1 2x^0', explanation: '(5x^2 + 4x) + (3x^2 + 2) = 8x^2 + 4x^1 + 2x^0' },
      { input: '1\n3 3\n1\n2 3', output: '5x^3', explanation: '3x^3 + 2x^3 = 5x^3' },
      { input: '2\n1 1\n1 0\n1\n2 1', output: '3x^1 1x^0', explanation: '(x + 1) + 2x = 3x + 1' },
      { input: '1\n10 0\n1\n20 0', output: '30x^0', explanation: 'Constants addition' },
      { input: '2\n4 2\n-2 1\n1\n2 1', output: '4x^2 0x^1', explanation: 'Cancel out linear term' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 10: Binary Search Tree (BST) Traversals & Key Search',
    slug: 'vtu-dsa-lab-10-binary-search-tree',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 10,
    description: 'Design, Develop and Execute a Program to construct a Binary Search Tree (BST) of integers, display Inorder traversal, Preorder traversal, and Search for a Key element K.\n\n**VTU Data Structures Lab Program 10**',
    input_format: 'First line N.\nSecond line N space-separated integers.\nThird line Search Key K.',
    output_format: 'First line: Inorder traversal.\nSecond line: FOUND or NOT FOUND.',
    constraints: '1 <= N <= 1000',
    sample_cases: [
      { input: '5\n50 30 70 20 40\n30', output: '20 30 40 50 70\nFOUND', explanation: 'Inorder of BST is sorted, 30 is found' },
      { input: '4\n10 5 15 20\n100', output: '5 10 15 20\nNOT FOUND', explanation: '100 is not in BST' },
      { input: '1\n42\n42', output: '42\nFOUND', explanation: 'Single node BST' },
      { input: '3\n8 3 10\n8', output: '3 8 10\nFOUND', explanation: 'Root element found' },
      { input: '5\n6 2 8 1 4\n4', output: '1 2 4 6 8\nFOUND', explanation: 'Node 4 found' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 11: Graph Reachability using BFS and DFS',
    slug: 'vtu-dsa-lab-11-graph-bfs-dfs',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 11,
    description: 'Design, Develop and Execute a Program to represent an unweighted graph using Adjacency Matrix and find all reachable vertices from a given source vertex S using BFS and DFS.\n\n**VTU Data Structures Lab Program 11**',
    input_format: 'First line V.\nNext V lines contain V x V adjacency matrix (0 or 1).\nLast line Source S.',
    output_format: 'First line: BFS traversal path space-separated.\nSecond line: DFS traversal path space-separated.',
    constraints: '1 <= V <= 100',
    sample_cases: [
      { input: '4\n0 1 1 0\n0 0 1 0\n1 0 0 1\n0 0 0 1\n0', output: '0 1 2 3\n0 1 2 3', explanation: 'BFS and DFS traversal from vertex 0' },
      { input: '3\n0 1 0\n0 0 1\n0 0 0\n0', output: '0 1 2\n0 1 2', explanation: 'Linear reachability 0->1->2' },
      { input: '2\n0 1\n1 0\n1', output: '1 0\n1 0', explanation: 'Start from vertex 1' },
      { input: '3\n0 0 0\n0 0 0\n0 0 0\n0', output: '0\n0', explanation: 'No edges, only source 0 reachable' },
      { input: '4\n0 1 0 0\n0 0 1 0\n0 0 0 1\n1 0 0 0\n0', output: '0 1 2 3\n0 1 2 3', explanation: 'Cycle traversal' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    title: 'VTU DSA Lab 12: Hash Table with Linear Probing',
    slug: 'vtu-dsa-lab-12-hash-table-linear-probing',
    difficulty: 'Medium',
    category: 'DSA',
    week_number: 12,
    description: 'Design, Develop and Execute a Program to insert 4-digit key values into a Hash Table of size m using Hash Function h(k) = k mod m, and resolve collisions using Linear Probing.\n\n**VTU Data Structures Lab Program 12**',
    input_format: 'First line Hash Table Size m and Keys count N.\nSecond line N 4-digit key values.',
    output_format: 'Print non-empty Hash Table entries in format Index:Key space-separated.',
    constraints: '1 <= m <= 100',
    sample_cases: [
      { input: '10 4\n1234 2345 3456 4567', output: '4:1234 5:2345 6:3456 7:4567', explanation: 'Direct hash mapping k % 10' },
      { input: '5 3\n10 15 20', output: '0:10 1:15 2:20', explanation: 'Linear probing resolves collision at index 0' },
      { input: '5 2\n1001 2001', output: '1:1001 2:2001', explanation: 'Linear probing collision at index 1' },
      { input: '3 1\n9999', output: '0:9999', explanation: 'Single element 9999 % 3 = 0' },
      { input: '7 3\n70 77 84', output: '0:70 1:77 2:84', explanation: 'Collisions at index 0 probed linearly' }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const ALL_VTU_LAB_PROBLEMS = [
  ...VTU_DSA_LAB_PROBLEMS,
  ...VTU_ADA_LAB_PROBLEMS,
  ...VTU_DBMS_LAB_PROBLEMS,
  ...VTU_JAVA_LAB_PROBLEMS,
  ...VTU_PYTHON_LAB_PROBLEMS,
  ...VTU_MONGODB_LAB_PROBLEMS,
  ...VTU_AI_LAB_PROBLEMS,
  ...VTU_OS_LAB_PROBLEMS,
  ...VTU_LATEX_LAB_PROBLEMS
];

module.exports = {
  DEFAULT_STARTER_CODE,
  ALL_VTU_LAB_PROBLEMS
};

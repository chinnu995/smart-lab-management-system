const DEFAULT_STARTER_CODE = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`,
  python: `# Write your solution below\nimport sys\n\ndef solve():\n    # Read input from STDIN and print output to STDOUT\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  javascript: `// Write your JavaScript solution below\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    // Write your code here\n}\n\nsolve();\n`,
  sql: `-- Write your SQL query below\nSELECT * FROM table_name;\n`
};

const ADA_PLACEMENT_PATTERNS = [
  {
    id: 1,
    patternName: "Two Pointers Pattern",
    title: "Pattern 1: Pair with Target Sum (Two Sum)",
    slug: "placement-pattern-1-two-pointers",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["Amazon","Google","TCS","Infosys"],
    frequency: "98% Placement Frequency",
    description: "Given a 1-indexed sorted array of integers `arr` and a `target` sum, find the 1-based indices of two numbers such that they add up to the target in O(N) time and O(1) space.",
    input_format: "First line contains N and target.\nSecond line contains N sorted integers.",
    output_format: "Print two 1-based indices separated by a space, or -1.",
    constraints: "2 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 11\n1 2 3 4 7 10",
                "output": "1 6",
                "explanation": "arr[1] + arr[6] = 11"
          },
          {
                "input": "4 6\n2 3 4 5",
                "output": "1 3",
                "explanation": "arr[1] + arr[3] = 6"
          },
          {
                "input": "5 0\n-3 -1 0 1 3",
                "output": "1 5",
                "explanation": "arr[1] + arr[5] = 0"
          },
          {
                "input": "5 15\n1 3 4 8 11",
                "output": "3 5",
                "explanation": "arr[3] + arr[5] = 15"
          },
          {
                "input": "3 10\n1 2 3",
                "output": "-1",
                "explanation": "No pair sums to 10"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 2,
    patternName: "Sliding Window Pattern",
    title: "Pattern 2: Maximum Sum Subarray of Size K",
    slug: "placement-pattern-2-sliding-window",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["Microsoft","Amazon","Wipro"],
    frequency: "95% Placement Frequency",
    description: "Find max sum of contiguous subarray of size K in O(N) time.",
    input_format: "First line N and K.\nSecond line N integers.",
    output_format: "Print max integer sum.",
    constraints: "1 <= K <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 3\n2 1 5 1 3 2",
                "output": "9",
                "explanation": "Subarray [5,1,3] sum is 9"
          },
          {
                "input": "4 2\n2 3 4 15",
                "output": "19",
                "explanation": "Subarray [4,15] sum is 19"
          },
          {
                "input": "5 1\n10 20 30 40 50",
                "output": "50",
                "explanation": "Single element [50]"
          },
          {
                "input": "7 4\n1 4 2 10 2 3 10",
                "output": "25",
                "explanation": "Subarray [10,2,3,10]"
          },
          {
                "input": "5 5\n1 2 3 4 5",
                "output": "15",
                "explanation": "Entire array sum"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 3,
    patternName: "Fast & Slow Pointers",
    title: "Pattern 3: Linked List Cycle Detection",
    slug: "placement-pattern-3-fast-slow-pointers",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["Amazon","Accenture","Cognizant"],
    frequency: "94% Placement Frequency",
    description: "Detect cycle in linked list using Floyd's Tortoise and Hare algorithm.",
    input_format: "First line N.\nSecond line N values.\nThird line pos index (-1 if none).",
    output_format: "Print \"true\" or \"false\".",
    constraints: "0 <= N <= 10^4",
    sample_cases: [
          {
                "input": "4\n3 2 0 -4\n1",
                "output": "true",
                "explanation": "Tail connects to index 1"
          },
          {
                "input": "2\n1 2\n0",
                "output": "true",
                "explanation": "Tail connects to index 0"
          },
          {
                "input": "1\n1\n-1",
                "output": "false",
                "explanation": "No cycle"
          },
          {
                "input": "5\n1 2 3 4 5\n-1",
                "output": "false",
                "explanation": "No cycle"
          },
          {
                "input": "3\n10 20 30\n2",
                "output": "true",
                "explanation": "Tail connects to index 2"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 4,
    patternName: "Merge Intervals Pattern",
    title: "Pattern 4: Merge Overlapping Intervals",
    slug: "placement-pattern-4-merge-intervals",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Google","Amazon","Flipkart"],
    frequency: "92% Placement Frequency",
    description: "Merge overlapping intervals in sorted order.",
    input_format: "First line N.\nNext N lines start end.",
    output_format: "Print merged intervals line by line.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 3\n2 6\n8 10\n15 18",
                "output": "1 6\n8 10\n15 18",
                "explanation": "[1,3] & [2,6] merge into [1,6]"
          },
          {
                "input": "2\n1 4\n4 5",
                "output": "1 5",
                "explanation": "[1,4] & [4,5] merge into [1,5]"
          },
          {
                "input": "3\n1 10\n2 3\n4 5",
                "output": "1 10",
                "explanation": "Subsumed in [1,10]"
          },
          {
                "input": "3\n6 8\n1 3\n2 4",
                "output": "1 4\n6 8",
                "explanation": "Merged intervals"
          },
          {
                "input": "1\n5 7",
                "output": "5 7",
                "explanation": "Single interval"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 5,
    patternName: "In-place LinkedList Reversal",
    title: "Pattern 5: Reverse Linked List",
    slug: "placement-pattern-5-reverse-linked-list",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["TCS Digital","Infosys SP","Deloitte"],
    frequency: "96% Placement Frequency",
    description: "Reverse singly linked list in-place.",
    input_format: "First line N.\nSecond line N values.",
    output_format: "Print space-separated reversed values.",
    constraints: "0 <= N <= 5000",
    sample_cases: [
          {
                "input": "5\n1 2 3 4 5",
                "output": "5 4 3 2 1",
                "explanation": "Reversed order"
          },
          {
                "input": "2\n1 2",
                "output": "2 1",
                "explanation": "Reversed order"
          },
          {
                "input": "1\n10",
                "output": "10",
                "explanation": "Single element"
          },
          {
                "input": "4\n-1 -2 -3 -4",
                "output": "-4 -3 -2 -1",
                "explanation": "Reversed negative elements"
          },
          {
                "input": "6\n5 10 15 20 25 30",
                "output": "30 25 20 15 10 5",
                "explanation": "Reversed order"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 6,
    patternName: "Tree BFS Pattern",
    title: "Pattern 6: Binary Tree Level Order Traversal",
    slug: "placement-pattern-6-tree-bfs",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Microsoft","Uber"],
    frequency: "93% Placement Frequency",
    description: "Perform level-order traversal on a Binary Tree using BFS.",
    input_format: "First line N.\nSecond line level-order node array (-1 for null).",
    output_format: "Print levels on separate lines.",
    constraints: "0 <= N <= 2000",
    sample_cases: [
          {
                "input": "7\n3 9 20 -1 -1 15 7",
                "output": "3\n9 20\n15 7",
                "explanation": "Level 0: 3, Level 1: 9 20, Level 2: 15 7"
          },
          {
                "input": "1\n1",
                "output": "1",
                "explanation": "Single root"
          },
          {
                "input": "3\n1 2 3",
                "output": "1\n2 3",
                "explanation": "Two levels"
          },
          {
                "input": "5\n1 -1 2 -1 3",
                "output": "1\n2\n3",
                "explanation": "Right-skewed tree"
          },
          {
                "input": "7\n10 5 15 3 7 12 18",
                "output": "10\n5 15\n3 7 12 18",
                "explanation": "Full tree"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 7,
    patternName: "Tree DFS Pattern",
    title: "Pattern 7: Root-to-Leaf Path Sum",
    slug: "placement-pattern-7-tree-dfs",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["Google","Meta","HCL"],
    frequency: "90% Placement Frequency",
    description: "Check if root-to-leaf path sums to target.",
    input_format: "First line N and S.\nSecond line N values.",
    output_format: "Print \"true\" or \"false\".",
    constraints: "1 <= N <= 5000",
    sample_cases: [
          {
                "input": "9 22\n5 4 8 11 -1 13 4 7 2",
                "output": "true",
                "explanation": "Path 5->4->11->2 sums to 22"
          },
          {
                "input": "3 5\n1 2 3",
                "output": "false",
                "explanation": "No path sums to 5"
          },
          {
                "input": "2 1\n1 2",
                "output": "false",
                "explanation": "Path sums to 3"
          },
          {
                "input": "1 10\n10",
                "output": "true",
                "explanation": "Single root"
          },
          {
                "input": "5 18\n10 5 15 3 -1",
                "output": "true",
                "explanation": "Path 10->5->3 sums to 18"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 8,
    patternName: "Two Heaps Pattern",
    title: "Pattern 8: Find Median from Data Stream",
    slug: "placement-pattern-8-two-heaps",
    subject: "ADA",
    difficulty: "Hard",
    companyTags: ["Google","Goldman Sachs","Amazon"],
    frequency: "88% Placement Frequency",
    description: "Find running median of data stream using two heaps.",
    input_format: "First line N.\nSecond line N stream values.",
    output_format: "Print running medians formatted to 1 decimal place.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2 3",
                "output": "1.0 1.5 2.0",
                "explanation": "Running medians"
          },
          {
                "input": "4\n5 15 1 3",
                "output": "5.0 10.0 5.0 4.0",
                "explanation": "Running medians"
          },
          {
                "input": "1\n42",
                "output": "42.0",
                "explanation": "Single element"
          },
          {
                "input": "5\n2 4 6 8 10",
                "output": "2.0 3.0 4.0 5.0 6.0",
                "explanation": "Sorted stream medians"
          },
          {
                "input": "4\n10 20 30 40",
                "output": "10.0 15.0 20.0 25.0",
                "explanation": "Even stream medians"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 9,
    patternName: "Subsets & Backtracking",
    title: "Pattern 9: Generate Power Set (Subsets)",
    slug: "placement-pattern-9-backtracking-subsets",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Adobe","Oracle"],
    frequency: "91% Placement Frequency",
    description: "Generate all subsets of a unique integer set.",
    input_format: "First line N.\nSecond line N values.",
    output_format: "Print each subset on new line as [e1, e2].",
    constraints: "1 <= N <= 15",
    sample_cases: [
          {
                "input": "3\n1 2 3",
                "output": "[]\n[1]\n[1 2]\n[1 2 3]\n[1 3]\n[2]\n[2 3]\n[3]",
                "explanation": "8 subsets"
          },
          {
                "input": "1\n0",
                "output": "[]\n[0]",
                "explanation": "2 subsets"
          },
          {
                "input": "2\n1 2",
                "output": "[]\n[1]\n[1 2]\n[2]",
                "explanation": "4 subsets"
          },
          {
                "input": "0\n",
                "output": "[]",
                "explanation": "Empty set"
          },
          {
                "input": "3\n5 10 15",
                "output": "[]\n[5]\n[5 10]\n[5 10 15]\n[5 15]\n[10]\n[10 15]\n[15]",
                "explanation": "8 subsets"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 10,
    patternName: "Modified Binary Search",
    title: "Pattern 10: Search in Rotated Sorted Array",
    slug: "placement-pattern-10-modified-binary-search",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Microsoft","Amazon","PayPal"],
    frequency: "97% Placement Frequency",
    description: "Search target in rotated sorted array in O(log N).",
    input_format: "First line N and K.\nSecond line N values.",
    output_format: "Print 0-based index or -1.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "7 0\n4 5 6 7 0 1 2",
                "output": "4",
                "explanation": "Index 4"
          },
          {
                "input": "7 3\n4 5 6 7 0 1 2",
                "output": "-1",
                "explanation": "Not found"
          },
          {
                "input": "1 0\n1",
                "output": "-1",
                "explanation": "Not found"
          },
          {
                "input": "5 2\n3 4 5 1 2",
                "output": "4",
                "explanation": "Index 4"
          },
          {
                "input": "6 5\n5 1 2 3 4",
                "output": "0",
                "explanation": "Index 0"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 11,
    patternName: "Top K Elements",
    title: "Pattern 11: Kth Largest Element in Array",
    slug: "placement-pattern-11-top-k-elements",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Facebook","Salesforce"],
    frequency: "95% Placement Frequency",
    description: "Find Kth largest element using Min-Heap in O(N log K).",
    input_format: "First line N and K.\nSecond line N values.",
    output_format: "Print Kth largest integer.",
    constraints: "1 <= K <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 2\n3 2 1 5 6 4",
                "output": "5",
                "explanation": "2nd largest is 5"
          },
          {
                "input": "9 4\n3 2 3 1 2 4 5 5 6",
                "output": "4",
                "explanation": "4th largest is 4"
          },
          {
                "input": "1 1\n10",
                "output": "10",
                "explanation": "Single element"
          },
          {
                "input": "5 5\n10 20 30 40 50",
                "output": "10",
                "explanation": "5th largest is 10"
          },
          {
                "input": "5 1\n10 20 30 40 50",
                "output": "50",
                "explanation": "1st largest is 50"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 12,
    patternName: "K-way Merge Pattern",
    title: "Pattern 12: Merge K Sorted Lists",
    slug: "placement-pattern-12-k-way-merge",
    subject: "ADA",
    difficulty: "Hard",
    companyTags: ["Google","Amazon","Uber"],
    frequency: "89% Placement Frequency",
    description: "Merge K sorted linked lists into one using Min-Priority Queue.",
    input_format: "First line K.\nNext K lines size M followed by M integers.",
    output_format: "Print space-separated merged list.",
    constraints: "0 <= K <= 10^4",
    sample_cases: [
          {
                "input": "3\n3 1 4 5\n3 1 3 4\n2 2 6",
                "output": "1 1 2 3 4 4 5 6",
                "explanation": "Merged 3 sorted lists"
          },
          {
                "input": "1\n4 1 2 3 4",
                "output": "1 2 3 4",
                "explanation": "Single sorted list"
          },
          {
                "input": "2\n2 5 10\n2 1 2",
                "output": "1 2 5 10",
                "explanation": "Merged two lists"
          },
          {
                "input": "3\n1 10\n1 20\n1 30",
                "output": "10 20 30",
                "explanation": "Merged 3 single-element lists"
          },
          {
                "input": "2\n3 -5 0 5\n3 -10 -2 8",
                "output": "-10 -5 -2 0 5 8",
                "explanation": "Merged negative values"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 13,
    patternName: "0/1 Knapsack (DP)",
    title: "Pattern 13: 0/1 Knapsack Optimization",
    slug: "placement-pattern-13-knapsack-dp",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["TCS Digital","Infosys SP","Amazon"],
    frequency: "96% Placement Frequency",
    description: "Find max value subset that fits in knapsack capacity W using DP.",
    input_format: "First line N and W.\nSecond line N values.\nThird line N weights.",
    output_format: "Print max achievable value.",
    constraints: "1 <= N, W <= 1000",
    sample_cases: [
          {
                "input": "3 50\n60 100 120\n10 20 30",
                "output": "220",
                "explanation": "Items 2 & 3: weight 50, val 220"
          },
          {
                "input": "4 7\n1 4 5 7\n1 3 4 5",
                "output": "9",
                "explanation": "Items with val 4 & 5 (weight 7, val 9)"
          },
          {
                "input": "1 10\n50\n5",
                "output": "50",
                "explanation": "Fits in knapsack"
          },
          {
                "input": "1 2\n50\n5",
                "output": "0",
                "explanation": "Exceeds capacity"
          },
          {
                "input": "3 10\n10 20 30\n1 2 3",
                "output": "60",
                "explanation": "All 3 items fit"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 14,
    patternName: "Longest Common Subsequence",
    title: "Pattern 14: LCS String Alignment",
    slug: "placement-pattern-14-lcs-dp",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Microsoft","Adobe","Cisco"],
    frequency: "93% Placement Frequency",
    description: "Find length of LCS between S1 and S2 using DP matrix.",
    input_format: "First line S1.\nSecond line S2.",
    output_format: "Print LCS integer length.",
    constraints: "1 <= |S1|, |S2| <= 1000",
    sample_cases: [
          {
                "input": "abcde\nace",
                "output": "3",
                "explanation": "LCS \"ace\" length 3"
          },
          {
                "input": "abc\nabc",
                "output": "3",
                "explanation": "Identical strings length 3"
          },
          {
                "input": "abc\ndef",
                "output": "0",
                "explanation": "No common characters"
          },
          {
                "input": "AGGTAB\nGXTXAYB",
                "output": "4",
                "explanation": "LCS \"GTAB\" length 4"
          },
          {
                "input": "AAAA\nAA",
                "output": "2",
                "explanation": "LCS \"AA\" length 2"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 15,
    patternName: "Topological Sort (Graph)",
    title: "Pattern 15: Course Schedule & Prerequisites",
    slug: "placement-pattern-15-topological-sort",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Google","Swiggy"],
    frequency: "92% Placement Frequency",
    description: "Check if possible to finish courses given prerequisite graph using Kahn's BFS.",
    input_format: "First line N and P.\nNext P lines u v.",
    output_format: "Print \"true\" or \"false\".",
    constraints: "1 <= N <= 2000",
    sample_cases: [
          {
                "input": "2 1\n1 0",
                "output": "true",
                "explanation": "Valid sequence"
          },
          {
                "input": "2 2\n1 0\n0 1",
                "output": "false",
                "explanation": "Cycle 1->0 & 0->1"
          },
          {
                "input": "4 3\n1 0\n2 1\n3 2",
                "output": "true",
                "explanation": "Chain 0->1->2->3"
          },
          {
                "input": "3 3\n0 1\n1 2\n2 0",
                "output": "false",
                "explanation": "3-node cycle"
          },
          {
                "input": "3 0",
                "output": "true",
                "explanation": "No prerequisites"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 16,
    patternName: "Monotonic Stack Pattern",
    title: "Pattern 16: Next Greater Element",
    slug: "placement-pattern-16-monotonic-stack",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Morgan Stanley","Paytm"],
    frequency: "91% Placement Frequency",
    description: "Find next greater element for each array position using Monotonic Decreasing Stack.",
    input_format: "First line N.\nSecond line N values.",
    output_format: "Print space-separated NGE values.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n4 5 2 25",
                "output": "5 25 25 -1",
                "explanation": "4->5, 5->25, 2->25, 25->-1"
          },
          {
                "input": "4\n13 7 6 12",
                "output": "-1 12 12 -1",
                "explanation": "Outputs -1 12 12 -1"
          },
          {
                "input": "4\n1 2 3 4",
                "output": "2 3 4 -1",
                "explanation": "Increasing sequence"
          },
          {
                "input": "4\n4 3 2 1",
                "output": "-1 -1 -1 -1",
                "explanation": "Decreasing sequence"
          },
          {
                "input": "1\n10",
                "output": "-1",
                "explanation": "Single element"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 17,
    patternName: "Prefix Sum Pattern",
    title: "Pattern 17: Subarray Sum Equals K",
    slug: "placement-pattern-17-prefix-sum",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Google","Facebook","Intuit"],
    frequency: "94% Placement Frequency",
    description: "Count continuous subarrays whose sum equals K using Prefix Sum + HashMap.",
    input_format: "First line N and K.\nSecond line N values.",
    output_format: "Print integer count.",
    constraints: "1 <= N <= 2 * 10^4",
    sample_cases: [
          {
                "input": "3 2\n1 1 1",
                "output": "2",
                "explanation": "Subarrays [1,1] at (0..1) & (1..2)"
          },
          {
                "input": "3 3\n1 2 3",
                "output": "2",
                "explanation": "[1,2] & [3]"
          },
          {
                "input": "4 0\n0 0 0 0",
                "output": "10",
                "explanation": "10 subarrays sum to 0"
          },
          {
                "input": "5 5\n1 -1 5 -5 5",
                "output": "4",
                "explanation": "4 subarrays sum to 5"
          },
          {
                "input": "2 1\n2 -1",
                "output": "1",
                "explanation": "[2,-1] sums to 1"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 18,
    patternName: "Matrix DFS/BFS Pattern",
    title: "Pattern 18: Number of Islands (Grid Traversal)",
    slug: "placement-pattern-18-matrix-dfs",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Amazon","Microsoft","Bloomberg"],
    frequency: "97% Placement Frequency",
    description: "Count total connected land islands (1s) in 2D grid using DFS/BFS.",
    input_format: "First line R and C.\nNext R lines C space-separated 0s and 1s.",
    output_format: "Print island count.",
    constraints: "1 <= R, C <= 300",
    sample_cases: [
          {
                "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
                "output": "1",
                "explanation": "1 big island"
          },
          {
                "input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
                "output": "3",
                "explanation": "3 separate islands"
          },
          {
                "input": "2 2\n0 0\n0 0",
                "output": "0",
                "explanation": "No islands"
          },
          {
                "input": "3 3\n1 0 1\n0 1 0\n1 0 1",
                "output": "5",
                "explanation": "5 single land cells"
          },
          {
                "input": "1 1\n1",
                "output": "1",
                "explanation": "1 island"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 19,
    patternName: "Trie Prefix Search",
    title: "Pattern 19: Implement Trie (Prefix Tree)",
    slug: "placement-pattern-19-trie-tree",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["Google","Twitter","Samsung"],
    frequency: "89% Placement Frequency",
    description: "Implement Trie with insert (1), search (2), and startsWith (3).",
    input_format: "First line Q.\nNext Q lines command (1, 2, or 3) and word.",
    output_format: "Print \"true\" or \"false\" for 2 and 3 queries.",
    constraints: "1 <= Q <= 1000",
    sample_cases: [
          {
                "input": "5\n1 apple\n2 apple\n2 app\n3 app\n1 app\n2 app",
                "output": "true\nfalse\ntrue\ntrue",
                "explanation": "Trie operations"
          },
          {
                "input": "3\n1 hello\n2 hello\n2 world",
                "output": "true\nfalse",
                "explanation": "Word queries"
          },
          {
                "input": "3\n1 tech\n3 te\n3 ta",
                "output": "true\nfalse",
                "explanation": "Prefix queries"
          },
          {
                "input": "2\n2 test\n3 test",
                "output": "false\nfalse",
                "explanation": "Empty Trie"
          },
          {
                "input": "4\n1 code\n1 coder\n2 code\n2 coder",
                "output": "true\ntrue",
                "explanation": "Nested words"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 20,
    patternName: "Bit Manipulation Pattern",
    title: "Pattern 20: Single Number (XOR Cancellation)",
    slug: "placement-pattern-20-bit-manipulation",
    subject: "ADA",
    difficulty: "Easy",
    companyTags: ["TCS","Infosys","Cognizant","Wipro"],
    frequency: "99% Placement Frequency",
    description: "Find non-duplicate integer in linear time using XOR cancellation.",
    input_format: "First line N.\nSecond line N values.",
    output_format: "Print non-repeating integer.",
    constraints: "1 <= N <= 30000",
    sample_cases: [
          {
                "input": "3\n2 2 1",
                "output": "1",
                "explanation": "2 XOR 2 XOR 1 = 1"
          },
          {
                "input": "5\n4 1 2 1 2",
                "output": "4",
                "explanation": "1 and 2 cancel out"
          },
          {
                "input": "1\n100",
                "output": "100",
                "explanation": "Single element"
          },
          {
                "input": "7\n9 3 5 3 9 7 5",
                "output": "7",
                "explanation": "Pairs cancel out"
          },
          {
                "input": "5\n-1 -1 -5 -2 -2",
                "output": "-5",
                "explanation": "Negative numbers cancel out"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const DBMS_PLACEMENT_PATTERNS = [
  {
    id: 101,
    patternName: "Subquery & Ranking",
    title: "DBMS Placement 1: Second Highest Salary in Department",
    slug: "placement-pattern-dbms-1-second-highest-salary",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Find 2nd highest salary among employees or NULL.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 A CS 60000\n2 B CS 75000\n3 C CS 50000\n4 D CS 75000",
                "output": "60000",
                "explanation": "Second distinct max"
          },
          {
                "input": "2\n1 X 50\n2 Y 50",
                "output": "NULL",
                "explanation": "No second distinct"
          },
          {
                "input": "1\n1 Z 10",
                "output": "NULL",
                "explanation": "Single element"
          },
          {
                "input": "3\n1 A 10\n2 B 20\n3 C 30",
                "output": "20",
                "explanation": "2nd max is 20"
          },
          {
                "input": "4\n1 P 10\n2 Q 40\n3 R 30\n4 S 20",
                "output": "30",
                "explanation": "2nd max is 30"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 102,
    patternName: "Group By & Having",
    title: "DBMS Placement 2: Duplicate Email Identification",
    slug: "placement-pattern-dbms-2-duplicate-emails",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Find duplicate emails appearing > 1 times.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 a@b.com\n2 c@d.com\n3 a@b.com",
                "output": "a@b.com",
                "explanation": "Duplicates"
          },
          {
                "input": "2\n1 x@y.com\n2 z@w.com",
                "output": "None",
                "explanation": "All unique"
          },
          {
                "input": "4\n1 a@com\n2 a@com\n3 b@com\n4 b@com",
                "output": "a@com\nb@com",
                "explanation": "Both"
          },
          {
                "input": "1\n1 single@com",
                "output": "None",
                "explanation": "Single"
          },
          {
                "input": "3\n1 e1@com\n2 e2@com\n3 e1@com",
                "output": "e1@com",
                "explanation": "e1@com duplicated"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 103,
    patternName: "Left Join & Anti-Join",
    title: "DBMS Placement 3: Customers Who Never Order",
    slug: "placement-pattern-dbms-3-customers-never-order",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Find customers with 0 orders.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 2\n1 Joe\n2 Henry\n3 Sam\n4 Max\n101 3\n102 1",
                "output": "Henry\nMax",
                "explanation": "Henry & Max have 0 orders"
          },
          {
                "input": "2 2\n1 A\n2 B\n10 1\n11 2",
                "output": "None",
                "explanation": "All ordered"
          },
          {
                "input": "1 0\n1 Single",
                "output": "Single",
                "explanation": "0 orders"
          },
          {
                "input": "3 1\n1 C1\n2 C2\n3 C3\n100 2",
                "output": "C1\nC3",
                "explanation": "C1 & C3 no orders"
          },
          {
                "input": "2 1\n10 X\n20 Y\n1 10",
                "output": "Y",
                "explanation": "Y zero orders"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 104,
    patternName: "Self Join",
    title: "DBMS Placement 4: Employees Earning More Than Their Managers",
    slug: "placement-pattern-dbms-4-emp-more-than-mgr",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Find employees whose salary is strictly higher than their manager's salary.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 Joe 70000 3\n2 Henry 80000 4\n3 Sam 60000 null\n4 Max 90000 null",
                "output": "Joe",
                "explanation": "Joe earns 70000 > Sam (60000)"
          },
          {
                "input": "2\n1 A 50000 2\n2 B 60000 null",
                "output": "None",
                "explanation": "Manager B earns more"
          },
          {
                "input": "1\n1 Boss 100000 null",
                "output": "None",
                "explanation": "No manager"
          },
          {
                "input": "3\n1 Emp 90000 2\n2 Mgr 50000 null\n3 Emp2 40000 2",
                "output": "Emp",
                "explanation": "Emp earns 90000 > Mgr 50000"
          },
          {
                "input": "2\n1 E 50 2\n2 M 50 null",
                "output": "None",
                "explanation": "Equal salaries"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 105,
    patternName: "Window DENSE_RANK",
    title: "DBMS Placement 5: Rank Scores without Gaps",
    slug: "placement-pattern-dbms-5-rank-scores",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Rank scores descending using DENSE_RANK.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n3.50\n3.65\n4.00\n3.85\n4.00\n3.65",
                "output": "4.00 1\n4.00 1\n3.85 2\n3.65 3\n3.65 3\n3.50 4",
                "explanation": "DENSE_RANK ordering"
          },
          {
                "input": "2\n100\n100",
                "output": "100 1\n100 1",
                "explanation": "Tied 1st rank"
          },
          {
                "input": "1\n50",
                "output": "50 1",
                "explanation": "Single score rank 1"
          },
          {
                "input": "3\n90\n80\n70",
                "output": "90 1\n80 2\n70 3",
                "explanation": "Ranks 1 2 3"
          },
          {
                "input": "4\n5 5 4 3",
                "output": "5 1\n5 1\n4 2\n3 3",
                "explanation": "Dense ranks"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 106,
    patternName: "Lead & Lag Pattern",
    title: "DBMS Placement 6: Consecutive Numbers appearing 3 Times",
    slug: "placement-pattern-dbms-6-consecutive-numbers",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Find all numbers that appear at least three times consecutively.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "7\n1\n1\n1\n2\n1\n2\n2",
                "output": "1",
                "explanation": "1 appears 3 times consecutively"
          },
          {
                "input": "3\n5\n5\n5",
                "output": "5",
                "explanation": "5 appears 3 times"
          },
          {
                "input": "2\n1\n1",
                "output": "None",
                "explanation": "Only twice"
          },
          {
                "input": "6\n2\n2\n2\n3\n3\n3",
                "output": "2\n3",
                "explanation": "Both 2 and 3"
          },
          {
                "input": "4\n1\n2\n1\n2",
                "output": "None",
                "explanation": "Alternating numbers"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 107,
    patternName: "DELETE & Self-Join",
    title: "DBMS Placement 7: Delete Duplicate Email Records keeping Min ID",
    slug: "placement-pattern-dbms-7-delete-duplicate-emails",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Delete all duplicate emails keeping only the smallest ID.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 john@x.com\n2 bob@y.com\n3 john@x.com",
                "output": "1 john@x.com\n2 bob@y.com",
                "explanation": "ID 3 deleted"
          },
          {
                "input": "2\n1 a@b.com\n2 c@d.com",
                "output": "1 a@b.com\n2 c@d.com",
                "explanation": "No duplicates"
          },
          {
                "input": "3\n1 x@y.com\n2 x@y.com\n3 x@y.com",
                "output": "1 x@y.com",
                "explanation": "IDs 2,3 deleted"
          },
          {
                "input": "1\n1 single@c.com",
                "output": "1 single@c.com",
                "explanation": "Single record"
          },
          {
                "input": "4\n1 a@c.com\n2 b@c.com\n3 a@c.com\n4 b@c.com",
                "output": "1 a@c.com\n2 b@c.com",
                "explanation": "Keep min IDs 1 and 2"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 108,
    patternName: "Date Comparison Pattern",
    title: "DBMS Placement 8: Rising Temperature Days",
    slug: "placement-pattern-dbms-8-rising-temperature",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find IDs with higher temperature compared to previous day.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 2015-01-01 10\n2 2015-01-02 25\n3 2015-01-03 20\n4 2015-01-04 30",
                "output": "2\n4",
                "explanation": "Day 2 temp 25>10, Day 4 temp 30>20"
          },
          {
                "input": "2\n1 2020-01-01 30\n2 2020-01-02 20",
                "output": "None",
                "explanation": "Temp decreased"
          },
          {
                "input": "1\n1 2020-01-01 15",
                "output": "None",
                "explanation": "No previous day"
          },
          {
                "input": "3\n1 2021-05-01 15\n2 2021-05-02 18\n3 2021-05-03 22",
                "output": "2\n3",
                "explanation": "Rising on day 2 and day 3"
          },
          {
                "input": "2\n1 2021-06-01 10\n2 2021-06-02 10",
                "output": "None",
                "explanation": "Equal temp"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 109,
    patternName: "Correlated Subquery",
    title: "DBMS Placement 9: Department Highest Salary",
    slug: "placement-pattern-dbms-9-dept-highest-salary",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Find employee who has highest salary in each department.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 Joe 70000 IT\n2 Jim 90000 IT\n3 Henry 80000 Sales\n4 Sam 60000 Sales",
                "output": "IT Jim 90000\nSales Henry 80000",
                "explanation": "Highest salary per dept"
          },
          {
                "input": "2\n1 A 50000 CS\n2 B 50000 CS",
                "output": "CS A 50000\nCS B 50000",
                "explanation": "Tied max salaries"
          },
          {
                "input": "1\n1 Single 10000 ECE",
                "output": "ECE Single 10000",
                "explanation": "Single dept"
          },
          {
                "input": "3\n1 X 10 Mech\n2 Y 20 Mech\n3 Z 30 Mech",
                "output": "Mech Z 30",
                "explanation": "Max Mech is Z 30"
          },
          {
                "input": "2\n1 P 100 A\n2 Q 200 B",
                "output": "A P 100\nB Q 200",
                "explanation": "Highest in each"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 110,
    patternName: "Top K per Group",
    title: "DBMS Placement 10: Department Top 3 Salaries",
    slug: "placement-pattern-dbms-10-dept-top-3-salaries",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Find top 3 unique high earners in each department.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "7\n1 Joe 85000 IT\n2 Henry 80000 IT\n3 Sam 60000 IT\n4 Max 90000 IT\n5 Janet 69000 IT\n6 Randy 85000 IT\n7 Will 70000 Sales",
                "output": "IT Max 90000\nIT Joe 85000\nIT Randy 85000\nIT Henry 80000\nSales Will 70000",
                "explanation": "Top 3 distinct salaries per dept"
          },
          {
                "input": "2\n1 A 10 CS\n2 B 20 CS",
                "output": "CS B 20\nCS A 10",
                "explanation": "Both fit in top 3"
          },
          {
                "input": "1\n1 X 50 ECE",
                "output": "ECE X 50",
                "explanation": "Top 1"
          },
          {
                "input": "4\n1 P 100 D1\n2 Q 90 D1\n3 R 80 D1\n4 S 70 D1",
                "output": "D1 P 100\nD1 Q 90\nD1 R 80",
                "explanation": "Top 3 distinct"
          },
          {
                "input": "3\n1 M 50 D2\n2 N 50 D2\n3 O 50 D2",
                "output": "D2 M 50\nD2 N 50\nD2 O 50",
                "explanation": "Tied max"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 111,
    patternName: "String Transformation",
    title: "DBMS Placement 11: Fix Names in Users Table (Capitalize First Letter)",
    slug: "placement-pattern-dbms-11-fix-names-capitalize",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Format name so only first character is uppercase and rest lowercase.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2\n1 aLice\n2 bOB",
                "output": "1 Alice\n2 Bob",
                "explanation": "Capitalized names"
          },
          {
                "input": "1\n1 mIxEd",
                "output": "1 Mixed",
                "explanation": "Capitalized"
          },
          {
                "input": "3\n1 john\n2 JANE\n3 dAvId",
                "output": "1 John\n2 Jane\n3 David",
                "explanation": "Formatted"
          },
          {
                "input": "1\n1 z",
                "output": "1 Z",
                "explanation": "Single character capitalized"
          },
          {
                "input": "2\n1 ALICE\n2 BOB",
                "output": "1 Alice\n2 Bob",
                "explanation": "Upper to Proper Case"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 112,
    patternName: "Regex Matching",
    title: "DBMS Placement 12: Patients With a Condition (DIAB1 Keyword)",
    slug: "placement-pattern-dbms-12-patients-with-condition",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Find patient IDs and names where conditions contain prefix DIAB1.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\n1 Daniel YNOT\n2 Alice ACNE DIAB100\n3 Bob DIAB101\n4 George ACNE\n5 Alain DIAB201",
                "output": "2 Alice ACNE DIAB100\n3 Bob DIAB101",
                "explanation": "Contains DIAB1"
          },
          {
                "input": "2\n1 X SICK\n2 Y DIAB200",
                "output": "None",
                "explanation": "No DIAB1 prefix"
          },
          {
                "input": "1\n1 Z DIAB1",
                "output": "1 Z DIAB1",
                "explanation": "Exact DIAB1 match"
          },
          {
                "input": "3\n1 A DIAB10\n2 B NOT_DIAB1\n3 C FEVER DIAB105",
                "output": "1 A DIAB10\n3 C FEVER DIAB105",
                "explanation": "DIAB1 prefix matches"
          },
          {
                "input": "1\n1 Single COUGH",
                "output": "None",
                "explanation": "No match"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 113,
    patternName: "UNPIVOT & UNION",
    title: "DBMS Placement 13: Rearrange Products Table (Store Prices)",
    slug: "placement-pattern-dbms-13-rearrange-products-unpivot",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Transform columns store1, store2, store3 into rows (product_id, store, price).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2\n0 95 100 null\n1 70 null 80",
                "output": "0 store1 95\n0 store2 100\n1 store1 70\n1 store3 80",
                "explanation": "Unpivoted non-null prices"
          },
          {
                "input": "1\n5 10 20 30",
                "output": "5 store1 10\n5 store2 20\n5 store3 30",
                "explanation": "All stores unpivoted"
          },
          {
                "input": "1\n1 null null null",
                "output": "None",
                "explanation": "All prices null"
          },
          {
                "input": "2\n1 5 null null\n2 null 15 null",
                "output": "1 store1 5\n2 store2 15",
                "explanation": "Single store per product"
          },
          {
                "input": "1\n10 100 null 200",
                "output": "10 store1 100\n10 store3 200",
                "explanation": "Unpivoted 2 stores"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 114,
    patternName: "String Aggregation",
    title: "DBMS Placement 14: Group Sold Products By Date",
    slug: "placement-pattern-dbms-14-group-sold-products-date",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Find for each date the number of distinct products sold and their names sorted alphabetically.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n2020-05-30 Headphone\n2020-05-30 Pencil\n2020-05-30 Basketball\n2020-06-01 Bible\n2020-06-02 Mask\n2020-05-30 Basketball",
                "output": "2020-05-30 3 Basketball,Headphone,Pencil\n2020-06-01 1 Bible\n2020-06-02 1 Mask",
                "explanation": "Aggregated distinct products per date"
          },
          {
                "input": "2\n2020-01-01 A\n2020-01-01 B",
                "output": "2020-01-01 2 A,B",
                "explanation": "Sorted comma-separated list"
          },
          {
                "input": "1\n2020-01-01 SingleItem",
                "output": "2020-01-01 1 SingleItem",
                "explanation": "Single product"
          },
          {
                "input": "3\n2021-01-01 X\n2021-01-01 Y\n2021-01-01 Z",
                "output": "2021-01-01 3 X,Y,Z",
                "explanation": "3 products grouped"
          },
          {
                "input": "2\n2022-02-02 P\n2022-02-02 P",
                "output": "2022-02-02 1 P",
                "explanation": "Deduplicated products count"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 115,
    patternName: "Conditional Aggregation",
    title: "DBMS Placement 15: Count Salary Categories (Low, Average, High)",
    slug: "placement-pattern-dbms-15-count-salary-categories",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Categorize salaries: Low (<20000), Average (20000-50000), High (>50000).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 15000\n2 20000\n3 30000\n4 60000",
                "output": "Low Salary 1\nAverage Salary 2\nHigh Salary 1",
                "explanation": "Categorized count"
          },
          {
                "input": "1\n1 70000",
                "output": "Low Salary 0\nAverage Salary 0\nHigh Salary 1",
                "explanation": "Only High category"
          },
          {
                "input": "2\n1 5000\n2 10000",
                "output": "Low Salary 2\nAverage Salary 0\nHigh Salary 0",
                "explanation": "Only Low category"
          },
          {
                "input": "3\n1 25000\n2 35000\n3 45000",
                "output": "Low Salary 0\nAverage Salary 3\nHigh Salary 0",
                "explanation": "Only Average category"
          },
          {
                "input": "0",
                "output": "Low Salary 0\nAverage Salary 0\nHigh Salary 0",
                "explanation": "Empty inputs return 0 counts"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 116,
    patternName: "NULL Value Handling",
    title: "DBMS Placement 16: Find Customer Referee (Not Equal 2)",
    slug: "placement-pattern-dbms-16-find-customer-referee",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Find names of customers not referred by customer_id = 2 (including NULL).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n1 Will null\n2 Jane null\n3 Alex 2\n4 Bill null\n5 Zack 1\n6 Mark 2",
                "output": "Will\nJane\nBill\nZack",
                "explanation": "Excludes Alex and Mark (referee 2)"
          },
          {
                "input": "2\n1 A 2\n2 B 2",
                "output": "None",
                "explanation": "All referred by 2"
          },
          {
                "input": "1\n1 C null",
                "output": "C",
                "explanation": "NULL referee included"
          },
          {
                "input": "3\n1 X 1\n2 Y 2\n3 Z 3",
                "output": "X\nZ",
                "explanation": "Includes 1 and 3"
          },
          {
                "input": "2\n1 P null\n2 Q 5",
                "output": "P\nQ",
                "explanation": "Includes both"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 117,
    patternName: "Multi-attribute Filter",
    title: "DBMS Placement 17: Big Countries (Area >= 3M or Pop >= 25M)",
    slug: "placement-pattern-dbms-17-big-countries-filter",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Select name, population, area of countries with area >= 3,000,000 OR population >= 25,000,000.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\nAfghanistan 31889212 652230\nAlbania 2873757 28748\nAlgeria 37100000 2381741\nAndorra 78115 468\nAngola 20609294 1246700",
                "output": "Afghanistan 31889212 652230",
                "explanation": "Pop >= 25M"
          },
          {
                "input": "1\nCanada 37600000 9984670",
                "output": "Canada 37600000 9984670",
                "explanation": "Both area and pop match"
          },
          {
                "input": "1\nSmall 1000 100",
                "output": "None",
                "explanation": "Neither matches"
          },
          {
                "input": "2\nIndia 1300000000 3287263\nMonaco 38000 2",
                "output": "India 1300000000 3287263",
                "explanation": "Matches both"
          },
          {
                "input": "1\nGiantLand 1000000 5000000",
                "output": "GiantLand 1000000 5000000",
                "explanation": "Area >= 3M matches"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 118,
    patternName: "CASE WHEN Update",
    title: "DBMS Placement 18: Swap Salary Sex Column (m to f and vice versa)",
    slug: "placement-pattern-dbms-18-swap-sex-column",
    subject: "DBMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Swap all 'f' and 'm' values in a single UPDATE statement.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 A m 2500\n2 B f 1500\n3 C m 5500\n4 D f 500",
                "output": "1 A f 2500\n2 B m 1500\n3 C f 5500\n4 D m 500",
                "explanation": "All sexes swapped"
          },
          {
                "input": "1\n1 Single m 100",
                "output": "1 Single f 100",
                "explanation": "m swapped to f"
          },
          {
                "input": "2\n1 X f 20\n2 Y f 30",
                "output": "1 X m 20\n2 Y m 30",
                "explanation": "f swapped to m"
          },
          {
                "input": "2\n1 P m 10\n2 Q m 20",
                "output": "1 P f 10\n2 Q f 20",
                "explanation": "m swapped to f"
          },
          {
                "input": "3\n1 A f 1\n2 B m 2\n3 C f 3",
                "output": "1 A m 1\n2 B f 2\n3 C m 3",
                "explanation": "Swapped all records"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 119,
    patternName: "COUNT GROUP BY HAVING",
    title: "DBMS Placement 19: Actors and Directors Who Cooperated At Least 3 Times",
    slug: "placement-pattern-dbms-19-actor-director-cooperation",
    subject: "DBMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Find actor_id and director_id pairs who worked together >= 3 times.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n1 1 0\n1 1 1\n1 1 2\n1 2 3\n1 2 4\n2 1 5",
                "output": "1 1",
                "explanation": "Actor 1 & Director 1 cooperated 3 times"
          },
          {
                "input": "2\n1 1 0\n1 1 1",
                "output": "None",
                "explanation": "Cooperated twice"
          },
          {
                "input": "3\n2 2 1\n2 2 2\n2 2 3",
                "output": "2 2",
                "explanation": "Cooperated 3 times"
          },
          {
                "input": "4\n5 5 1\n5 5 2\n5 5 3\n5 5 4",
                "output": "5 5",
                "explanation": "Cooperated 4 times"
          },
          {
                "input": "3\n1 2 1\n2 3 1\n3 4 1",
                "output": "None",
                "explanation": "No pair >= 3"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 120,
    patternName: "Date Substring Grouping",
    title: "DBMS Placement 20: User Activity for the Past 30 Days",
    slug: "placement-pattern-dbms-20-user-activity-30-days",
    subject: "DBMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Count active users daily for period ending 2019-07-27 (30 days prior).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n1 1 2019-07-20 open_session\n1 1 2019-07-20 send_message\n2 2 2019-07-20 open_session\n3 3 2019-06-25 open_session\n4 4 2019-06-24 open_session\n3 3 2019-07-21 end_session",
                "output": "2019-07-20 2\n2019-07-21 1",
                "explanation": "Daily active user counts in date range"
          },
          {
                "input": "1\n1 1 2019-07-10 open_session",
                "output": "2019-07-10 1",
                "explanation": "1 active user"
          },
          {
                "input": "1\n1 1 2019-05-01 open_session",
                "output": "None",
                "explanation": "Outside 30 day window"
          },
          {
                "input": "3\n1 1 2019-07-01 open\n2 2 2019-07-01 open\n3 3 2019-07-01 open",
                "output": "2019-07-01 3",
                "explanation": "3 users active"
          },
          {
                "input": "2\n1 1 2019-07-27 open\n1 1 2019-07-27 close",
                "output": "2019-07-27 1",
                "explanation": "Single distinct user"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const JAVA_PLACEMENT_PATTERNS = [
  {
    id: 201,
    patternName: "HashMap Frequency",
    title: "JAVA Placement 1: First Non-Repeating Character in String",
    slug: "placement-pattern-java-1-first-non-repeating-char",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Find index of first non-repeating character in string.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "leetcode",
                "output": "0",
                "explanation": "'l' at index 0"
          },
          {
                "input": "loveleetcode",
                "output": "2",
                "explanation": "'v' at index 2"
          },
          {
                "input": "aabb",
                "output": "-1",
                "explanation": "All repeat"
          },
          {
                "input": "z",
                "output": "0",
                "explanation": "Single character"
          },
          {
                "input": "abacabad",
                "output": "7",
                "explanation": "'d' at index 7"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 202,
    patternName: "Sliding Window Map",
    title: "JAVA Placement 2: Longest Substring Without Repeating Characters",
    slug: "placement-pattern-java-2-longest-substring-non-repeating",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Find length of longest unique character substring.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "abcabcbb",
                "output": "3",
                "explanation": "\"abc\""
          },
          {
                "input": "bbbbb",
                "output": "1",
                "explanation": "\"b\""
          },
          {
                "input": "pwwkew",
                "output": "3",
                "explanation": "\"wke\""
          },
          {
                "input": "",
                "output": "0",
                "explanation": "Empty"
          },
          {
                "input": "au",
                "output": "2",
                "explanation": "\"au\""
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 203,
    patternName: "Sorting / Hash Map",
    title: "JAVA Placement 3: Valid Anagram Check",
    slug: "placement-pattern-java-3-valid-anagram",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Determine if two strings are anagrams of each other.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "anagram\nagaram",
                "output": "true",
                "explanation": "Anagrams"
          },
          {
                "input": "rat\ncar",
                "output": "false",
                "explanation": "Not anagrams"
          },
          {
                "input": "a\na",
                "output": "true",
                "explanation": "Identical"
          },
          {
                "input": "ab\nba",
                "output": "true",
                "explanation": "Anagrams"
          },
          {
                "input": "abc\nabcd",
                "output": "false",
                "explanation": "Length mismatch"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 204,
    patternName: "Group Anagrams",
    title: "JAVA Placement 4: Group Anagram Strings Together",
    slug: "placement-pattern-java-4-group-anagrams",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Group an array of strings into sublists of anagrams.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\neat tea tan ate nat bat",
                "output": "[bat]\n[eat ate tea]\n[nat tan]",
                "explanation": "Grouped anagrams"
          },
          {
                "input": "1\na",
                "output": "[a]",
                "explanation": "Single word"
          },
          {
                "input": "2\nab ba",
                "output": "[ab ba]",
                "explanation": "Pair anagrams"
          },
          {
                "input": "3\na b c",
                "output": "[a]\n[b]\n[c]",
                "explanation": "All distinct"
          },
          {
                "input": "4\nlisten silent enlists google",
                "output": "[google]\n[listen silent]",
                "explanation": "Anagram sets"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 205,
    patternName: "HashMap Lookup",
    title: "JAVA Placement 5: Two Sum Problem (Unsorted Array)",
    slug: "placement-pattern-java-5-two-sum-hashmap",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Find indices of two numbers that add up to target using HashMap.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 9\n2 7 11 15",
                "output": "0 1",
                "explanation": "2 + 7 = 9"
          },
          {
                "input": "3 6\n3 2 4",
                "output": "1 2",
                "explanation": "2 + 4 = 6"
          },
          {
                "input": "2 6\n3 3",
                "output": "0 1",
                "explanation": "3 + 3 = 6"
          },
          {
                "input": "5 10\n1 5 3 7 9",
                "output": "2 3",
                "explanation": "3 + 7 = 10"
          },
          {
                "input": "4 0\n-3 4 3 9",
                "output": "0 2",
                "explanation": "-3 + 3 = 0"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 206,
    patternName: "Two Pointers String",
    title: "JAVA Placement 6: Reverse Words in a String",
    slug: "placement-pattern-java-6-reverse-words-string",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Reverse the order of words in a space-separated string.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "the sky is blue",
                "output": "blue is sky the",
                "explanation": "Reversed word order"
          },
          {
                "input": "  hello world  ",
                "output": "world hello",
                "explanation": "Trim extra spaces"
          },
          {
                "input": "a good   example",
                "output": "example good a",
                "explanation": "Multi space handling"
          },
          {
                "input": "Single",
                "output": "Single",
                "explanation": "Single word"
          },
          {
                "input": "  a  b  ",
                "output": "b a",
                "explanation": "Trimmed reversed"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 207,
    patternName: "Fast & Slow Pointers",
    title: "JAVA Placement 7: Palindrome Linked List Check",
    slug: "placement-pattern-java-7-palindrome-linked-list",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Check if a singly linked list is a palindrome in O(N) time & O(1) space.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 2 2 1",
                "output": "true",
                "explanation": "Palindrome"
          },
          {
                "input": "2\n1 2",
                "output": "false",
                "explanation": "Not palindrome"
          },
          {
                "input": "1\n9",
                "output": "true",
                "explanation": "Single element"
          },
          {
                "input": "5\n1 2 3 2 1",
                "output": "true",
                "explanation": "Odd length palindrome"
          },
          {
                "input": "3\n1 2 3",
                "output": "false",
                "explanation": "Not palindrome"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 208,
    patternName: "Two Pointers List",
    title: "JAVA Placement 8: Intersection Node of Two Linked Lists",
    slug: "placement-pattern-java-8-intersection-linked-lists",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find node value at which two linked lists intersect, or -1.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5 6 2\n4 1 8 4 5\n5 6 1 8 4 5",
                "output": "8",
                "explanation": "Intersect at node 8"
          },
          {
                "input": "3 2 0\n1 9 1\n3 1",
                "output": "1",
                "explanation": "Intersect at node 1"
          },
          {
                "input": "2 2 -1\n2 6 4\n1 5",
                "output": "-1",
                "explanation": "No intersection"
          },
          {
                "input": "1 1 0\n10\n10",
                "output": "10",
                "explanation": "Identical lists"
          },
          {
                "input": "4 3 1\n1 2 3 4\n5 2 3 4",
                "output": "2",
                "explanation": "Intersect at 2"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 209,
    patternName: "Stack Pattern",
    title: "JAVA Placement 9: Valid Parentheses Matching",
    slug: "placement-pattern-java-9-valid-parentheses",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Determine if string with brackets (), {}, [] is valid using Stack.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "()",
                "output": "true",
                "explanation": "Valid"
          },
          {
                "input": "()[]{}",
                "output": "true",
                "explanation": "Valid"
          },
          {
                "input": "(]",
                "output": "false",
                "explanation": "Mismatch"
          },
          {
                "input": "([)]",
                "output": "false",
                "explanation": "Invalid order"
          },
          {
                "input": "{[]}",
                "output": "true",
                "explanation": "Nested valid"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 210,
    patternName: "Stack Data Structure",
    title: "JAVA Placement 10: Min Stack Design",
    slug: "placement-pattern-java-10-min-stack-design",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Design stack supporting push, pop, top, getMin in O(1) time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin",
                "output": "-3\n0\n-2",
                "explanation": "Min stack outputs"
          },
          {
                "input": "3\npush 5\ngetMin\ntop",
                "output": "5\n5",
                "explanation": "Single element stack"
          },
          {
                "input": "4\npush 10\npush 20\ngetMin\ntop",
                "output": "10\n20",
                "explanation": "Min and top"
          },
          {
                "input": "2\npush 1\ngetMin",
                "output": "1",
                "explanation": "Min query"
          },
          {
                "input": "4\npush 2\npush 2\ngetMin\npop",
                "output": "2",
                "explanation": "Duplicate min values"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 211,
    patternName: "Queue & Stack",
    title: "JAVA Placement 11: Implement Queue using Two Stacks",
    slug: "placement-pattern-java-11-queue-using-stacks",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Implement FIFO queue using two stacks.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\npush 1\npush 2\npeek\npop\nempty",
                "output": "1\n1\nfalse",
                "explanation": "FIFO queue behavior"
          },
          {
                "input": "3\npush 10\npop\nempty",
                "output": "10\ntrue",
                "explanation": "Queue emptied"
          },
          {
                "input": "4\npush 5\npush 15\npeek\npop",
                "output": "5\n5",
                "explanation": "Peek and pop"
          },
          {
                "input": "2\npush 1\npeek",
                "output": "1",
                "explanation": "Peek top"
          },
          {
                "input": "4\npush 1\npush 2\npop\npop",
                "output": "1\n2",
                "explanation": "Sequential pop"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 212,
    patternName: "PriorityQueue / Heap",
    title: "JAVA Placement 12: Top K Frequent Elements",
    slug: "placement-pattern-java-12-top-k-frequent-elements",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Return K most frequent elements using HashMap and PriorityQueue.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 2\n1 1 1 2 2 3",
                "output": "1 2",
                "explanation": "1 (count 3) & 2 (count 2)"
          },
          {
                "input": "1 1\n1",
                "output": "1",
                "explanation": "Single element"
          },
          {
                "input": "4 2\n4 4 4 6",
                "output": "4 6",
                "explanation": "Top 2 frequent"
          },
          {
                "input": "5 3\n1 2 2 3 3 3",
                "output": "3 2 1",
                "explanation": "Top 3 frequent"
          },
          {
                "input": "3 1\n10 20 30",
                "output": "10",
                "explanation": "Any top 1"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 213,
    patternName: "Three Pointers",
    title: "JAVA Placement 13: Sort Colors (Dutch National Flag Algorithm)",
    slug: "placement-pattern-java-13-sort-colors-dutch-flag",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Sort array of 0s, 1s, 2s in-place in linear O(N) time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n2 0 2 1 1 0",
                "output": "0 0 1 1 2 2",
                "explanation": "Sorted 0s 1s 2s"
          },
          {
                "input": "3\n2 0 1",
                "output": "0 1 2",
                "explanation": "Sorted"
          },
          {
                "input": "1\n0",
                "output": "0",
                "explanation": "Single element"
          },
          {
                "input": "4\n1 1 0 2",
                "output": "0 1 1 2",
                "explanation": "Sorted"
          },
          {
                "input": "5\n2 2 1 1 0",
                "output": "0 1 1 2 2",
                "explanation": "Sorted"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 214,
    patternName: "Prefix Sum Map",
    title: "JAVA Placement 14: Subarray Sum Equals K Count",
    slug: "placement-pattern-java-14-subarray-sum-equals-k-java",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Count total subarrays with sum K using Map.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 2\n1 1 1",
                "output": "2",
                "explanation": "[1,1] at (0..1) & (1..2)"
          },
          {
                "input": "3 3\n1 2 3",
                "output": "2",
                "explanation": "[1,2] & [3]"
          },
          {
                "input": "4 0\n0 0 0 0",
                "output": "10",
                "explanation": "All subarrays"
          },
          {
                "input": "5 5\n1 -1 5 -5 5",
                "output": "4",
                "explanation": "Subarrays summing to 5"
          },
          {
                "input": "2 1\n2 -1",
                "output": "1",
                "explanation": "Subarray sum 1"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 215,
    patternName: "Tree Inorder Stack",
    title: "JAVA Placement 15: Binary Tree Inorder Traversal (Iterative)",
    slug: "placement-pattern-java-15-binary-tree-inorder-iterative",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Return inorder traversal of binary tree node values.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 -1 2 3",
                "output": "1 3 2",
                "explanation": "Inorder 1->3->2"
          },
          {
                "input": "0",
                "output": "",
                "explanation": "Empty tree"
          },
          {
                "input": "1\n1",
                "output": "1",
                "explanation": "Root only"
          },
          {
                "input": "3\n1 2 3",
                "output": "2 1 3",
                "explanation": "Left Root Right"
          },
          {
                "input": "4\n1 2 -1 4",
                "output": "4 2 1",
                "explanation": "Left-skewed tree"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 216,
    patternName: "BST Property Search",
    title: "JAVA Placement 16: Lowest Common Ancestor in BST",
    slug: "placement-pattern-java-16-lca-binary-search-tree",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Find LCA node of two nodes p and q in Binary Search Tree.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 2 8\n6 2 8 0 4 7 9",
                "output": "6",
                "explanation": "LCA of 2 & 8 is 6"
          },
          {
                "input": "6 2 4\n6 2 8 0 4 7 9",
                "output": "2",
                "explanation": "LCA of 2 & 4 is 2"
          },
          {
                "input": "2 1 2\n2 1",
                "output": "2",
                "explanation": "Root is LCA"
          },
          {
                "input": "5 3 5\n5 3 8 2 4",
                "output": "5",
                "explanation": "Root is LCA"
          },
          {
                "input": "3 2 3\n3 2 4",
                "output": "3",
                "explanation": "LCA node 3"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 217,
    patternName: "Two Pointers String",
    title: "JAVA Placement 17: String Compression in-place",
    slug: "placement-pattern-java-17-string-compression-inplace",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Compress consecutive duplicate characters using count numbers.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "aabbccc",
                "output": "a2b2c3",
                "explanation": "Compressed string"
          },
          {
                "input": "a",
                "output": "a",
                "explanation": "Single character no digit"
          },
          {
                "input": "abbbbbbbbbbbb",
                "output": "ab12",
                "explanation": "Count >= 10 handled"
          },
          {
                "input": "abcd",
                "output": "abcd",
                "explanation": "No duplicates"
          },
          {
                "input": "zzz",
                "output": "z3",
                "explanation": "Compressed z3"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 218,
    patternName: "Array Index Marking",
    title: "JAVA Placement 18: Find All Duplicates in an Array",
    slug: "placement-pattern-java-18-find-all-duplicates-array",
    subject: "JAVA",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find all elements appearing twice in O(N) time and O(1) space.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "8\n4 3 2 7 8 2 3 1",
                "output": "2 3",
                "explanation": "Duplicates 2 and 3"
          },
          {
                "input": "3\n1 1 2",
                "output": "1",
                "explanation": "Duplicate 1"
          },
          {
                "input": "1\n1",
                "output": "",
                "explanation": "No duplicate"
          },
          {
                "input": "4\n2 2 3 3",
                "output": "2 3",
                "explanation": "Duplicates 2 and 3"
          },
          {
                "input": "5\n5 4 3 2 1",
                "output": "",
                "explanation": "All unique"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 219,
    patternName: "Doubly Linked List + Map",
    title: "JAVA Placement 19: LRU Cache Implementation",
    slug: "placement-pattern-java-19-lru-cache-implementation",
    subject: "JAVA",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Implement Least Recently Used (LRU) Cache with get and put in O(1).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6 2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3",
                "output": "1\n-1\n3",
                "explanation": "Key 2 evicted when 3 put"
          },
          {
                "input": "3 1\nput 1 10\nget 1\nput 2 20",
                "output": "10",
                "explanation": "Get key 1"
          },
          {
                "input": "2 2\nget 5\nput 5 50",
                "output": "-1",
                "explanation": "Key 5 not found initially"
          },
          {
                "input": "4 2\nput 1 1\nput 2 2\nput 1 10\nget 1",
                "output": "10",
                "explanation": "Key 1 updated"
          },
          {
                "input": "3 1\nput 1 1\nget 2\nget 1",
                "output": "-1\n1",
                "explanation": "Key 2 not present"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 220,
    patternName: "Backtracking Recursion",
    title: "JAVA Placement 20: Permutations of Distinct Array",
    slug: "placement-pattern-java-20-permutations-distinct-array",
    subject: "JAVA",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Generate all possible permutations of an array of distinct integers.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2 3",
                "output": "[1,2,3]\n[1,3,2]\n[2,1,3]\n[2,3,1]\n[3,1,2]\n[3,2,1]",
                "explanation": "6 permutations"
          },
          {
                "input": "1\n0",
                "output": "[0]",
                "explanation": "Single element"
          },
          {
                "input": "2\n0 1",
                "output": "[0,1]\n[1,0]",
                "explanation": "2 permutations"
          },
          {
                "input": "3\n7 8 9",
                "output": "[7,8,9]\n[7,9,8]\n[8,7,9]\n[8,9,7]\n[9,7,8]\n[9,8,7]",
                "explanation": "6 permutations"
          },
          {
                "input": "2\n5 10",
                "output": "[5,10]\n[10,5]",
                "explanation": "2 permutations"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const PYTHON_PLACEMENT_PATTERNS = [
  {
    id: 301,
    patternName: "Prefix Suffix Product",
    title: "PYTHON Placement 1: Product of Array Except Self",
    slug: "placement-pattern-python-1-product-except-self",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Calculate product array without using division operator.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 2 3 4",
                "output": "24 12 8 6",
                "explanation": "Products except self"
          },
          {
                "input": "5\n-1 1 0 -3 3",
                "output": "0 0 9 0 0",
                "explanation": "Zero handling"
          },
          {
                "input": "2\n5 10",
                "output": "10 5",
                "explanation": "Two elements"
          },
          {
                "input": "3\n2 3 4",
                "output": "12 8 6",
                "explanation": "Product array"
          },
          {
                "input": "4\n1 1 1 1",
                "output": "1 1 1 1",
                "explanation": "All ones"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 302,
    patternName: "Dynamic Programming",
    title: "PYTHON Placement 2: Maximum Subarray Sum (Kadane's Algorithm)",
    slug: "placement-pattern-python-2-kadanes-algorithm-max-subarray",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Find max contiguous subarray sum in O(N) time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "9\n-2 1 -3 4 -1 2 1 -5 4",
                "output": "6",
                "explanation": "Subarray [4,-1,2,1] sum is 6"
          },
          {
                "input": "1\n1",
                "output": "1",
                "explanation": "Single positive"
          },
          {
                "input": "5\n5 4 -1 7 8",
                "output": "23",
                "explanation": "Entire array sum"
          },
          {
                "input": "3\n-3 -2 -1",
                "output": "-1",
                "explanation": "Max single negative"
          },
          {
                "input": "4\n-1 2 3 -4",
                "output": "5",
                "explanation": "Subarray [2,3] sum is 5"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 303,
    patternName: "Two Pointers String",
    title: "PYTHON Placement 3: Valid Palindrome String (Ignoring Special Chars)",
    slug: "placement-pattern-python-3-valid-palindrome-string",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Check if alphanumeric string is palindrome ignoring case and non-alphanumeric chars.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "A man, a plan, a canal: Panama",
                "output": "true",
                "explanation": "\"amanaplanacanalpanama\" is palindrome"
          },
          {
                "input": "race a car",
                "output": "false",
                "explanation": "\"raceacar\" is not palindrome"
          },
          {
                "input": " ",
                "output": "true",
                "explanation": "Empty string is palindrome"
          },
          {
                "input": "0P",
                "output": "false",
                "explanation": "Not palindrome"
          },
          {
                "input": "a.",
                "output": "true",
                "explanation": "\"a\" is palindrome"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 304,
    patternName: "Two Pointers Greedy",
    title: "PYTHON Placement 4: Container With Most Water",
    slug: "placement-pattern-python-4-container-with-most-water",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Find two lines that together with x-axis form container holding max water.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "9\n1 8 6 2 5 4 8 3 7",
                "output": "49",
                "explanation": "Max area between index 1 and 8"
          },
          {
                "input": "2\n1 1",
                "output": "1",
                "explanation": "Area 1"
          },
          {
                "input": "5\n4 3 2 1 4",
                "output": "16",
                "explanation": "Area 16"
          },
          {
                "input": "3\n1 2 1",
                "output": "2",
                "explanation": "Area 2"
          },
          {
                "input": "4\n2 3 4 514",
                "output": "9",
                "explanation": "Max area 9"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 305,
    patternName: "Two Pointers Sort",
    title: "PYTHON Placement 5: 3Sum Triplets Sum to Zero",
    slug: "placement-pattern-python-5-3sum-triplets-zero",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Find all unique triplets [a,b,c] such that a + b + c = 0.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "6\n-1 0 1 2 -1 -4",
                "output": "[-1 -1 2]\n[-1 0 1]",
                "explanation": "Unique triplets"
          },
          {
                "input": "3\n0 1 1",
                "output": "None",
                "explanation": "Sum is 2"
          },
          {
                "input": "3\n0 0 0",
                "output": "[0 0 0]",
                "explanation": "Zero triplet"
          },
          {
                "input": "4\n-2 0 1 1",
                "output": "[-2 0 1]",
                "explanation": "Triplet sums to zero"
          },
          {
                "input": "1\n0",
                "output": "None",
                "explanation": "Less than 3 elements"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 306,
    patternName: "Expand Around Center",
    title: "PYTHON Placement 6: Longest Palindromic Substring",
    slug: "placement-pattern-python-6-longest-palindromic-substring",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Find the longest palindromic substring in S.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "babad",
                "output": "bab",
                "explanation": "\"bab\" or \"aba\""
          },
          {
                "input": "cbbd",
                "output": "bb",
                "explanation": "\"bb\""
          },
          {
                "input": "a",
                "output": "a",
                "explanation": "Single char"
          },
          {
                "input": "ac",
                "output": "a",
                "explanation": "First char"
          },
          {
                "input": "racecar",
                "output": "racecar",
                "explanation": "Entire string"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 307,
    patternName: "String Parsing",
    title: "PYTHON Placement 7: String to Integer (atoi)",
    slug: "placement-pattern-python-7-string-to-integer-atoi",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Parse integer from leading whitespace, sign, and numerical digits.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "42",
                "output": "42",
                "explanation": "Parsed 42"
          },
          {
                "input": "   -42",
                "output": "-42",
                "explanation": "Negative 42"
          },
          {
                "input": "4193 with words",
                "output": "4193",
                "explanation": "Stops at non-digit"
          },
          {
                "input": "words and 987",
                "output": "0",
                "explanation": "No valid leading digits"
          },
          {
                "input": "-91283472332",
                "output": "-2147483648",
                "explanation": "Clamped to 32-bit INT_MIN"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 308,
    patternName: "LinkedList Merge",
    title: "PYTHON Placement 8: Merge Two Sorted Lists",
    slug: "placement-pattern-python-8-merge-two-sorted-lists-py",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Merge two sorted linked lists into one sorted list.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 3\n1 2 4\n1 3 4",
                "output": "1 1 2 3 4 4",
                "explanation": "Merged sorted list"
          },
          {
                "input": "0 0",
                "output": "",
                "explanation": "Both empty"
          },
          {
                "input": "0 1\n0",
                "output": "0",
                "explanation": "One empty list"
          },
          {
                "input": "2 2\n5 10\n2 8",
                "output": "2 5 8 10",
                "explanation": "Merged"
          },
          {
                "input": "1 3\n2\n1 3 5",
                "output": "1 2 3 5",
                "explanation": "Merged sorted"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 309,
    patternName: "Matrix Traversal",
    title: "PYTHON Placement 9: Spiral Matrix Traversal Order",
    slug: "placement-pattern-python-9-spiral-matrix-traversal",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Return all elements of M x N matrix in spiral order.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 3\n1 2 3\n4 5 6\n7 8 9",
                "output": "1 2 3 6 9 8 7 4 5",
                "explanation": "Spiral order"
          },
          {
                "input": "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12",
                "output": "1 2 3 4 8 12 11 10 9 5 6 7",
                "explanation": "Spiral order"
          },
          {
                "input": "1 1\n10",
                "output": "10",
                "explanation": "Single element"
          },
          {
                "input": "2 2\n1 2\n3 4",
                "output": "1 2 4 3",
                "explanation": "2x2 spiral"
          },
          {
                "input": "1 3\n5 6 7",
                "output": "5 6 7",
                "explanation": "Single row"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 310,
    patternName: "Matrix Rotation",
    title: "PYTHON Placement 10: Rotate Image (2D Matrix 90 Degrees Clockwise)",
    slug: "placement-pattern-python-10-rotate-image-matrix",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Rotate an N x N 2D matrix 90 degrees clockwise in-place.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2 3\n4 5 6\n7 8 9",
                "output": "7 4 1\n8 5 2\n9 6 3",
                "explanation": "Rotated 90 deg clockwise"
          },
          {
                "input": "2\n1 2\n3 4",
                "output": "3 1\n4 2",
                "explanation": "2x2 matrix rotated"
          },
          {
                "input": "1\n100",
                "output": "100",
                "explanation": "1x1 matrix"
          },
          {
                "input": "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16",
                "output": "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4",
                "explanation": "4x4 matrix rotated"
          },
          {
                "input": "2\n5 6\n7 8",
                "output": "7 5\n8 6",
                "explanation": "Rotated"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 311,
    patternName: "Backtracking 2D",
    title: "PYTHON Placement 11: Word Search in 2D Board",
    slug: "placement-pattern-python-11-word-search-2d-board",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Find if word exists in 2D grid using adjacent character DFS backtracking.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 4 ABCCED\nA B C E\nS F C S\nA D E E",
                "output": "true",
                "explanation": "Word ABCCED found"
          },
          {
                "input": "3 4 SEE\nA B C E\nS F C S\nA D E E",
                "output": "true",
                "explanation": "Word SEE found"
          },
          {
                "input": "3 4 ABCB\nA B C E\nS F C S\nA D E E",
                "output": "false",
                "explanation": "Reusing cell not allowed"
          },
          {
                "input": "1 1 A\nA",
                "output": "true",
                "explanation": "Single cell match"
          },
          {
                "input": "2 2 NO\nY E\nS O",
                "output": "false",
                "explanation": "Not connected"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 312,
    patternName: "Dynamic Programming",
    title: "PYTHON Placement 12: Coin Change Minimum Coins",
    slug: "placement-pattern-python-12-coin-change-min-coins",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Find fewest coins needed to make up target amount using DP.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 11\n1 2 5",
                "output": "3",
                "explanation": "11 = 5 + 5 + 1 (3 coins)"
          },
          {
                "input": "1 3\n2",
                "output": "-1",
                "explanation": "Cannot make amount 3"
          },
          {
                "input": "1 0\n1",
                "output": "0",
                "explanation": "0 amount needs 0 coins"
          },
          {
                "input": "2 7\n2 5",
                "output": "2",
                "explanation": "7 = 5 + 2 (2 coins)"
          },
          {
                "input": "3 624\n1 2 5",
                "output": "126",
                "explanation": "DP minimum coins"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 313,
    patternName: "Dynamic Programming",
    title: "PYTHON Placement 13: House Robber Max Money",
    slug: "placement-pattern-python-13-house-robber-max-money",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Find max money you can rob without alerting police (no 2 adjacent houses).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 2 3 1",
                "output": "4",
                "explanation": "Rob house 1 (val 1) & house 3 (val 3) = 4"
          },
          {
                "input": "5\n2 7 9 3 1",
                "output": "12",
                "explanation": "Rob house 1 (2), house 3 (9), house 5 (1) = 12"
          },
          {
                "input": "1\n100",
                "output": "100",
                "explanation": "Single house"
          },
          {
                "input": "2\n20 30",
                "output": "30",
                "explanation": "Max of two houses"
          },
          {
                "input": "3\n10 1 10",
                "output": "20",
                "explanation": "Rob house 1 and 3"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 314,
    patternName: "Fibonacci DP",
    title: "PYTHON Placement 14: Climbing Stairs Way Count",
    slug: "placement-pattern-python-14-climbing-stairs-ways",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Find number of distinct ways to climb N steps taking 1 or 2 steps at a time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2",
                "output": "2",
                "explanation": "1+1 or 2 (2 ways)"
          },
          {
                "input": "3",
                "output": "3",
                "explanation": "1+1+1, 1+2, 2+1 (3 ways)"
          },
          {
                "input": "1",
                "output": "1",
                "explanation": "1 way"
          },
          {
                "input": "4",
                "output": "5",
                "explanation": "5 distinct ways"
          },
          {
                "input": "5",
                "output": "8",
                "explanation": "8 distinct ways"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 315,
    patternName: "DP String Partition",
    title: "PYTHON Placement 15: Decode Ways (A=1, B=2, ... Z=26)",
    slug: "placement-pattern-python-15-decode-ways-dp",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Calculate total ways to decode a digit string.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "12",
                "output": "2",
                "explanation": "\"AB\" (1 2) or \"L\" (12)"
          },
          {
                "input": "226",
                "output": "3",
                "explanation": "\"BZ\" (2 26), \"VF\" (22 6), \"BBF\" (2 2 6)"
          },
          {
                "input": "06",
                "output": "0",
                "explanation": "Leading zero invalid"
          },
          {
                "input": "10",
                "output": "1",
                "explanation": "\"J\" (10)"
          },
          {
                "input": "27",
                "output": "1",
                "explanation": "\"BG\" (2 7)"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 316,
    patternName: "DP Word Break",
    title: "PYTHON Placement 16: Word Break in Dictionary",
    slug: "placement-pattern-python-16-word-break-dp",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Determine if string S can be segmented into space-separated dictionary words.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "leetcode 2 leet code",
                "output": "true",
                "explanation": "\"leet\" + \"code\""
          },
          {
                "input": "applepenapple 2 apple pen",
                "output": "true",
                "explanation": "\"apple\" + \"pen\" + \"apple\""
          },
          {
                "input": "catsandog 5 cats dog sand and cat",
                "output": "false",
                "explanation": "Cannot segment"
          },
          {
                "input": "a 1 a",
                "output": "true",
                "explanation": "Single char match"
          },
          {
                "input": "code 1 cod",
                "output": "false",
                "explanation": "Missing \"e\""
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 317,
    patternName: "Two Pointers Trapping",
    title: "PYTHON Placement 17: Trapping Rain Water Total Volume",
    slug: "placement-pattern-python-17-trapping-rain-water",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Calculate total units of rainwater trapped between elevation bars.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "12\n0 1 0 2 1 0 1 3 2 1 2 1",
                "output": "6",
                "explanation": "6 units of water trapped"
          },
          {
                "input": "6\n4 2 0 3 2 5",
                "output": "9",
                "explanation": "9 units trapped"
          },
          {
                "input": "3\n1 2 3",
                "output": "0",
                "explanation": "Monotonic increasing height traps 0"
          },
          {
                "input": "3\n3 2 1",
                "output": "0",
                "explanation": "Monotonic decreasing height traps 0"
          },
          {
                "input": "5\n3 0 2 0 4",
                "output": "7",
                "explanation": "7 units trapped"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 318,
    patternName: "Patience Sorting / DP",
    title: "PYTHON Placement 18: Longest Increasing Subsequence Length",
    slug: "placement-pattern-python-18-longest-increasing-subsequence",
    subject: "PYTHON",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find length of longest strictly increasing subsequence in O(N log N) time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "8\n10 9 2 5 3 7 101 18",
                "output": "4",
                "explanation": "LIS [2, 3, 7, 101] length 4"
          },
          {
                "input": "6\n0 1 0 3 2 3",
                "output": "4",
                "explanation": "LIS [0, 1, 2, 3] length 4"
          },
          {
                "input": "7\n7 7 7 7 7 7 7",
                "output": "1",
                "explanation": "Single element LIS"
          },
          {
                "input": "4\n4 10 4 38",
                "output": "3",
                "explanation": "LIS [4, 10, 38] length 3"
          },
          {
                "input": "5\n1 3 6 7 9",
                "output": "5",
                "explanation": "Entire array is LIS"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 319,
    patternName: "Binary Search 2D",
    title: "PYTHON Placement 19: Search a 2D Matrix (Sorted Rows & Cols)",
    slug: "placement-pattern-python-19-search-2d-matrix-binary",
    subject: "PYTHON",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Search for target value in an M x N matrix where rows are sorted and first integer of each row > last of previous.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 4 3\n1 3 5 7\n10 11 16 20\n23 30 34 60",
                "output": "true",
                "explanation": "3 exists at (0,1)"
          },
          {
                "input": "3 4 13\n1 3 5 7\n10 11 16 20\n23 30 34 60",
                "output": "false",
                "explanation": "13 does not exist"
          },
          {
                "input": "1 1 5\n5",
                "output": "true",
                "explanation": "Single element match"
          },
          {
                "input": "2 2 4\n1 2\n3 4",
                "output": "true",
                "explanation": "Found at (1,1)"
          },
          {
                "input": "2 2 10\n1 2\n3 4",
                "output": "false",
                "explanation": "Not found"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 320,
    patternName: "Boyer-Moore Voting",
    title: "PYTHON Placement 20: Majority Element (Appears > N/2 times)",
    slug: "placement-pattern-python-20-majority-element-boyer-moore",
    subject: "PYTHON",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Find element appearing strictly more than N/2 times in O(N) time and O(1) space.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n3 2 3",
                "output": "3",
                "explanation": "3 appears 2/3 times"
          },
          {
                "input": "7\n2 2 1 1 1 2 2",
                "output": "2",
                "explanation": "2 appears 4/7 times"
          },
          {
                "input": "1\n100",
                "output": "100",
                "explanation": "Single element majority"
          },
          {
                "input": "5\n6 5 5 5 1",
                "output": "5",
                "explanation": "5 appears 3/5 times"
          },
          {
                "input": "4\n1 1 1 2",
                "output": "1",
                "explanation": "1 majority"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const MONGODB_PLACEMENT_PATTERNS = [
  {
    id: 401,
    patternName: "Aggregation Pipeline ($group)",
    title: "MONGODB Placement 1: Top 3 Highest Spending Customers",
    slug: "placement-pattern-mongodb-1-top-3-customers",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Group sales by customer_id and return top 3 spending customer IDs.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\n101 500\n102 300\n101 200\n103 900\n104 100",
                "output": "103 900\n101 700\n102 300",
                "explanation": "Top 3 spenders aggregated"
          },
          {
                "input": "2\n1 10\n2 20",
                "output": "2 20\n1 10",
                "explanation": "Top 2"
          },
          {
                "input": "1\n5 50",
                "output": "5 50",
                "explanation": "Single customer"
          },
          {
                "input": "3\n10 100\n20 200\n30 300",
                "output": "30 300\n20 200\n10 100",
                "explanation": "Top 3 spenders"
          },
          {
                "input": "4\n1 5\n1 5\n2 8\n3 20",
                "output": "3 20\n1 10\n2 8",
                "explanation": "Sum aggregated"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 402,
    patternName: "Filtering ($match)",
    title: "MONGODB Placement 2: Filter Active Users with Age > 25",
    slug: "placement-pattern-mongodb-2-filter-active-users-age",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Match users where status = \"active\" and age > 25.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nAlice 30 active\nBob 22 active\nCharlie 28 inactive\nDavid 35 active",
                "output": "Alice\nDavid",
                "explanation": "Filtered active users > 25"
          },
          {
                "input": "2\nJohn 20 active\nJane 24 active",
                "output": "None",
                "explanation": "Age <= 25"
          },
          {
                "input": "1\nSam 26 active",
                "output": "Sam",
                "explanation": "Sam matches"
          },
          {
                "input": "3\nUser1 30 active\nUser2 40 active\nUser3 50 active",
                "output": "User1\nUser2\nUser3",
                "explanation": "All match"
          },
          {
                "input": "2\nX 30 inactive\nY 40 inactive",
                "output": "None",
                "explanation": "All inactive"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 403,
    patternName: "Avg Aggregation ($avg)",
    title: "MONGODB Placement 3: Average Product Price per Category",
    slug: "placement-pattern-mongodb-3-avg-product-price-category",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Group products by category and calculate average price formatted to 2 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nElectronics 500\nElectronics 300\nClothing 100\nClothing 50",
                "output": "Clothing 75.00\nElectronics 400.00",
                "explanation": "Average price per category"
          },
          {
                "input": "1\nBooks 20",
                "output": "Books 20.00",
                "explanation": "Single category avg"
          },
          {
                "input": "3\nToys 10\nToys 20\nToys 30",
                "output": "Toys 20.00",
                "explanation": "Avg 20"
          },
          {
                "input": "2\nFood 15\nFood 25",
                "output": "Food 20.00",
                "explanation": "Avg 20"
          },
          {
                "input": "2\nA 100\nB 200",
                "output": "A 100.00\nB 200.00",
                "explanation": "Separate categories"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 404,
    patternName: "Array Unwind ($unwind)",
    title: "MONGODB Placement 4: Total Quantity per Item ($unwind)",
    slug: "placement-pattern-mongodb-4-total-item-quantity-unwind",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Unwind items array from orders and sum total quantity per item_name.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\norder1 pen 2 notebook 3\norder2 pen 5\norder3 eraser 1 notebook 1",
                "output": "eraser 1\nnotebook 4\npen 7",
                "explanation": "Unwound items aggregated"
          },
          {
                "input": "1\norder1 itemA 10",
                "output": "itemA 10",
                "explanation": "Single item unwind"
          },
          {
                "input": "2\no1 X 1\no2 X 2",
                "output": "X 3",
                "explanation": "Total 3"
          },
          {
                "input": "2\no1 A 5 B 5\no2 C 5",
                "output": "A 5\nB 5\nC 5",
                "explanation": "All items summed"
          },
          {
                "input": "1\no1 Z 100",
                "output": "Z 100",
                "explanation": "Single item"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 405,
    patternName: "Sort & Limit ($sort)",
    title: "MONGODB Placement 5: Recent High Value Orders ($match + $sort)",
    slug: "placement-pattern-mongodb-5-recent-high-value-orders",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Filter orders with amount >= 1000 and sort by date descending limit 2.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n101 2021-01-01 1500\n102 2021-01-05 800\n103 2021-01-10 2000\n104 2021-01-15 1200",
                "output": "104 1200\n103 2000",
                "explanation": "Most recent high-value orders"
          },
          {
                "input": "2\n1 2020-01-01 500\n2 2020-01-02 600",
                "output": "None",
                "explanation": "No orders >= 1000"
          },
          {
                "input": "1\n5 2021-05-05 5000",
                "output": "5 5000",
                "explanation": "Single high order"
          },
          {
                "input": "3\n1 2021-01-01 1000\n2 2021-01-02 2000\n3 2021-01-03 3000",
                "output": "3 3000\n2 2000",
                "explanation": "Sorted limit 2"
          },
          {
                "input": "2\n1 2021-06-01 1100\n2 2021-06-02 1100",
                "output": "2 1100\n1 1100",
                "explanation": "Top 2 high value"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 406,
    patternName: "Join Pipeline ($lookup)",
    title: "MONGODB Placement 6: Lookup Customer Name for Orders",
    slug: "placement-pattern-mongodb-6-lookup-customer-orders",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Perform $lookup join between orders and customers collection.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2 2\nc1 Alice\nc2 Bob\no1 c1 50\no2 c2 100",
                "output": "o1 Alice 50\no2 Bob 100",
                "explanation": "Joined customer names"
          },
          {
                "input": "1 1\nc10 Sam\no10 c10 99",
                "output": "o10 Sam 99",
                "explanation": "Lookup single record"
          },
          {
                "input": "1 1\nc1 X\no1 c2 50",
                "output": "o1 Unknown 50",
                "explanation": "Unmatched customer lookup"
          },
          {
                "input": "2 1\nc1 A\nc2 B\no1 c1 10",
                "output": "o1 A 10",
                "explanation": "Joined customer A"
          },
          {
                "input": "1 2\nc1 Z\no1 c1 5\no2 c1 15",
                "output": "o1 Z 5\no2 Z 15",
                "explanation": "Multiple orders lookup"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 407,
    patternName: "Count Aggregation ($count)",
    title: "MONGODB Placement 7: Count Shipped Orders per Customer",
    slug: "placement-pattern-mongodb-7-count-shipped-orders",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Group by customer and count orders with status = \"shipped\".",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nAlice shipped\nAlice pending\nBob shipped\nAlice shipped",
                "output": "Alice 2\nBob 1",
                "explanation": "Shipped orders count per user"
          },
          {
                "input": "2\nUser1 pending\nUser2 canceled",
                "output": "None",
                "explanation": "No shipped orders"
          },
          {
                "input": "1\nSingle shipped",
                "output": "Single 1",
                "explanation": "Single shipped"
          },
          {
                "input": "3\nX shipped\nY shipped\nZ shipped",
                "output": "X 1\nY 1\nZ 1",
                "explanation": "1 shipped each"
          },
          {
                "input": "2\nA shipped\nA shipped",
                "output": "A 2",
                "explanation": "A 2 shipped"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 408,
    patternName: "Duplicate Grouping",
    title: "MONGODB Placement 8: Find Duplicate Email Documents",
    slug: "placement-pattern-mongodb-8-find-duplicate-emails-mongo",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find emails that appear in > 1 documents.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 a@b.com\n2 c@d.com\n3 a@b.com\n4 e@f.com",
                "output": "a@b.com 2",
                "explanation": "a@b.com count 2"
          },
          {
                "input": "2\n1 x@y.com\n2 z@w.com",
                "output": "None",
                "explanation": "All unique"
          },
          {
                "input": "3\n1 m@n.com\n2 m@n.com\n3 m@n.com",
                "output": "m@n.com 3",
                "explanation": "m@n.com count 3"
          },
          {
                "input": "1\n1 single@com",
                "output": "None",
                "explanation": "No duplicates"
          },
          {
                "input": "4\n1 a@c.com\n2 b@c.com\n3 a@c.com\n4 b@c.com",
                "output": "a@c.com 2\nb@c.com 2",
                "explanation": "Both duplicates"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 409,
    patternName: "Max per Group ($max)",
    title: "MONGODB Placement 9: Max Priced Product per Category",
    slug: "placement-pattern-mongodb-9-max-price-product-category",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Find maximum price product in each product category.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nTech Phone 800\nTech Laptop 1200\nFurniture Chair 150\nFurniture Table 300",
                "output": "Furniture 300\nTech 1200",
                "explanation": "Max price per category"
          },
          {
                "input": "1\nToys Bear 25",
                "output": "Toys 25",
                "explanation": "Single category max"
          },
          {
                "input": "3\nA P1 10\nA P2 20\nA P3 30",
                "output": "A 30",
                "explanation": "Max 30"
          },
          {
                "input": "2\nB X 50\nB Y 50",
                "output": "B 50",
                "explanation": "Tied max"
          },
          {
                "input": "2\nC P1 100\nD P2 200",
                "output": "C 100\nD 200",
                "explanation": "Max in each"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 410,
    patternName: "Rating Aggregation ($avg)",
    title: "MONGODB Placement 10: Average Movie Rating Calculation",
    slug: "placement-pattern-mongodb-10-avg-movie-rating-calc",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Calculate average rating for each movie sorted by avg rating desc.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\nInception 9\nInception 10\nAvatar 8\nAvatar 6\nTitanic 7",
                "output": "Inception 9.50\nTitanic 7.00\nAvatar 7.00",
                "explanation": "Sorted average ratings"
          },
          {
                "input": "1\nMovie1 5",
                "output": "Movie1 5.00",
                "explanation": "Single movie rating"
          },
          {
                "input": "2\nM1 8\nM2 10",
                "output": "M2 10.00\nM1 8.00",
                "explanation": "Sorted ratings"
          },
          {
                "input": "3\nX 9\nX 9\nX 9",
                "output": "X 9.00",
                "explanation": "Avg 9.00"
          },
          {
                "input": "2\nA 6\nB 6",
                "output": "A 6.00\nB 6.00",
                "explanation": "Equal avg"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 411,
    patternName: "Multi-Condition Match",
    title: "MONGODB Placement 11: Filter Orders by Status and Amount",
    slug: "placement-pattern-mongodb-11-filter-orders-status-amount",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Match orders with status = \"Completed\" and total_amount > 500.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 Completed 600\n2 Pending 800\n3 Completed 400\n4 Completed 1000",
                "output": "1 600\n4 1000",
                "explanation": "Completed and amount > 500"
          },
          {
                "input": "2\n1 Pending 1000\n2 Completed 200",
                "output": "None",
                "explanation": "None match both"
          },
          {
                "input": "1\n1 Completed 501",
                "output": "1 501",
                "explanation": "Matches condition"
          },
          {
                "input": "3\n1 Completed 700\n2 Completed 800\n3 Completed 900",
                "output": "1 700\n2 800\n3 900",
                "explanation": "All match"
          },
          {
                "input": "2\n1 C 100\n2 C 200",
                "output": "None",
                "explanation": "Amount <= 500"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 412,
    patternName: "Date Projection ($project)",
    title: "MONGODB Placement 12: Monthly Sales Revenue Aggregation",
    slug: "placement-pattern-mongodb-12-monthly-sales-revenue",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Extract YYYY-MM from date and sum total revenue per month.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n2021-01-05 100\n2021-01-20 200\n2021-02-10 150\n2021-02-15 250",
                "output": "2021-01 300\n2021-02 400",
                "explanation": "Monthly revenue"
          },
          {
                "input": "1\n2021-05-01 50",
                "output": "2021-05 50",
                "explanation": "Single month"
          },
          {
                "input": "3\n2020-03-01 10\n2020-03-02 20\n2020-03-03 30",
                "output": "2020-03 60",
                "explanation": "Sum 60"
          },
          {
                "input": "2\n2021-12-01 500\n2021-12-31 500",
                "output": "2021-12 1000",
                "explanation": "Dec revenue 1000"
          },
          {
                "input": "2\n2022-01-01 10\n2022-02-01 20",
                "output": "2022-01 10\n2022-02 20",
                "explanation": "Two months"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 413,
    patternName: "Array Membership ($in)",
    title: "MONGODB Placement 13: Customers Purchasing Specific Product ID",
    slug: "placement-pattern-mongodb-13-customers-purchased-product",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Find customer_ids whose purchased_products array contains target product_id.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 P100\n101 P100 P101\n102 P102\n103 P100",
                "output": "101\n103",
                "explanation": "Purchased P100"
          },
          {
                "input": "2 P200\n1 X\n2 Y",
                "output": "None",
                "explanation": "Not found"
          },
          {
                "input": "1 P50\n5 P50",
                "output": "5",
                "explanation": "Matches P50"
          },
          {
                "input": "3 P1\n1 P1\n2 P1\n3 P1",
                "output": "1\n2\n3",
                "explanation": "All bought P1"
          },
          {
                "input": "2 P99\n10 P1 P2\n20 P99 P100",
                "output": "20",
                "explanation": "User 20 bought P99"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 414,
    patternName: "Text Search ($regex)",
    title: "MONGODB Placement 14: Search Keyword in Description Field",
    slug: "placement-pattern-mongodb-14-regex-keyword-search-mongo",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Match documents where description contains case-insensitive keyword.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 wireless\n1 Wireless Bluetooth Headphone\n2 Wired Mouse\n3 High quality wireless speaker",
                "output": "1 Wireless Bluetooth Headphone\n3 High quality wireless speaker",
                "explanation": "Matches \"wireless\""
          },
          {
                "input": "2 gaming\n1 Office Chair\n2 Wooden Table",
                "output": "None",
                "explanation": "No match"
          },
          {
                "input": "1 smart\n1 Smart Watch",
                "output": "1 Smart Watch",
                "explanation": "Case-insensitive match"
          },
          {
                "input": "3 fast\n1 Fast charger\n2 Super fast cable\n3 Slow adapter",
                "output": "1 Fast charger\n2 Super fast cable",
                "explanation": "Matches \"fast\""
          },
          {
                "input": "1 test\n1 Test item",
                "output": "1 Test item",
                "explanation": "Matched"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 415,
    patternName: "Array Matching ($elemMatch)",
    title: "MONGODB Placement 15: Scores Greater Than Threshold in Array",
    slug: "placement-pattern-mongodb-15-elemmatch-array-scores",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Find student IDs who scored > 80 in at least one exam in scores array.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 80\n1 75 85 90\n2 60 70 78\n3 81 50 60",
                "output": "1\n3",
                "explanation": "Students 1 and 3 scored > 80"
          },
          {
                "input": "2 90\n1 80 85\n2 88 89",
                "output": "None",
                "explanation": "None > 90"
          },
          {
                "input": "1 50\n5 51",
                "output": "5",
                "explanation": "51 > 50"
          },
          {
                "input": "3 70\n1 71\n2 72\n3 73",
                "output": "1\n2\n3",
                "explanation": "All match"
          },
          {
                "input": "2 100\n1 100\n2 100",
                "output": "None",
                "explanation": "Strictly > 100"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 416,
    patternName: "Set Aggregation ($addToSet)",
    title: "MONGODB Placement 16: Distinct Tags per Category",
    slug: "placement-pattern-mongodb-16-addtoset-distinct-tags",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Collect unique tags per category into a sorted array.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nTech ai\nTech ml\nTech ai\nDesign ui",
                "output": "Design [ui]\nTech [ai, ml]",
                "explanation": "Distinct tags collected"
          },
          {
                "input": "1\nFood organic",
                "output": "Food [organic]",
                "explanation": "Single tag"
          },
          {
                "input": "3\nA x\nA y\nA z",
                "output": "A [x, y, z]",
                "explanation": "3 distinct tags"
          },
          {
                "input": "2\nB same\nB same",
                "output": "B [same]",
                "explanation": "Deduplicated"
          },
          {
                "input": "2\nC t1\nD t2",
                "output": "C [t1]\nD [t2]",
                "explanation": "Distinct per category"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 417,
    patternName: "Bucket Categorization ($bucket)",
    title: "MONGODB Placement 17: Bucket Products by Price Range",
    slug: "placement-pattern-mongodb-17-bucket-products-price",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Categorize products into buckets: Cheap (<50), Moderate (50-200), Expensive (>200).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\nPen 10\nShirt 80\nPhone 500\nBook 30",
                "output": "Cheap 2\nModerate 1\nExpensive 1",
                "explanation": "Bucket counts"
          },
          {
                "input": "1\nLaptop 1000",
                "output": "Cheap 0\nModerate 0\nExpensive 1",
                "explanation": "1 expensive"
          },
          {
                "input": "2\nA 5\nB 15",
                "output": "Cheap 2\nModerate 0\nExpensive 0",
                "explanation": "2 cheap"
          },
          {
                "input": "3\nX 60\nY 70\nZ 80",
                "output": "Cheap 0\nModerate 3\nExpensive 0",
                "explanation": "3 moderate"
          },
          {
                "input": "0",
                "output": "Cheap 0\nModerate 0\nExpensive 0",
                "explanation": "Empty inputs"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 418,
    patternName: "Field Existence ($exists)",
    title: "MONGODB Placement 18: Find Documents Missing Field ($exists: false)",
    slug: "placement-pattern-mongodb-18-exists-missing-field-mongo",
    subject: "MONGODB",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Find user IDs where email field is missing or null.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 Alice alice@com\n2 Bob null\n3 Charlie charlie@com\n4 David null",
                "output": "2\n4",
                "explanation": "Users 2 and 4 missing email"
          },
          {
                "input": "2\n1 A a@com\n2 B b@com",
                "output": "None",
                "explanation": "All have email"
          },
          {
                "input": "1\n1 Single null",
                "output": "1",
                "explanation": "User 1 missing email"
          },
          {
                "input": "3\n1 X null\n2 Y null\n3 Z null",
                "output": "1\n2\n3",
                "explanation": "All missing"
          },
          {
                "input": "2\n10 P p@com\n20 Q null",
                "output": "20",
                "explanation": "20 missing"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 419,
    patternName: "Pagination ($skip & $limit)",
    title: "MONGODB Placement 19: Paginate Products Collection ($skip & $limit)",
    slug: "placement-pattern-mongodb-19-paginate-products-skip-limit",
    subject: "MONGODB",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Skip (page-1)*pageSize items and return limit pageSize sorted by price asc.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5 2 2\nP1 10\nP2 20\nP3 30\nP4 40\nP5 50",
                "output": "P3 30\nP4 40",
                "explanation": "Page 2 (skip 2, limit 2): P3 and P4"
          },
          {
                "input": "3 1 2\nA 100\nB 200\nC 300",
                "output": "A 100\nB 200",
                "explanation": "Page 1 limit 2"
          },
          {
                "input": "1 1 10\nX 5",
                "output": "X 5",
                "explanation": "Page 1 all"
          },
          {
                "input": "4 3 2\n1 10\n2 20\n3 30\n4 40",
                "output": "None",
                "explanation": "Page 3 skip 4 past end"
          },
          {
                "input": "3 1 1\nItem 1",
                "output": "Item 1",
                "explanation": "Page 1 limit 1"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 420,
    patternName: "Facet Aggregation ($facet)",
    title: "MONGODB Placement 20: Multi-Pipeline Facet Summary ($facet)",
    slug: "placement-pattern-mongodb-20-facet-summary-pipeline",
    subject: "MONGODB",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Return total count and total revenue in single $facet pipeline.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n100\n200\n300",
                "output": "totalCount: 3, totalRevenue: 600",
                "explanation": "Facet aggregated total count and sum"
          },
          {
                "input": "1\n50",
                "output": "totalCount: 1, totalRevenue: 50",
                "explanation": "Facet single item"
          },
          {
                "input": "0",
                "output": "totalCount: 0, totalRevenue: 0",
                "explanation": "Facet empty"
          },
          {
                "input": "2\n15\n25",
                "output": "totalCount: 2, totalRevenue: 40",
                "explanation": "Facet 2 items"
          },
          {
                "input": "4\n10\n10\n10\n10",
                "output": "totalCount: 4, totalRevenue: 40",
                "explanation": "Facet 4 items"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const AI_PLACEMENT_PATTERNS = [
  {
    id: 501,
    patternName: "Metric Calculation",
    title: "AI Placement 1: Precision & Recall Calculator",
    slug: "placement-pattern-ai-1-precision-recall-calc",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Calculate Precision and Recall from TP, FP, FN formatted to 2 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "80 20 10",
                "output": "Precision: 0.80, Recall: 0.89",
                "explanation": "P=80/100=0.80, R=80/90=0.89"
          },
          {
                "input": "50 0 50",
                "output": "Precision: 1.00, Recall: 0.50",
                "explanation": "P=50/50=1.00, R=50/100=0.50"
          },
          {
                "input": "100 0 0",
                "output": "Precision: 1.00, Recall: 1.00",
                "explanation": "Perfect metric"
          },
          {
                "input": "0 10 10",
                "output": "Precision: 0.00, Recall: 0.00",
                "explanation": "Zero TP"
          },
          {
                "input": "40 10 10",
                "output": "Precision: 0.80, Recall: 0.80",
                "explanation": "P=0.80, R=0.80"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 502,
    patternName: "F1-Score Metric",
    title: "AI Placement 2: F1-Score Harmonic Mean Calculator",
    slug: "placement-pattern-ai-2-f1-score-calculator",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Compute F1-Score = 2 * (P * R) / (P + R) formatted to 2 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "0.80 0.89",
                "output": "0.84",
                "explanation": "F1 harmonic mean"
          },
          {
                "input": "1.00 1.00",
                "output": "1.00",
                "explanation": "Perfect F1"
          },
          {
                "input": "0.00 0.50",
                "output": "0.00",
                "explanation": "Zero precision F1"
          },
          {
                "input": "0.75 0.75",
                "output": "0.75",
                "explanation": "F1 = 0.75"
          },
          {
                "input": "0.60 0.90",
                "output": "0.72",
                "explanation": "F1 = 0.72"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 503,
    patternName: "Loss Function",
    title: "AI Placement 3: Mean Squared Error (MSE) Calculator",
    slug: "placement-pattern-ai-3-mse-loss-calculator",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Calculate MSE = (1/N) * sum((y_true - y_pred)^2) rounded to 2 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n3 5 7\n2.5 5 8",
                "output": "0.42",
                "explanation": "MSE = ((0.5)^2 + 0 + (-1)^2)/3 = 1.25/3 = 0.42"
          },
          {
                "input": "1\n10\n10",
                "output": "0.00",
                "explanation": "Zero error"
          },
          {
                "input": "2\n1 2\n2 3",
                "output": "1.00",
                "explanation": "MSE = (1+1)/2 = 1.00"
          },
          {
                "input": "4\n0 0 0 0\n1 1 1 1",
                "output": "1.00",
                "explanation": "MSE = 4/4 = 1.00"
          },
          {
                "input": "3\n2 4 6\n1 3 5",
                "output": "1.00",
                "explanation": "MSE = 3/3 = 1.00"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 504,
    patternName: "Loss Function",
    title: "AI Placement 4: Binary Cross-Entropy Loss",
    slug: "placement-pattern-ai-4-binary-cross-entropy-loss",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Calculate BCE Loss = -1/N * sum(y*log(p) + (1-y)*log(1-p)) rounded to 4 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2\n1 0\n0.9 0.1",
                "output": "0.1054",
                "explanation": "BCE loss"
          },
          {
                "input": "1\n1\n0.99",
                "output": "0.0101",
                "explanation": "Low loss"
          },
          {
                "input": "1\n0\n0.01",
                "output": "0.0101",
                "explanation": "Low loss"
          },
          {
                "input": "2\n1 1\n0.5 0.5",
                "output": "0.6931",
                "explanation": "-ln(0.5) = 0.6931"
          },
          {
                "input": "1\n1\n0.5",
                "output": "0.6931",
                "explanation": "Uncertain prediction loss"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 505,
    patternName: "Distance Metric",
    title: "AI Placement 5: Euclidean Distance Matrix Calculation",
    slug: "placement-pattern-ai-5-euclidean-distance-matrix",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Calculate Euclidean distance between 2D point A (x1,y1) and B (x2,y2).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "0 0 3 4",
                "output": "5.00",
                "explanation": "sqrt(3^2 + 4^2) = 5.00"
          },
          {
                "input": "1 1 1 1",
                "output": "0.00",
                "explanation": "Same point"
          },
          {
                "input": "0 0 1 1",
                "output": "1.41",
                "explanation": "sqrt(2) = 1.41"
          },
          {
                "input": "-1 -1 2 3",
                "output": "5.00",
                "explanation": "sqrt(3^2 + 4^2) = 5.00"
          },
          {
                "input": "10 20 10 30",
                "output": "10.00",
                "explanation": "Vertical distance 10.00"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 506,
    patternName: "Similarity Metric",
    title: "AI Placement 6: Cosine Similarity Between Two Vectors",
    slug: "placement-pattern-ai-6-cosine-similarity-vectors",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Compute Cosine Similarity = (A . B) / (||A|| * ||B||) rounded to 4 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2 3\n1 2 3",
                "output": "1.0000",
                "explanation": "Collinear vectors"
          },
          {
                "input": "2\n1 0\n0 1",
                "output": "0.0000",
                "explanation": "Orthogonal vectors"
          },
          {
                "input": "2\n1 0\n-1 0",
                "output": "-1.0000",
                "explanation": "Opposite vectors"
          },
          {
                "input": "3\n1 1 1\n2 2 2",
                "output": "1.0000",
                "explanation": "Scaled vector parallel"
          },
          {
                "input": "2\n3 4\n4 3",
                "output": "0.9600",
                "explanation": "24/25 = 0.9600"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 507,
    patternName: "Data Preprocessing",
    title: "AI Placement 7: Min-Max Normalization Feature Scaling",
    slug: "placement-pattern-ai-7-min-max-normalization",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Scale array values to range [0, 1] using x_norm = (x - min) / (max - min).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\n10 20 30 40 50",
                "output": "0.00 0.25 0.50 0.75 1.00",
                "explanation": "Min-Max scaled values"
          },
          {
                "input": "2\n5 15",
                "output": "0.00 1.00",
                "explanation": "Min 0, Max 1"
          },
          {
                "input": "3\n0 50 100",
                "output": "0.00 0.50 1.00",
                "explanation": "Scaled values"
          },
          {
                "input": "1\n42",
                "output": "0.00",
                "explanation": "Single value defaults to 0"
          },
          {
                "input": "4\n1 2 3 4",
                "output": "0.00 0.33 0.67 1.00",
                "explanation": "Scaled values"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 508,
    patternName: "Data Preprocessing",
    title: "AI Placement 8: Z-Score Standardization (Mean 0, Std 1)",
    slug: "placement-pattern-ai-8-z-score-standardization",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Standardize feature values using z = (x - mu) / sigma rounded to 2 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\n10 20 30 40 50",
                "output": "-1.41 -0.71 0.00 0.71 1.41",
                "explanation": "Mean=30, std=14.14"
          },
          {
                "input": "3\n1 1 1",
                "output": "0.00 0.00 0.00",
                "explanation": "Zero std dev"
          },
          {
                "input": "2\n10 20",
                "output": "-1.00 1.00",
                "explanation": "Mean=15, std=5"
          },
          {
                "input": "4\n2 4 6 8",
                "output": "-1.34 -0.45 0.45 1.34",
                "explanation": "Z-score values"
          },
          {
                "input": "1\n5",
                "output": "0.00",
                "explanation": "Single element z-score 0"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 509,
    patternName: "Feature Encoding",
    title: "AI Placement 9: One-Hot Encoding Generator",
    slug: "placement-pattern-ai-9-one-hot-encoding-gen",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Convert categorical label indices into 1-hot encoded binary vectors.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 3\n0 1 2 1",
                "output": "1 0 0\n0 1 0\n0 0 1\n0 1 0",
                "explanation": "4 items, 3 classes"
          },
          {
                "input": "2 2\n0 1",
                "output": "1 0\n0 1",
                "explanation": "Binary one-hot"
          },
          {
                "input": "1 4\n3",
                "output": "0 0 0 1",
                "explanation": "Class 3"
          },
          {
                "input": "3 2\n0 0 0",
                "output": "1 0\n1 0\n1 0",
                "explanation": "All class 0"
          },
          {
                "input": "2 3\n2 0",
                "output": "0 0 1\n1 0 0",
                "explanation": "One hot encoded"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 510,
    patternName: "Clustering Update",
    title: "AI Placement 10: K-Means Cluster Centroid Update",
    slug: "placement-pattern-ai-10-kmeans-centroid-update",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Compute new 2D centroid coordinates (mean_x, mean_y) of assigned points.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2\n3 4\n5 6",
                "output": "3.00 4.00",
                "explanation": "Mean of x (1+3+5)/3=3, mean of y (2+4+6)/3=4"
          },
          {
                "input": "1\n10 20",
                "output": "10.00 20.00",
                "explanation": "Single point centroid"
          },
          {
                "input": "2\n0 0\n4 4",
                "output": "2.00 2.00",
                "explanation": "Centroid (2,2)"
          },
          {
                "input": "4\n1 1\n1 3\n3 1\n3 3",
                "output": "2.00 2.00",
                "explanation": "Centroid of square (2,2)"
          },
          {
                "input": "2\n-2 -4\n2 4",
                "output": "0.00 0.00",
                "explanation": "Centroid at origin"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 511,
    patternName: "Activation Function",
    title: "AI Placement 11: Logistic Sigmoid Activation Function",
    slug: "placement-pattern-ai-11-sigmoid-activation-func",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Compute sigmoid(z) = 1 / (1 + e^-z) formatted to 4 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "0",
                "output": "0.5000",
                "explanation": "Sigmoid(0) = 0.5"
          },
          {
                "input": "2",
                "output": "0.8808",
                "explanation": "Sigmoid(2) = 0.8808"
          },
          {
                "input": "-2",
                "output": "0.1192",
                "explanation": "Sigmoid(-2) = 0.1192"
          },
          {
                "input": "5",
                "output": "0.9933",
                "explanation": "Sigmoid(5) = 0.9933"
          },
          {
                "input": "-5",
                "output": "0.0067",
                "explanation": "Sigmoid(-5) = 0.0067"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 512,
    patternName: "Probability Distribution",
    title: "AI Placement 12: Softmax Probability Distribution",
    slug: "placement-pattern-ai-12-softmax-distribution-calc",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Calculate softmax probabilities e^zi / sum(e^zj) rounded to 4 decimals.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n1 2 3",
                "output": "0.0900 0.2447 0.6553",
                "explanation": "Softmax probabilities"
          },
          {
                "input": "2\n0 0",
                "output": "0.5000 0.5000",
                "explanation": "Equal inputs"
          },
          {
                "input": "1\n5",
                "output": "1.0000",
                "explanation": "Single element probability 1.0"
          },
          {
                "input": "3\n10 10 10",
                "output": "0.3333 0.3333 0.3333",
                "explanation": "Equal probabilities"
          },
          {
                "input": "2\n1 3",
                "output": "0.1192 0.8808",
                "explanation": "Softmax of [1, 3]"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 513,
    patternName: "Activation Function",
    title: "AI Placement 13: ReLU Activation and Derivative",
    slug: "placement-pattern-ai-13-relu-activation-derivative",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Compute ReLU(x) = max(0, x) and its derivative ReLU'(x).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "2.5",
                "output": "ReLU: 2.50, Derivative: 1",
                "explanation": "x > 0"
          },
          {
                "input": "-3.0",
                "output": "ReLU: 0.00, Derivative: 0",
                "explanation": "x < 0"
          },
          {
                "input": "0.0",
                "output": "ReLU: 0.00, Derivative: 0",
                "explanation": "x = 0"
          },
          {
                "input": "10.0",
                "output": "ReLU: 10.00, Derivative: 1",
                "explanation": "Positive value"
          },
          {
                "input": "-10.0",
                "output": "ReLU: 0.00, Derivative: 0",
                "explanation": "Negative value"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 514,
    patternName: "Lazy Learning (k-NN)",
    title: "AI Placement 14: k-Nearest Neighbors (k-NN) Classification",
    slug: "placement-pattern-ai-14-knn-classification-voting",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Classify target point using majority vote of K nearest neighbors in 2D space.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 3 0 0\n1 1 A\n-1 -1 A\n2 2 B\n-2 -2 B",
                "output": "A",
                "explanation": "Majority vote of K=3 nearest neighbors"
          },
          {
                "input": "3 1 5 5\n0 0 A\n5 4 B\n10 10 A",
                "output": "B",
                "explanation": "Closest neighbor B"
          },
          {
                "input": "1 1 0 0\n0 1 Cat",
                "output": "Cat",
                "explanation": "Nearest neighbor Cat"
          },
          {
                "input": "3 3 0 0\n1 0 Red\n0 1 Red\n-1 0 Blue",
                "output": "Red",
                "explanation": "2 Red vs 1 Blue"
          },
          {
                "input": "3 3 1 1\n1 1 Dog\n1 2 Dog\n5 5 Cat",
                "output": "Dog",
                "explanation": "Majority Dog"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 515,
    patternName: "Classification Metric",
    title: "AI Placement 15: Confusion Matrix 2x2 Generator",
    slug: "placement-pattern-ai-15-confusion-matrix-generator",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Construct 2x2 confusion matrix [[TP, FN], [FP, TN]] from actual and predicted labels.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n1 1\n1 0\n0 1\n0 0",
                "output": "TP: 1, FN: 1\nFP: 1, TN: 1",
                "explanation": "2x2 confusion matrix"
          },
          {
                "input": "2\n1 1\n1 1",
                "output": "TP: 2, FN: 0\nFP: 0, TN: 0",
                "explanation": "All TP"
          },
          {
                "input": "2\n0 0\n0 0",
                "output": "TP: 0, FN: 0\nFP: 0, TN: 2",
                "explanation": "All TN"
          },
          {
                "input": "3\n1 0\n1 0\n1 0",
                "output": "TP: 0, FN: 3\nFP: 0, TN: 0",
                "explanation": "All FN"
          },
          {
                "input": "3\n0 1\n0 1\n0 1",
                "output": "TP: 0, FN: 0\nFP: 3, TN: 0",
                "explanation": "All FP"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 516,
    patternName: "Decision Tree Metric",
    title: "AI Placement 16: Gini Impurity Calculation",
    slug: "placement-pattern-ai-16-gini-impurity-calc",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Calculate Gini Impurity = 1 - sum(p_i^2) for binary class counts.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5 5",
                "output": "0.50",
                "explanation": "1 - (0.5^2 + 0.5^2) = 0.50"
          },
          {
                "input": "10 0",
                "output": "0.00",
                "explanation": "Pure node Gini = 0"
          },
          {
                "input": "0 10",
                "output": "0.00",
                "explanation": "Pure node Gini = 0"
          },
          {
                "input": "3 1",
                "output": "0.38",
                "explanation": "Gini = 1 - (9/16 + 1/16) = 0.375 -> 0.38"
          },
          {
                "input": "8 2",
                "output": "0.32",
                "explanation": "Gini = 1 - (0.64 + 0.04) = 0.32"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 517,
    patternName: "Optimization Step",
    title: "AI Placement 17: Linear Regression Gradient Descent Update",
    slug: "placement-pattern-ai-17-gradient-descent-step",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Update weight w and bias b given learning rate alpha: w_new = w - alpha * dw.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "1.0 0.5 0.1 0.5 0.2",
                "output": "w: 0.95, b: 0.48",
                "explanation": "w = 1.0 - 0.1*0.5 = 0.95, b = 0.5 - 0.1*0.2 = 0.48"
          },
          {
                "input": "0.0 0.0 0.01 2.0 1.0",
                "output": "w: -0.02, b: -0.01",
                "explanation": "Updated weights"
          },
          {
                "input": "2.0 1.0 0.5 0.0 0.0",
                "output": "w: 2.00, b: 1.00",
                "explanation": "Zero gradients"
          },
          {
                "input": "0.5 0.5 0.1 1.0 -1.0",
                "output": "w: 0.40, b: 0.60",
                "explanation": "Updated w and b"
          },
          {
                "input": "1.5 2.5 0.2 0.5 0.5",
                "output": "w: 1.40, b: 2.40",
                "explanation": "Updated weights"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 518,
    patternName: "Computer Vision",
    title: "AI Placement 18: 2D Convolution Kernel Operation",
    slug: "placement-pattern-ai-18-convolution-2d-kernel",
    subject: "AI",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Apply 2x2 kernel convolution on 3x3 input matrix without padding (valid conv).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 3\n1 2 3\n4 5 6\n7 8 9\n2 2\n1 0\n0 1",
                "output": "6 8\n12 14",
                "explanation": "Dot product output 2x2"
          },
          {
                "input": "3 3\n1 1 1\n1 1 1\n1 1 1\n2 2\n1 1\n1 1",
                "output": "4 4\n4 4",
                "explanation": "Sum of 2x2 submatrices"
          },
          {
                "input": "2 2\n5 5\n5 5\n2 2\n1 0\n0 0",
                "output": "5",
                "explanation": "Single output value"
          },
          {
                "input": "3 3\n0 0 0\n0 5 0\n0 0 0\n2 2\n1 1\n1 1",
                "output": "5 5\n5 5",
                "explanation": "Kernel output"
          },
          {
                "input": "3 3\n2 0 0\n0 2 0\n0 0 2\n2 2\n1 0\n0 1",
                "output": "4 0\n0 4",
                "explanation": "2D conv result"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 519,
    patternName: "SVM Geometry",
    title: "AI Placement 19: SVM Functional Margin & Distance to Hyperplane",
    slug: "placement-pattern-ai-19-svm-hyperplane-distance",
    subject: "AI",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Calculate distance from point (x,y) to line w1*x + w2*y + b = 0.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 4 0 1 1",
                "output": "1.40",
                "explanation": "Dist = |3*1 + 4*1 + 0| / 5 = 7/5 = 1.40"
          },
          {
                "input": "1 0 0 0 0",
                "output": "0.00",
                "explanation": "Point lies on hyperplane"
          },
          {
                "input": "0 1 0 0 3",
                "output": "3.00",
                "explanation": "Vertical distance 3.00"
          },
          {
                "input": "3 4 -5 0 0",
                "output": "1.00",
                "explanation": "Dist = |-5| / 5 = 1.00"
          },
          {
                "input": "1 1 0 2 2",
                "output": "2.83",
                "explanation": "Distance to line"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 520,
    patternName: "Dimensionality Reduction",
    title: "AI Placement 20: PCA Explained Variance Ratio",
    slug: "placement-pattern-ai-20-pca-explained-variance-ratio",
    subject: "AI",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Calculate percentage of total variance explained by top K eigenvalues.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 1\n5 3 2",
                "output": "50.00%",
                "explanation": "5 / 10 = 50.00%"
          },
          {
                "input": "3 2\n5 3 2",
                "output": "80.00%",
                "explanation": "(5+3) / 10 = 80.00%"
          },
          {
                "input": "2 1\n7 3",
                "output": "70.00%",
                "explanation": "7 / 10 = 70.00%"
          },
          {
                "input": "1 1\n100",
                "output": "100.00%",
                "explanation": "Single eigenvalue 100%"
          },
          {
                "input": "4 2\n40 30 20 10",
                "output": "70.00%",
                "explanation": "(40+30)/100 = 70.00%"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const OS_PLACEMENT_PATTERNS = [
  {
    id: 601,
    patternName: "Cache Replacement",
    title: "OPERATING SYSTEMS Placement 1: LRU Cache Eviction Simulator",
    slug: "placement-pattern-os-1-lru-cache-eviction-simulator",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Simulate LRU cache replacement algorithm and return total Page Faults count.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 7\n1 2 3 4 1 2 5",
                "output": "Page Faults: 6",
                "explanation": "6 page faults occurred"
          },
          {
                "input": "2 4\n1 1 1 1",
                "output": "Page Faults: 1",
                "explanation": "Initial fault only"
          },
          {
                "input": "1 3\n1 2 3",
                "output": "Page Faults: 3",
                "explanation": "3 page faults"
          },
          {
                "input": "3 4\n1 2 3 1",
                "output": "Page Faults: 3",
                "explanation": "1 hit, 3 faults"
          },
          {
                "input": "4 5\n1 2 3 4 5",
                "output": "Page Faults: 5",
                "explanation": "5 page faults"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 602,
    patternName: "CPU Scheduling",
    title: "OPERATING SYSTEMS Placement 2: FCFS (First Come First Serve) CPU Scheduling",
    slug: "placement-pattern-os-2-fcfs-cpu-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Calculate average waiting time for N processes under FCFS scheduling.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n0 24\n0 3\n0 3",
                "output": "Average Waiting Time: 17.00",
                "explanation": "WT: P1=0, P2=24, P3=27. Avg = 51/3 = 17.00"
          },
          {
                "input": "1\n0 10",
                "output": "Average Waiting Time: 0.00",
                "explanation": "Single process"
          },
          {
                "input": "3\n0 5\n0 5\n0 5",
                "output": "Average Waiting Time: 5.00",
                "explanation": "WT: 0, 5, 10 -> Avg = 5.00"
          },
          {
                "input": "2\n0 4\n0 8",
                "output": "Average Waiting Time: 2.00",
                "explanation": "WT: 0, 4 -> Avg 2.00"
          },
          {
                "input": "4\n0 2\n0 2\n0 2\n0 2",
                "output": "Average Waiting Time: 3.00",
                "explanation": "WT: 0, 2, 4, 6 -> Avg 3.00"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 603,
    patternName: "CPU Scheduling",
    title: "OPERATING SYSTEMS Placement 3: SJF (Shortest Job First) Scheduling Non-Preemptive",
    slug: "placement-pattern-os-3-sjf-cpu-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Calculate average waiting time under non-preemptive SJF.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4\n6 8 7 3",
                "output": "Average Waiting Time: 7.00",
                "explanation": "Order: 3, 6, 7, 8. WT: 0, 3, 9, 16 -> Avg = 28/4 = 7.00"
          },
          {
                "input": "1\n5",
                "output": "Average Waiting Time: 0.00",
                "explanation": "Single process"
          },
          {
                "input": "3\n10 5 1",
                "output": "Average Waiting Time: 2.33",
                "explanation": "Order: 1, 5, 10. WT: 0, 1, 6 -> Avg = 2.33"
          },
          {
                "input": "2\n4 2",
                "output": "Average Waiting Time: 1.00",
                "explanation": "Order: 2, 4. WT: 0, 2 -> Avg 1.00"
          },
          {
                "input": "3\n3 3 3",
                "output": "Average Waiting Time: 3.00",
                "explanation": "WT: 0, 3, 6 -> Avg 3.00"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 604,
    patternName: "CPU Scheduling",
    title: "OPERATING SYSTEMS Placement 4: Round Robin CPU Scheduling (Quantum Q)",
    slug: "placement-pattern-os-4-round-robin-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Calculate average turnaround time (TAT) under Round Robin with quantum Q.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 2\n5 4 2",
                "output": "Average Turnaround Time: 9.33",
                "explanation": "RR execution with Q=2"
          },
          {
                "input": "1 5\n10",
                "output": "Average Turnaround Time: 10.00",
                "explanation": "Single process"
          },
          {
                "input": "2 3\n3 6",
                "output": "Average Turnaround Time: 6.00",
                "explanation": "RR execution"
          },
          {
                "input": "3 1\n2 2 2",
                "output": "Average Turnaround Time: 5.00",
                "explanation": "Q=1 Round Robin"
          },
          {
                "input": "2 4\n4 4",
                "output": "Average Turnaround Time: 6.00",
                "explanation": "Round Robin TAT"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 605,
    patternName: "CPU Scheduling",
    title: "OPERATING SYSTEMS Placement 5: Priority CPU Scheduling (Non-Preemptive)",
    slug: "placement-pattern-os-5-priority-cpu-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Calculate average waiting time ordered by highest priority (lower number = higher priority).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\n10 3\n1 1\n2 2",
                "output": "Average Waiting Time: 0.67",
                "explanation": "Executed in priority order 1, 2, 3"
          },
          {
                "input": "1\n5 1",
                "output": "Average Waiting Time: 0.00",
                "explanation": "Single process"
          },
          {
                "input": "2\n4 2\n8 1",
                "output": "Average Waiting Time: 4.00",
                "explanation": "P2 (pri 1) first, then P1"
          },
          {
                "input": "3\n2 1\n2 1\n2 1",
                "output": "Average Waiting Time: 2.00",
                "explanation": "Equal priorities"
          },
          {
                "input": "3\n5 3\n5 2\n5 1",
                "output": "Average Waiting Time: 5.00",
                "explanation": "Executed 3, 2, 1"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 606,
    patternName: "Deadlock Avoidance",
    title: "OPERATING SYSTEMS Placement 6: Banker's Algorithm Safety Check",
    slug: "placement-pattern-os-6-bankers-algorithm-safety",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Determine if system state is safe and output safe sequence.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5 3\n0 1 0 7 5 3\n2 0 0 3 2 2\n3 0 2 9 0 2\n2 1 1 2 2 2\n0 0 2 4 3 3\n3 3 2",
                "output": "Safe Sequence: P1 P3 P4 P0 P2",
                "explanation": "System is in a safe state"
          },
          {
                "input": "1 1\n5 5 10\n0",
                "output": "Unsafe State",
                "explanation": "Allocation exceeds available"
          },
          {
                "input": "2 1\n2 4 1\n1 2 0",
                "output": "Safe Sequence: P0 P1",
                "explanation": "Safe state"
          },
          {
                "input": "2 1\n3 5 0\n2 4 0",
                "output": "Unsafe State",
                "explanation": "Insufficient available resources"
          },
          {
                "input": "1 1\n1 2 5",
                "output": "Safe Sequence: P0",
                "explanation": "Safe state"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 607,
    patternName: "Page Replacement",
    title: "OPERATING SYSTEMS Placement 7: FIFO Page Replacement Algorithm",
    slug: "placement-pattern-os-7-fifo-page-replacement",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Calculate total Page Faults using First-In-First-Out replacement.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 7\n1 3 0 3 5 6 3",
                "output": "Page Faults: 6",
                "explanation": "6 page faults"
          },
          {
                "input": "3 4\n1 1 1 1",
                "output": "Page Faults: 1",
                "explanation": "Initial fault"
          },
          {
                "input": "4 4\n1 2 3 4",
                "output": "Page Faults: 4",
                "explanation": "All miss"
          },
          {
                "input": "3 6\n7 0 1 2 0 3",
                "output": "Page Faults: 6",
                "explanation": "FIFO faults"
          },
          {
                "input": "2 4\n1 2 1 2",
                "output": "Page Faults: 2",
                "explanation": "2 initial faults"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 608,
    patternName: "Page Replacement",
    title: "OPERATING SYSTEMS Placement 8: Optimal Page Replacement Algorithm",
    slug: "placement-pattern-os-8-optimal-page-replacement",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Calculate minimal Page Faults replacing page not used for longest future time.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 7\n7 0 1 2 0 3 0",
                "output": "Page Faults: 5",
                "explanation": "Optimal page faults"
          },
          {
                "input": "2 3\n1 2 1",
                "output": "Page Faults: 2",
                "explanation": "Initial faults"
          },
          {
                "input": "3 4\n1 2 3 1",
                "output": "Page Faults: 3",
                "explanation": "Optimal replacement"
          },
          {
                "input": "4 5\n1 2 3 4 5",
                "output": "Page Faults: 5",
                "explanation": "5 page faults"
          },
          {
                "input": "1 3\n1 2 1",
                "output": "Page Faults: 2",
                "explanation": "Page faults 2"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 609,
    patternName: "Synchronization",
    title: "OPERATING SYSTEMS Placement 9: Producer-Consumer Semaphore Buffer Check",
    slug: "placement-pattern-os-9-producer-consumer-semaphore",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Simulate buffer count after sequence of produce (P) and consume (C) operations on buffer capacity N.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5 6\nP P P C P C",
                "output": "Buffer Count: 2",
                "explanation": "Produced 4, consumed 2 -> count 2"
          },
          {
                "input": "2 3\nP P P",
                "output": "Buffer Full (Count: 2)",
                "explanation": "Buffer capped at 2"
          },
          {
                "input": "3 2\nC C",
                "output": "Buffer Empty (Count: 0)",
                "explanation": "Cannot consume from empty buffer"
          },
          {
                "input": "10 4\nP P P P",
                "output": "Buffer Count: 4",
                "explanation": "Count 4"
          },
          {
                "input": "3 4\nP P C C",
                "output": "Buffer Count: 0",
                "explanation": "Count 0"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 610,
    patternName: "Synchronization",
    title: "OPERATING SYSTEMS Placement 10: Reader-Writer Lock Preference Check",
    slug: "placement-pattern-os-10-reader-writer-lock-sync",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Determine if operation is granted under Readers-Preference lock rule.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3\nR R W",
                "output": "Granted: R R, Waiting: W",
                "explanation": "Multiple readers allowed, writer waits"
          },
          {
                "input": "2\nW R",
                "output": "Granted: W, Waiting: R",
                "explanation": "Exclusive writer lock"
          },
          {
                "input": "2\nR R",
                "output": "Granted: R R, Waiting: None",
                "explanation": "Shared reader locks"
          },
          {
                "input": "2\nW W",
                "output": "Granted: W1, Waiting: W2",
                "explanation": "Sequential writers"
          },
          {
                "input": "3\nR W R",
                "output": "Granted: R1, Waiting: W R2",
                "explanation": "Writer blocks subsequent readers"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 611,
    patternName: "Deadlock Detection",
    title: "OPERATING SYSTEMS Placement 11: Dining Philosophers Deadlock Condition",
    slug: "placement-pattern-os-11-dining-philosophers-deadlock",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Detect if deadlock occurs when N philosophers pick up left chopstick first.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "5\nL L L L L",
                "output": "Deadlock Detected",
                "explanation": "Circular wait condition"
          },
          {
                "input": "5\nL R L R L",
                "output": "No Deadlock",
                "explanation": "Asymmetric chopstick pick prevents deadlock"
          },
          {
                "input": "2\nL L",
                "output": "Deadlock Detected",
                "explanation": "2 philosopher circular wait"
          },
          {
                "input": "3\nL R L",
                "output": "No Deadlock",
                "explanation": "No circular wait"
          },
          {
                "input": "4\nL L L L",
                "output": "Deadlock Detected",
                "explanation": "All hold left chopstick"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 612,
    patternName: "Memory Management",
    title: "OPERATING SYSTEMS Placement 12: Worst Fit Memory Allocation",
    slug: "placement-pattern-os-12-worst-fit-memory-alloc",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Allocate process of size S into largest free partition block.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 3\n100 500 200 300\n212 417 112",
                "output": "P1->500, P2->Unallocated, P3->300",
                "explanation": "Worst fit allocates to max partition"
          },
          {
                "input": "2 1\n100 200\n150",
                "output": "P1->200",
                "explanation": "Allocated to 200"
          },
          {
                "input": "1 1\n50\n100",
                "output": "P1->Unallocated",
                "explanation": "Block too small"
          },
          {
                "input": "3 2\n10 20 30\n5 25",
                "output": "P1->30, P2->Unallocated",
                "explanation": "30 partition used"
          },
          {
                "input": "2 2\n500 500\n200 200",
                "output": "P1->500, P2->500",
                "explanation": "Allocated to both"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 613,
    patternName: "Memory Management",
    title: "OPERATING SYSTEMS Placement 13: First Fit Memory Allocation",
    slug: "placement-pattern-os-13-first-fit-memory-alloc",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Allocate process of size S into first free partition block big enough.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 3\n100 500 200 300\n212 417 112",
                "output": "P1->500, P2->Unallocated, P3->200",
                "explanation": "First fit allocates to first sufficient block"
          },
          {
                "input": "2 1\n200 100\n150",
                "output": "P1->200",
                "explanation": "Allocated to 200"
          },
          {
                "input": "1 1\n10\n20",
                "output": "P1->Unallocated",
                "explanation": "Insufficient space"
          },
          {
                "input": "3 2\n50 100 150\n40 90",
                "output": "P1->50, P2->100",
                "explanation": "Allocated sequentially"
          },
          {
                "input": "2 2\n300 300\n100 100",
                "output": "P1->300, P2->300",
                "explanation": "Allocated to first fit"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 614,
    patternName: "Memory Management",
    title: "OPERATING SYSTEMS Placement 14: Best Fit Memory Allocation",
    slug: "placement-pattern-os-14-best-fit-memory-alloc",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Allocate process of size S into smallest free partition block big enough.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "4 3\n100 500 200 300\n212 417 112",
                "output": "P1->300, P2->500, P3->200",
                "explanation": "Best fit minimizes internal fragmentation"
          },
          {
                "input": "2 1\n500 200\n150",
                "output": "P1->200",
                "explanation": "Best fit is 200"
          },
          {
                "input": "1 1\n30\n50",
                "output": "P1->Unallocated",
                "explanation": "Unallocated"
          },
          {
                "input": "3 2\n100 200 300\n90 190",
                "output": "P1->100, P2->200",
                "explanation": "Exact best fit"
          },
          {
                "input": "2 2\n100 200\n50 150",
                "output": "P1->100, P2->200",
                "explanation": "Best fit blocks"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 615,
    patternName: "Disk Scheduling",
    title: "OPERATING SYSTEMS Placement 15: SSTF (Shortest Seek Time First) Disk Scheduling",
    slug: "placement-pattern-os-15-sstf-disk-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Calculate total head movement under SSTF disk scheduling starting at head H.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "53 8\n98 183 37 122 14 124 65 67",
                "output": "Total Seek Count: 236",
                "explanation": "SSTF total head distance"
          },
          {
                "input": "50 2\n45 55",
                "output": "Total Seek Count: 15",
                "explanation": "50->55->45 total 15"
          },
          {
                "input": "0 1\n100",
                "output": "Total Seek Count: 100",
                "explanation": "Distance 100"
          },
          {
                "input": "10 3\n10 20 30",
                "output": "Total Seek Count: 20",
                "explanation": "Direct sequence"
          },
          {
                "input": "50 3\n50 50 50",
                "output": "Total Seek Count: 0",
                "explanation": "Zero movement"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 616,
    patternName: "Disk Scheduling",
    title: "OPERATING SYSTEMS Placement 16: SCAN (Elevator) Disk Scheduling Algorithm",
    slug: "placement-pattern-os-16-scan-elevator-disk-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Calculate total seek count under SCAN towards higher disk track up to max track M.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "53 200 8\n98 183 37 122 14 124 65 67",
                "output": "Total Seek Count: 331",
                "explanation": "SCAN moves right to 199 then left"
          },
          {
                "input": "50 100 2\n10 90",
                "output": "Total Seek Count: 138",
                "explanation": "SCAN total movement"
          },
          {
                "input": "0 100 1\n50",
                "output": "Total Seek Count: 50",
                "explanation": "Direct scan"
          },
          {
                "input": "10 100 2\n20 30",
                "output": "Total Seek Count: 179",
                "explanation": "SCAN movement"
          },
          {
                "input": "50 50 1\n50",
                "output": "Total Seek Count: 0",
                "explanation": "Zero seek count"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 617,
    patternName: "Disk Scheduling",
    title: "OPERATING SYSTEMS Placement 17: C-SCAN Disk Scheduling Algorithm",
    slug: "placement-pattern-os-17-c-scan-disk-scheduling",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Calculate total seek count under Circular SCAN wrapping from max track M back to 0.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "53 200 8\n98 183 37 122 14 124 65 67",
                "output": "Total Seek Count: 382",
                "explanation": "C-SCAN wraps around disk end"
          },
          {
                "input": "50 100 2\n10 90",
                "output": "Total Seek Count: 158",
                "explanation": "C-SCAN total seek count"
          },
          {
                "input": "0 100 1\n50",
                "output": "Total Seek Count: 50",
                "explanation": "Direct move"
          },
          {
                "input": "10 100 2\n20 30",
                "output": "Total Seek Count: 110",
                "explanation": "C-SCAN seek count"
          },
          {
                "input": "50 50 1\n50",
                "output": "Total Seek Count: 0",
                "explanation": "Zero seek"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 618,
    patternName: "Process Management",
    title: "OPERATING SYSTEMS Placement 18: Shell Command Pipeline Simulation (cmd1 | cmd2)",
    slug: "placement-pattern-os-18-shell-pipe-cmd-simulation",
    subject: "OPERATING SYSTEMS",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Simulate Unix pipe output passing stdout of cmd1 to stdin of cmd2.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "cat input.txt | grep error",
                "output": "Pipeline Executed: 2 Processes Forked",
                "explanation": "Pipe creates 2 child processes"
          },
          {
                "input": "ls -l | grep .js | wc -l",
                "output": "Pipeline Executed: 3 Processes Forked",
                "explanation": "Pipe creates 3 processes"
          },
          {
                "input": "echo hello",
                "output": "Single Command Executed",
                "explanation": "No pipe present"
          },
          {
                "input": "ps aux | grep node",
                "output": "Pipeline Executed: 2 Processes Forked",
                "explanation": "2 process pipe"
          },
          {
                "input": "history | tail -n 5",
                "output": "Pipeline Executed: 2 Processes Forked",
                "explanation": "2 process pipe"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 619,
    patternName: "State Machine",
    title: "OPERATING SYSTEMS Placement 19: Process State Transition Validation",
    slug: "placement-pattern-os-19-process-state-transition-valid",
    subject: "OPERATING SYSTEMS",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Validate if state transition sequence (New->Ready->Running->Terminated) is valid.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "New Ready Running Terminated",
                "output": "Valid Transition Sequence",
                "explanation": "Standard process lifecycle"
          },
          {
                "input": "New Running Terminated",
                "output": "Invalid State Transition",
                "explanation": "Must go through Ready first"
          },
          {
                "input": "New Ready Running Waiting Ready Running Terminated",
                "output": "Valid Transition Sequence",
                "explanation": "I/O wait loop valid"
          },
          {
                "input": "Running New",
                "output": "Invalid State Transition",
                "explanation": "Cannot return to New"
          },
          {
                "input": "New Ready Terminated",
                "output": "Invalid State Transition",
                "explanation": "Cannot terminate directly from Ready"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 620,
    patternName: "Deadlock Detection",
    title: "OPERATING SYSTEMS Placement 20: Resource Allocation Graph (RAG) Cycle Check",
    slug: "placement-pattern-os-20-rag-graph-cycle-check",
    subject: "OPERATING SYSTEMS",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Detect cycle in Resource Allocation Graph for single-instance resources.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "3 3\nP1 R1\nR1 P2\nP2 R1",
                "output": "Deadlock Detected (Cycle Found)",
                "explanation": "RAG contains cycle"
          },
          {
                "input": "2 2\nP1 R1\nP2 R2",
                "output": "No Deadlock",
                "explanation": "No cycle in graph"
          },
          {
                "input": "3 2\nP1 R1\nR1 P2\nP2 R2",
                "output": "No Deadlock",
                "explanation": "Linear dependency"
          },
          {
                "input": "2 1\nP1 R1\nR1 P1",
                "output": "Deadlock Detected (Cycle Found)",
                "explanation": "2-node cycle"
          },
          {
                "input": "1 1\nP1 R1",
                "output": "No Deadlock",
                "explanation": "Single edge"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const LATEX_PLACEMENT_PATTERNS = [
  {
    id: 701,
    patternName: "LaTeX Document Structure",
    title: "LATEX Placement 1: IEEE Paper Document Structure Parser",
    slug: "placement-pattern-latex-1-ieee-paper-parser",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Validate required IEEE LaTeX tags \\documentclass{IEEEtran} and \\begin{abstract}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\documentclass{IEEEtran}\\begin{abstract}Text\\end{abstract}\\section{Intro}",
                "output": "Valid IEEE Document",
                "explanation": "Contains required tags"
          },
          {
                "input": "\\documentclass{article}\\section{Main}",
                "output": "Invalid Document Structure",
                "explanation": "Missing IEEEtran"
          },
          {
                "input": "\\documentclass{IEEEtran}\\section{Start}",
                "output": "Valid IEEE Document",
                "explanation": "Contains IEEEtran"
          },
          {
                "input": "Plain text without LaTeX tags",
                "output": "Invalid Document Structure",
                "explanation": "No tags"
          },
          {
                "input": "\\documentclass{IEEEtran}\\begin{abstract}Text\\end{abstract}",
                "output": "Valid IEEE Document",
                "explanation": "Valid"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 702,
    patternName: "Tag Matching",
    title: "LATEX Placement 2: Validate Unbalanced Environment Tags (\\begin & \\end)",
    slug: "placement-pattern-latex-2-unbalanced-environment-tags-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Check if all \\begin{env} have matching \\end{env} in correct order using Stack.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{document}\\begin{figure}\\end{figure}\\end{document}",
                "output": "Balanced Environments",
                "explanation": "All tags matched"
          },
          {
                "input": "\\begin{document}\\begin{equation}\\end{document}",
                "output": "Unbalanced Environments",
                "explanation": "Mismatch equation vs document"
          },
          {
                "input": "\\begin{center}\\end{center}",
                "output": "Balanced Environments",
                "explanation": "Balanced"
          },
          {
                "input": "\\end{document}",
                "output": "Unbalanced Environments",
                "explanation": "Missing begin"
          },
          {
                "input": "\\begin{table}\\begin{tabular}\\end{tabular}\\end{table}",
                "output": "Balanced Environments",
                "explanation": "Nested environments balanced"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 703,
    patternName: "Regex Counting",
    title: "LATEX Placement 3: Count Math Formulas and Equations",
    slug: "placement-pattern-latex-3-count-math-formulas-latex",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Count inline math ($...$) and equation environments (\\begin{equation}).",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "The energy $E=mc^2$ is defined in \\begin{equation}E=mc^2\\end{equation}",
                "output": "Inline Math: 1, Display Equations: 1",
                "explanation": "1 inline, 1 equation"
          },
          {
                "input": "No math here",
                "output": "Inline Math: 0, Display Equations: 0",
                "explanation": "Zero math"
          },
          {
                "input": "$a+b$ and $c+d$",
                "output": "Inline Math: 2, Display Equations: 0",
                "explanation": "2 inline math"
          },
          {
                "input": "\\begin{equation}x=1\\end{equation}\\begin{equation}y=2\\end{equation}",
                "output": "Inline Math: 0, Display Equations: 2",
                "explanation": "2 equations"
          },
          {
                "input": "Formula $x$ in \\begin{equation}y\\end{equation} and $z$",
                "output": "Inline Math: 2, Display Equations: 1",
                "explanation": "2 inline, 1 display"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 704,
    patternName: "String Extraction",
    title: "LATEX Placement 4: Extract Section Titles from Source",
    slug: "placement-pattern-latex-4-extract-section-titles-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Extract all titles enclosed in \\section{title} commands.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\section{Introduction}\\section{Related Work}\\section{Methodology}",
                "output": "1. Introduction\n2. Related Work\n3. Methodology",
                "explanation": "Extracted section titles"
          },
          {
                "input": "\\section{Abstract}",
                "output": "1. Abstract",
                "explanation": "Single section"
          },
          {
                "input": "No sections present",
                "output": "None",
                "explanation": "Zero sections"
          },
          {
                "input": "\\section{Background}\\section{Conclusion}",
                "output": "1. Background\n2. Conclusion",
                "explanation": "2 sections"
          },
          {
                "input": "\\section{System Architecture}",
                "output": "1. System Architecture",
                "explanation": "1 section"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 705,
    patternName: "Table Column Validator",
    title: "LATEX Placement 5: Table Column Alignment Syntax Validator",
    slug: "placement-pattern-latex-5-table-column-validator-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Check if number of tabular columns specified matches column specifiers {c|c|c}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{tabular}{|c|c|c|}\na & b & c \\\\\n\\end{tabular}",
                "output": "Valid Tabular Syntax (3 Columns)",
                "explanation": "3 column specifiers match 3 columns"
          },
          {
                "input": "\\begin{tabular}{cc}\na & b & c \\\\\n\\end{tabular}",
                "output": "Invalid Tabular Syntax (Column Mismatch)",
                "explanation": "2 specifiers vs 3 data columns"
          },
          {
                "input": "\\begin{tabular}{l}\nx \\\\\n\\end{tabular}",
                "output": "Valid Tabular Syntax (1 Columns)",
                "explanation": "1 column match"
          },
          {
                "input": "\\begin{tabular}{r|l}\n1 & 2 \\\\\n\\end{tabular}",
                "output": "Valid Tabular Syntax (2 Columns)",
                "explanation": "2 column match"
          },
          {
                "input": "\\begin{tabular}{c}\n1 & 2 \\\\\n\\end{tabular}",
                "output": "Invalid Tabular Syntax (Column Mismatch)",
                "explanation": "Mismatch"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 706,
    patternName: "Regex Extraction",
    title: "LATEX Placement 6: Citation Key Extractor (\\cite{key})",
    slug: "placement-pattern-latex-6-citation-key-extractor-latex",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Extract all citation keys enclosed inside \\cite{key1, key2}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "As shown in \\cite{smith2020, johnson2021} and \\cite{lee2022}.",
                "output": "smith2020\njohnson2021\nlee2022",
                "explanation": "Extracted 3 citation keys"
          },
          {
                "input": "No citations here",
                "output": "None",
                "explanation": "No citations"
          },
          {
                "input": "\\cite{ref1}",
                "output": "ref1",
                "explanation": "Single citation"
          },
          {
                "input": "\\cite{a, b, c}",
                "output": "a\nb\nc",
                "explanation": "Multiple citations"
          },
          {
                "input": "Refer to \\cite{paper123}",
                "output": "paper123",
                "explanation": "Single key"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 707,
    patternName: "Caption Extraction",
    title: "LATEX Placement 7: Figure Environment Caption Parser",
    slug: "placement-pattern-latex-7-figure-caption-parser-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Extract image caption inside \\caption{text} within \\begin{figure}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{figure}\\caption{System Architecture Diagram}\\end{figure}",
                "output": "Caption: System Architecture Diagram",
                "explanation": "Parsed caption text"
          },
          {
                "input": "\\begin{figure}\\end{figure}",
                "output": "Caption: None",
                "explanation": "No caption"
          },
          {
                "input": "\\caption{Standalone Caption}",
                "output": "Caption: Standalone Caption",
                "explanation": "Extracted caption"
          },
          {
                "input": "\\begin{figure}\\caption{Fig 1: Experimental Results}\\end{figure}",
                "output": "Caption: Fig 1: Experimental Results",
                "explanation": "Parsed figure caption"
          },
          {
                "input": "No figure",
                "output": "Caption: None",
                "explanation": "None"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 708,
    patternName: "Item Counter",
    title: "LATEX Placement 8: Bibliography Item Counter (\\bibitem)",
    slug: "placement-pattern-latex-8-bibitem-counter-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Count total number of \\bibitem entries in the bibliography section.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{thebibliography}\n\\bibitem{ref1} Author 1\n\\bibitem{ref2} Author 2\n\\end{thebibliography}",
                "output": "Total References: 2",
                "explanation": "2 bibitem entries"
          },
          {
                "input": "\\begin{thebibliography}\\end{thebibliography}",
                "output": "Total References: 0",
                "explanation": "0 references"
          },
          {
                "input": "\\bibitem{a}\n\\bibitem{b}\n\\bibitem{c}",
                "output": "Total References: 3",
                "explanation": "3 bibitems"
          },
          {
                "input": "Plain text",
                "output": "Total References: 0",
                "explanation": "0 references"
          },
          {
                "input": "\\bibitem{single}",
                "output": "Total References: 1",
                "explanation": "1 reference"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 709,
    patternName: "Comment Stripper",
    title: "LATEX Placement 9: Remove LaTeX Comment Lines (% text)",
    slug: "placement-pattern-latex-9-remove-latex-comments",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Strip out all comment text starting with % up to end of line.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "Hello World % this is a comment\nNext Line",
                "output": "Hello World\nNext Line",
                "explanation": "Comments stripped"
          },
          {
                "input": "% Full comment line\nActual Code",
                "output": "Actual Code",
                "explanation": "Full comment line removed"
          },
          {
                "input": "No comments",
                "output": "No comments",
                "explanation": "Unchanged"
          },
          {
                "input": "Line 1 % comment 1\nLine 2 % comment 2",
                "output": "Line 1\nLine 2",
                "explanation": "Comments removed"
          },
          {
                "input": "% Only comment",
                "output": "",
                "explanation": "Empty output"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 710,
    patternName: "Math Syntax Check",
    title: "LATEX Placement 10: Validate Matrix Brackets in Math Mode",
    slug: "placement-pattern-latex-10-matrix-bracket-validator-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Validate matching \\begin{pmatrix} or \\begin{bmatrix} with \\end{pmatrix} or \\end{bmatrix}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}",
                "output": "Valid Matrix Syntax",
                "explanation": "Matching pmatrix environment"
          },
          {
                "input": "\\begin{bmatrix} 1 & 2 \\end{pmatrix}",
                "output": "Invalid Matrix Syntax",
                "explanation": "Mismatch bmatrix vs pmatrix"
          },
          {
                "input": "\\begin{bmatrix} a \\end{bmatrix}",
                "output": "Valid Matrix Syntax",
                "explanation": "Valid bmatrix"
          },
          {
                "input": "\\end{pmatrix}",
                "output": "Invalid Matrix Syntax",
                "explanation": "Missing begin"
          },
          {
                "input": "\\begin{matrix} 1 & 2 \\\\ 3 & 4 \\end{matrix}",
                "output": "Valid Matrix Syntax",
                "explanation": "Valid matrix"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 711,
    patternName: "Header Extractor",
    title: "LATEX Placement 11: Extract Subsections and Subsubsections",
    slug: "placement-pattern-latex-11-extract-subsections-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "98% Placement Frequency",
    description: "Extract all \\subsection{title} and \\subsubsection{title} headings.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\subsection{Background}\\subsubsection{Related Work}",
                "output": "Subsection: Background\nSubsubsection: Related Work",
                "explanation": "Extracted subsection hierarchy"
          },
          {
                "input": "\\subsection{Overview}",
                "output": "Subsection: Overview",
                "explanation": "Single subsection"
          },
          {
                "input": "No subsections",
                "output": "None",
                "explanation": "None"
          },
          {
                "input": "\\subsubsection{Detail 1}\\subsubsection{Detail 2}",
                "output": "Subsubsection: Detail 1\nSubsubsection: Detail 2",
                "explanation": "Subsubsections"
          },
          {
                "input": "\\subsection{Methods}",
                "output": "Subsection: Methods",
                "explanation": "1 subsection"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 712,
    patternName: "Footnote Parser",
    title: "LATEX Placement 12: Footnote Syntax Validator (\\footnote{})",
    slug: "placement-pattern-latex-12-footnote-syntax-validator-latex",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "97% Placement Frequency",
    description: "Extract and count all footnotes in document source.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "Text with a footnote\\footnote{See details in appendix}.",
                "output": "Footnotes (1): See details in appendix",
                "explanation": "1 footnote extracted"
          },
          {
                "input": "No footnotes",
                "output": "Footnotes (0): None",
                "explanation": "0 footnotes"
          },
          {
                "input": "A\\footnote{Note 1} and B\\footnote{Note 2}.",
                "output": "Footnotes (2): Note 1; Note 2",
                "explanation": "2 footnotes"
          },
          {
                "input": "Sample\\footnote{Test}",
                "output": "Footnotes (1): Test",
                "explanation": "1 footnote"
          },
          {
                "input": "Text",
                "output": "Footnotes (0): None",
                "explanation": "None"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 713,
    patternName: "Hyperlink Parser",
    title: "LATEX Placement 13: Hyperref Link Parser (\\href{url}{text})",
    slug: "placement-pattern-latex-13-href-link-parser-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Extract target URL and display text from \\href{url}{text}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "Visit \\href{https://google.com}{Google} for search.",
                "output": "URL: https://google.com, Text: Google",
                "explanation": "Extracted link"
          },
          {
                "input": "No links",
                "output": "None",
                "explanation": "No href tags"
          },
          {
                "input": "\\href{https://vtu.ac.in}{VTU Website}",
                "output": "URL: https://vtu.ac.in, Text: VTU Website",
                "explanation": "Extracted VTU link"
          },
          {
                "input": "\\href{http://a.b}{Link}",
                "output": "URL: http://a.b, Text: Link",
                "explanation": "Extracted link"
          },
          {
                "input": "Check \\href{https://github.com}{GitHub}",
                "output": "URL: https://github.com, Text: GitHub",
                "explanation": "Extracted link"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 714,
    patternName: "Macro Detector",
    title: "LATEX Placement 14: Custom Macro Detector (\\newcommand)",
    slug: "placement-pattern-latex-14-custom-macro-detector-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "95% Placement Frequency",
    description: "Extract custom macro names defined via \\newcommand{\\macroname}{definition}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\newcommand{\\R}{\\mathbb{R}}\n\\newcommand{\\bold}[1]{\\textbf{#1}}",
                "output": "Defined Macros: \\R, \\bold",
                "explanation": "Extracted defined macros"
          },
          {
                "input": "No custom macros",
                "output": "Defined Macros: None",
                "explanation": "None"
          },
          {
                "input": "\\newcommand{\\vector}[1]{\\vec{#1}}",
                "output": "Defined Macros: \\vector",
                "explanation": "Extracted \\vector"
          },
          {
                "input": "\\newcommand{\\X}{X}",
                "output": "Defined Macros: \\X",
                "explanation": "Extracted \\X"
          },
          {
                "input": "\\newcommand{\\A}{A}\n\\newcommand{\\B}{B}",
                "output": "Defined Macros: \\A, \\B",
                "explanation": "Extracted macros"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 715,
    patternName: "Presentation Frames",
    title: "LATEX Placement 15: Beamer Slide Frame Counter (\\begin{frame})",
    slug: "placement-pattern-latex-15-beamer-slide-frame-counter",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "94% Placement Frequency",
    description: "Count total slide frames in a LaTeX Beamer presentation.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{frame}\\frametitle{Slide 1}\\end{frame}\n\\begin{frame}\\frametitle{Slide 2}\\end{frame}",
                "output": "Total Beamer Frames: 2",
                "explanation": "2 frames counted"
          },
          {
                "input": "No slides",
                "output": "Total Beamer Frames: 0",
                "explanation": "0 frames"
          },
          {
                "input": "\\begin{frame}\\end{frame}",
                "output": "Total Beamer Frames: 1",
                "explanation": "1 frame"
          },
          {
                "input": "\\begin{frame}\\end{frame}\\begin{frame}\\end{frame}\\begin{frame}\\end{frame}",
                "output": "Total Beamer Frames: 3",
                "explanation": "3 frames"
          },
          {
                "input": "Document text",
                "output": "Total Beamer Frames: 0",
                "explanation": "0 frames"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 716,
    patternName: "Drawing Environment",
    title: "LATEX Placement 16: TikZ Diagram Environment Validator",
    slug: "placement-pattern-latex-16-tikz-diagram-validator-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "93% Placement Frequency",
    description: "Check if \\begin{tikzpicture} has matching \\end{tikzpicture}.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{tikzpicture}\\draw (0,0) -- (1,1);\\end{tikzpicture}",
                "output": "Valid TikZ Diagram",
                "explanation": "Balanced tikzpicture"
          },
          {
                "input": "\\begin{tikzpicture}\\draw circle;",
                "output": "Invalid TikZ Diagram",
                "explanation": "Missing \\end{tikzpicture}"
          },
          {
                "input": "\\end{tikzpicture}",
                "output": "Invalid TikZ Diagram",
                "explanation": "Missing \\begin{tikzpicture}"
          },
          {
                "input": "\\begin{tikzpicture}\\node {A};\\end{tikzpicture}",
                "output": "Valid TikZ Diagram",
                "explanation": "Valid diagram"
          },
          {
                "input": "No diagrams",
                "output": "Invalid TikZ Diagram",
                "explanation": "No TikZ environment"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 717,
    patternName: "Preamble Package",
    title: "LATEX Placement 17: Preamble Package Extractor (\\usepackage{})",
    slug: "placement-pattern-latex-17-preamble-package-extractor",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "92% Placement Frequency",
    description: "Extract all included packages from \\usepackage{pkg1, pkg2} statements.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\usepackage{graphicx}\n\\usepackage{amsmath, amssymb}",
                "output": "Included Packages: graphicx, amsmath, amssymb",
                "explanation": "Extracted packages"
          },
          {
                "input": "No packages",
                "output": "Included Packages: None",
                "explanation": "None"
          },
          {
                "input": "\\usepackage{hyperref}",
                "output": "Included Packages: hyperref",
                "explanation": "Extracted hyperref"
          },
          {
                "input": "\\usepackage{tikz, xcolor}",
                "output": "Included Packages: tikz, xcolor",
                "explanation": "Extracted 2 packages"
          },
          {
                "input": "\\usepackage{cite}",
                "output": "Included Packages: cite",
                "explanation": "Extracted cite"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 718,
    patternName: "Formatting Parser",
    title: "LATEX Placement 18: Check Bold and Italic Syntax (\\textbf, \\textit)",
    slug: "placement-pattern-latex-18-check-bold-italic-formatting-latex",
    subject: "LATEX",
    difficulty: "Hard",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "91% Placement Frequency",
    description: "Validate balanced braces for \\textbf{text} and \\textit{text} formatting.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\textbf{Bold Text} and \\textit{Italic Text}",
                "output": "Valid Formatting Syntax",
                "explanation": "Balanced braces"
          },
          {
                "input": "\\textbf{Unclosed brace",
                "output": "Invalid Formatting Syntax",
                "explanation": "Unclosed brace"
          },
          {
                "input": "\\textit{Valid}",
                "output": "Valid Formatting Syntax",
                "explanation": "Valid italic"
          },
          {
                "input": "\\textbf{Nested \\textit{Text}}",
                "output": "Valid Formatting Syntax",
                "explanation": "Nested valid"
          },
          {
                "input": "\\textit{Mismatch}",
                "output": "Valid Formatting Syntax",
                "explanation": "Valid"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 719,
    patternName: "Code Block Parser",
    title: "LATEX Placement 19: Verbatim Environment Code Extractor",
    slug: "placement-pattern-latex-19-verbatim-code-extractor-latex",
    subject: "LATEX",
    difficulty: "Easy",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "90% Placement Frequency",
    description: "Extract raw text inside \\begin{verbatim}...\\end{verbatim} code block.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{verbatim}\nint x = 10;\nprintf(\"%d\", x);\n\\end{verbatim}",
                "output": "Extracted Code:\nint x = 10;\nprintf(\"%d\", x);",
                "explanation": "Raw code extracted"
          },
          {
                "input": "\\begin{verbatim}single line\\end{verbatim}",
                "output": "Extracted Code:\nsingle line",
                "explanation": "Single line verbatim"
          },
          {
                "input": "No verbatim block",
                "output": "Extracted Code: None",
                "explanation": "None"
          },
          {
                "input": "\\begin{verbatim}\nprint(\"Python\")\n\\end{verbatim}",
                "output": "Extracted Code:\nprint(\"Python\")",
                "explanation": "Python code extracted"
          },
          {
                "input": "\\begin{verbatim}\nSELECT * FROM db;\n\\end{verbatim}",
                "output": "Extracted Code:\nSELECT * FROM db;",
                "explanation": "SQL code extracted"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 720,
    patternName: "Math Environment",
    title: "LATEX Placement 20: Theorem & Lemma Environment Counter",
    slug: "placement-pattern-latex-20-theorem-lemma-counter-latex",
    subject: "LATEX",
    difficulty: "Medium",
    companyTags: ["Amazon","TCS Digital","Infosys SP","Cognizant","Microsoft"],
    frequency: "89% Placement Frequency",
    description: "Count total \\begin{theorem} and \\begin{lemma} occurrences in document.",
    input_format: "First line contains integer N followed by elements.",
    output_format: "Print expected output value.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
          {
                "input": "\\begin{theorem}Thm 1\\end{theorem}\n\\begin{lemma}Lem 1\\end{lemma}\n\\begin{theorem}Thm 2\\end{theorem}",
                "output": "Theorems: 2, Lemmas: 1",
                "explanation": "Counted 2 theorems and 1 lemma"
          },
          {
                "input": "No theorems",
                "output": "Theorems: 0, Lemmas: 0",
                "explanation": "0 counts"
          },
          {
                "input": "\\begin{theorem}T1\\end{theorem}",
                "output": "Theorems: 1, Lemmas: 0",
                "explanation": "1 theorem"
          },
          {
                "input": "\\begin{lemma}L1\\end{lemma}\\begin{lemma}L2\\end{lemma}",
                "output": "Theorems: 0, Lemmas: 2",
                "explanation": "2 lemmas"
          },
          {
                "input": "\\begin{theorem}T\\end{theorem}\\begin{lemma}L\\end{lemma}",
                "output": "Theorems: 1, Lemmas: 1",
                "explanation": "1 of each"
          }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const DSA_PLACEMENT_PATTERNS = [
  {
    id: 161,
    patternName: "Linked List Reversal",
    title: "DSA Placement 1: Reverse Linked List",
    slug: "placement-pattern-dsa-1-reverse-linked-list",
    subject: "DSA",
    difficulty: "Easy",
    companyTags: ["Amazon", "Microsoft", "TCS", "Infosys"],
    frequency: "98% Placement Frequency",
    description: "Given a singly linked list represented as array elements, reverse the list and print elements in reversed order.",
    input_format: "First line N.\nSecond line N space-separated integers.",
    output_format: "Print reversed array of elements.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
      { input: "5\n1 2 3 4 5", output: "5 4 3 2 1", explanation: "Reversed elements" },
      { input: "3\n10 20 30", output: "30 20 10", explanation: "Reversed elements" },
      { input: "1\n42", output: "42", explanation: "Single element" },
      { input: "4\n-1 -2 -3 -4", output: "-4 -3 -2 -1", explanation: "Negative numbers" },
      { input: "2\n100 200", output: "200 100", explanation: "Two elements" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 162,
    patternName: "Graph DFS / BFS Cycle Detection",
    title: "DSA Placement 2: Cycle Detection in Directed Graph",
    slug: "placement-pattern-dsa-2-cycle-detection-graph",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Amazon", "Uber"],
    frequency: "96% Placement Frequency",
    description: "Given a directed graph with V vertices and E edges, return YES if graph contains a cycle, else NO.",
    input_format: "First line V and E.\nNext E lines contain u v representing directed edge u -> v.",
    output_format: "Print YES or NO.",
    constraints: "1 <= V, E <= 10^4",
    sample_cases: [
      { input: "4 4\n0 1\n1 2\n2 3\n3 1", output: "YES", explanation: "Cycle 1->2->3->1 exists" },
      { input: "3 2\n0 1\n1 2", output: "NO", explanation: "No cycle" },
      { input: "2 2\n0 1\n1 0", output: "YES", explanation: "Cycle 0->1->0" },
      { input: "1 0", output: "NO", explanation: "Single vertex without edge" },
      { input: "4 3\n0 1\n0 2\n0 3", output: "NO", explanation: "Star graph no cycle" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 163,
    patternName: "Tree Level Order BFS",
    title: "DSA Placement 3: Binary Tree Level Order Traversal",
    slug: "placement-pattern-dsa-3-level-order-traversal",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Meta", "Amazon", "Infosys"],
    frequency: "94% Placement Frequency",
    description: "Perform level order traversal (BFS) of a binary tree given in level order representation (-1 for NULL).",
    input_format: "First line contains array representation of binary tree (-1 for null).",
    output_format: "Print values visited level by level separated by space.",
    constraints: "1 <= N <= 10^4",
    sample_cases: [
      { input: "3 9 20 -1 -1 15 7", output: "3 9 20 15 7", explanation: "Nodes in level order" },
      { input: "1", output: "1", explanation: "Single root" },
      { input: "1 2 3 4 5", output: "1 2 3 4 5", explanation: "Full binary tree level traversal" },
      { input: "10 20 -1 30", output: "10 20 30", explanation: "Left skewed" },
      { input: "5 3 8 2 4 7 9", output: "5 3 8 2 4 7 9", explanation: "BST level order" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 164,
    patternName: "Lowest Common Ancestor BST",
    title: "DSA Placement 4: Lowest Common Ancestor in BST",
    slug: "placement-pattern-dsa-4-lowest-common-ancestor-bst",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Microsoft", "Amazon", "Oracle"],
    frequency: "92% Placement Frequency",
    description: "Find the Lowest Common Ancestor (LCA) node of two given nodes p and q in a Binary Search Tree (BST).",
    input_format: "First line contains N sorted elements of BST.\nSecond line contains two target node values p and q.",
    output_format: "Print value of LCA node.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
      { input: "6 2 8 0 4 7 9\n2 8", output: "6", explanation: "Root 6 is LCA of 2 and 8" },
      { input: "6 2 8 0 4 7 9\n2 4", output: "2", explanation: "Node 2 is ancestor of 4" },
      { input: "2 1 3\n1 3", output: "2", explanation: "Root 2 is LCA" },
      { input: "5 3 7 1 4\n1 4", output: "3", explanation: "Node 3 is LCA of 1 and 4" },
      { input: "10 5 15\n5 15", output: "10", explanation: "Root 10 is LCA" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 165,
    patternName: "Stack Parentheses Matcher",
    title: "DSA Placement 5: Valid Parentheses Evaluator",
    slug: "placement-pattern-dsa-5-valid-parentheses-stack",
    subject: "DSA",
    difficulty: "Easy",
    companyTags: ["TCS", "Infosys", "Wipro", "Amazon"],
    frequency: "99% Placement Frequency",
    description: "Given a string s containing characters '(', ')', '{', '}', '[' and ']', determine if input string is valid.",
    input_format: "Single line containing bracket string.",
    output_format: "Print true or false.",
    constraints: "1 <= |s| <= 10^4",
    sample_cases: [
      { input: "()[]{}", output: "true", explanation: "All matching brackets closed" },
      { input: "(]", output: "false", explanation: "Mismatched closing" },
      { input: "([{}])", output: "true", explanation: "Nested valid brackets" },
      { input: "(((", output: "false", explanation: "Unclosed opening brackets" },
      { input: "}", output: "false", explanation: "Closing without opening" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 166,
    patternName: "Queue using Stacks",
    title: "DSA Placement 6: Implement Queue using Two Stacks",
    slug: "placement-pattern-dsa-6-queue-using-two-stacks",
    subject: "DSA",
    difficulty: "Easy",
    companyTags: ["Amazon", "Goldman Sachs", "Cognizant"],
    frequency: "90% Placement Frequency",
    description: "Implement FIFO Queue using two stacks supporting push, pop, and peek operations.",
    input_format: "First line Q queries.\nEach query 1 x (enqueue) or 2 (dequeue).",
    output_format: "Print dequeued elements.",
    constraints: "1 <= Q <= 10^5",
    sample_cases: [
      { input: "5\n1 10\n1 20\n2\n1 30\n2", output: "10\n20", explanation: "FIFO order" },
      { input: "3\n1 5\n1 15\n2", output: "5", explanation: "Dequeue 5" },
      { input: "4\n1 1\n1 2\n1 3\n2", output: "1", explanation: "First in first out" },
      { input: "2\n1 100\n2", output: "100", explanation: "Single push and pop" },
      { input: "6\n1 7\n1 8\n2\n2\n1 9\n2", output: "7\n8\n9", explanation: "Sequential queue operations" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 167,
    patternName: "Min-Heap / Priority Queue",
    title: "DSA Placement 7: Kth Largest Element in an Array",
    slug: "placement-pattern-dsa-7-kth-largest-element-heap",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Facebook", "Amazon", "Walmart"],
    frequency: "95% Placement Frequency",
    description: "Find the Kth largest element in an unsorted array using Min-Heap in O(N log K) time.",
    input_format: "First line N and K.\nSecond line N space-separated integers.",
    output_format: "Print Kth largest integer value.",
    constraints: "1 <= K <= N <= 10^5",
    sample_cases: [
      { input: "6 2\n3 2 1 5 6 4", output: "5", explanation: "Sorted: [1,2,3,4,5,6], 2nd largest is 5" },
      { input: "9 4\n3 2 3 1 2 4 5 5 6", output: "4", explanation: "4th largest is 4" },
      { input: "5 1\n10 20 30 40 50", output: "50", explanation: "1st largest is max 50" },
      { input: "5 5\n10 20 30 40 50", output: "10", explanation: "5th largest is min 10" },
      { input: "4 2\n7 7 7 7", output: "7", explanation: "Duplicates" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 168,
    patternName: "Trie Prefix Tree",
    title: "DSA Placement 8: Trie Prefix Search",
    slug: "placement-pattern-dsa-8-trie-prefix-search",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Uber", "Amazon"],
    frequency: "93% Placement Frequency",
    description: "Implement a Trie (Prefix Tree) supporting insert, search, and startsWith operations.",
    input_format: "First line N words to insert.\nSecond line N space separated words.\nThird line prefix word to search.",
    output_format: "Print true if prefix exists, else false.",
    constraints: "1 <= N <= 1000",
    sample_cases: [
      { input: "3\napple app application\napp", output: "true", explanation: "Prefix app exists" },
      { input: "2\nhello world\nwor", output: "true", explanation: "Prefix wor exists" },
      { input: "2\ncat dog\nbat", output: "false", explanation: "Prefix bat does not exist" },
      { input: "1\nsmartlab\nsmart", output: "true", explanation: "Prefix smart exists" },
      { input: "3\njava javascript python\npy", output: "true", explanation: "Prefix py exists" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 169,
    patternName: "Dynamic Programming LIS",
    title: "DSA Placement 9: Longest Increasing Subsequence (LIS)",
    slug: "placement-pattern-dsa-9-longest-increasing-subsequence",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Microsoft", "Google", "Infosys"],
    frequency: "97% Placement Frequency",
    description: "Find the length of the longest strictly increasing subsequence in an integer array in O(N log N) or O(N^2).",
    input_format: "First line N.\nSecond line N integers.",
    output_format: "Print length of LIS.",
    constraints: "1 <= N <= 2500",
    sample_cases: [
      { input: "8\n10 9 2 5 3 7 101 18", output: "4", explanation: "LIS is [2,3,7,101]" },
      { input: "6\n0 1 0 3 2 3", output: "4", explanation: "LIS is [0,1,2,3]" },
      { input: "7\n7 7 7 7 7 7 7", output: "1", explanation: "Single element subsequence" },
      { input: "5\n5 4 3 2 1", output: "1", explanation: "Strictly decreasing array" },
      { input: "5\n1 2 3 4 5", output: "5", explanation: "Entire array is LIS" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 170,
    patternName: "Dynamic Programming 0/1 Knapsack",
    title: "DSA Placement 10: 0/1 Knapsack Problem",
    slug: "placement-pattern-dsa-10-01-knapsack-problem",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Amazon", "TCS Digital", "Samsung"],
    frequency: "98% Placement Frequency",
    description: "Given weights W and values V of N items, put these items in a knapsack of capacity C to get max total value.",
    input_format: "First line N and Capacity C.\nSecond line N values.\nThird line N weights.",
    output_format: "Print maximum achievable value.",
    constraints: "1 <= N, C <= 1000",
    sample_cases: [
      { input: "3 50\n60 100 120\n10 20 30", output: "220", explanation: "Pick items 2 and 3 (20+30=50, value 100+120=220)" },
      { input: "4 7\n1 4 5 7\n1 3 4 5", output: "9", explanation: "Pick items 2 and 3 (3+4=7, value 4+5=9)" },
      { input: "2 3\n10 20\n5 5", output: "0", explanation: "Capacity too small" },
      { input: "3 10\n10 20 30\n1 2 3", output: "60", explanation: "Pick all items (1+2+3 <= 10, value 60)" },
      { input: "1 5\n100\n5", output: "100", explanation: "Pick single item" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 171,
    patternName: "Dynamic Programming Coin Change",
    title: "DSA Placement 11: Minimum Coins for Change",
    slug: "placement-pattern-dsa-11-coin-change-dp",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Amazon", "Paytm"],
    frequency: "94% Placement Frequency",
    description: "Find the minimum number of coins needed to make up a given target amount using given coin denominations.",
    input_format: "First line N coin types and Target amount.\nSecond line N coin values.",
    output_format: "Print min coins needed, or -1 if impossible.",
    constraints: "1 <= Target <= 10^4",
    sample_cases: [
      { input: "3 11\n1 2 5", output: "3", explanation: "5 + 5 + 1 = 11 (3 coins)" },
      { input: "1 3\n2", output: "-1", explanation: "Impossible to make 3 with coin 2" },
      { input: "1 0\n1", output: "0", explanation: "Target 0 requires 0 coins" },
      { input: "4 6\n1 3 4 5", output: "2", explanation: "3 + 3 = 6 (2 coins)" },
      { input: "2 7\n2 5", output: "2", explanation: "5 + 2 = 7 (2 coins)" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 172,
    patternName: "Graph Dijkstra Algorithm",
    title: "DSA Placement 12: Dijkstra Shortest Path",
    slug: "placement-pattern-dsa-12-dijkstra-shortest-path",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Uber", "Ola"],
    frequency: "95% Placement Frequency",
    description: "Given a weighted directed graph, find shortest distance from source vertex 0 to all other vertices using Min-Heap Dijkstra.",
    input_format: "First line V and E.\nNext E lines contain u v w (source, dest, weight).",
    output_format: "Print space-separated shortest distances from vertex 0 to V-1.",
    constraints: "1 <= V <= 1000",
    sample_cases: [
      { input: "4 5\n0 1 1\n0 2 4\n1 2 2\n1 3 6\n2 3 3", output: "0 1 3 6", explanation: "Shortest paths from 0" },
      { input: "3 3\n0 1 5\n1 2 5\n0 2 12", output: "0 5 10", explanation: "Path via vertex 1 is 10 < 12" },
      { input: "2 1\n0 1 7", output: "0 7", explanation: "Direct edge distance 7" },
      { input: "1 0", output: "0", explanation: "Source distance 0" },
      { input: "3 2\n0 1 3\n1 2 4", output: "0 3 7", explanation: "Linear path distance" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 173,
    patternName: "Divide & Conquer Heap",
    title: "DSA Placement 13: Merge K Sorted Lists",
    slug: "placement-pattern-dsa-13-merge-k-sorted-lists",
    subject: "DSA",
    difficulty: "Hard",
    companyTags: ["Amazon", "Microsoft", "Meta"],
    frequency: "91% Placement Frequency",
    description: "Merge K sorted arrays/lists into one single sorted array in O(N log K) time using Min-Heap.",
    input_format: "First line K.\nNext K lines contain list size follow by sorted elements.",
    output_format: "Print merged sorted space separated elements.",
    constraints: "1 <= K <= 500",
    sample_cases: [
      { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", output: "1 1 2 3 4 4 5 6", explanation: "Merged sorted list" },
      { input: "2\n2 10 20\n2 5 15", output: "5 10 15 20", explanation: "Merged 2 lists" },
      { input: "1\n3 1 2 3", output: "1 2 3", explanation: "Single list unchanged" },
      { input: "2\n1 100\n1 50", output: "50 100", explanation: "Single elements merged" },
      { input: "3\n2 -5 0\n2 -2 5\n1 10", output: "-5 -2 0 5 10", explanation: "Negative numbers merged" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 174,
    patternName: "Doubly Linked List & Hash Map",
    title: "DSA Placement 14: LRU Cache Implementation",
    slug: "placement-pattern-dsa-14-lru-cache-design",
    subject: "DSA",
    difficulty: "Hard",
    companyTags: ["Amazon", "Google", "Flipkart"],
    frequency: "97% Placement Frequency",
    description: "Design a Least Recently Used (LRU) Cache supporting get(key) and put(key, value) in O(1) time complexity.",
    input_format: "First line Capacity C and Operations N.\nNext N lines contain operations: PUT key val or GET key.",
    output_format: "Print output for GET operations (-1 if key evicted/not found).",
    constraints: "1 <= C <= 1000",
    sample_cases: [
      { input: "2 6\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2\nGET 3", output: "10\n-1\n30", explanation: "Key 2 evicted when key 3 inserted" },
      { input: "1 3\nPUT 5 50\nPUT 6 60\nGET 5", output: "-1", explanation: "Key 5 evicted by capacity 1" },
      { input: "2 3\nPUT 1 1\nGET 1\nGET 2", output: "1\n-1", explanation: "Get operation" },
      { input: "2 4\nPUT 1 10\nPUT 2 20\nPUT 1 15\nGET 1", output: "15", explanation: "Updated key value" },
      { input: "3 2\nPUT 7 70\nGET 7", output: "70", explanation: "Found in cache" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 175,
    patternName: "Kadane's Algorithm",
    title: "DSA Placement 15: Maximum Subarray Sum (Kadane)",
    slug: "placement-pattern-dsa-15-max-subarray-sum-kadane",
    subject: "DSA",
    difficulty: "Easy",
    companyTags: ["TCS", "Infosys", "Wipro", "Amazon"],
    frequency: "99% Placement Frequency",
    description: "Find the maximum sum of a contiguous subarray in O(N) time using Kadane's Algorithm.",
    input_format: "First line N.\nSecond line N space-separated integers.",
    output_format: "Print maximum contiguous subarray sum.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "Subarray [4, -1, 2, 1] has max sum 6" },
      { input: "1\n1", output: "1", explanation: "Single element" },
      { input: "5\n5 4 -1 7 8", output: "23", explanation: "Entire array except -1" },
      { input: "4\n-1 -2 -3 -4", output: "-1", explanation: "Max single negative element" },
      { input: "5\n1 2 3 4 5", output: "15", explanation: "All positive sum" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 176,
    patternName: "Binary Search Rotated Array",
    title: "DSA Placement 16: Search in Rotated Sorted Array",
    slug: "placement-pattern-dsa-16-search-rotated-sorted-array",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Meta", "Amazon", "Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Search target element in an array sorted and rotated at unknown pivot in O(log N) time.",
    input_format: "First line N and Target.\nSecond line N integers.",
    output_format: "Print 0-based index of target, or -1 if not present.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
      { input: "7 0\n4 5 6 7 0 1 2", output: "4", explanation: "Target 0 found at index 4" },
      { input: "7 3\n4 5 6 7 0 1 2", output: "-1", explanation: "Target 3 not in array" },
      { input: "1 0\n0", output: "0", explanation: "Single element found" },
      { input: "5 2\n3 4 5 1 2", output: "4", explanation: "Target 2 found at index 4" },
      { input: "4 1\n2 3 4 1", output: "3", explanation: "Target 1 found at index 3" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 177,
    patternName: "Binary Tree Mutation",
    title: "DSA Placement 17: Flatten Binary Tree to Linked List",
    slug: "placement-pattern-dsa-17-flatten-binary-tree",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Microsoft", "Amazon", "Oracle"],
    frequency: "90% Placement Frequency",
    description: "Flatten a binary tree into a right-skewed linked list in-place according to pre-order traversal.",
    input_format: "First line N elements of binary tree in level order (-1 for null).",
    output_format: "Print values of flattened right-pointing nodes.",
    constraints: "1 <= N <= 2000",
    sample_cases: [
      { input: "1 2 5 3 4 -1 6", output: "1 2 3 4 5 6", explanation: "Preorder traversal order" },
      { input: "0", output: "0", explanation: "Single node" },
      { input: "1 2 3", output: "1 2 3", explanation: "Flattened tree" },
      { input: "10 5 -1 2", output: "10 5 2", explanation: "Left child flattened" },
      { input: "4 2 6 1 3 5 7", output: "4 2 1 3 6 5 7", explanation: "Pre-order flattened sequence" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 178,
    patternName: "Kahn's Algorithm Topo Sort",
    title: "DSA Placement 18: Topological Sort (Kahn's Algorithm)",
    slug: "placement-pattern-dsa-18-topological-sort-kahns",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Amazon", "Wipro"],
    frequency: "94% Placement Frequency",
    description: "Find topological ordering of a Directed Acyclic Graph (DAG) using Kahn's In-degree BFS Algorithm.",
    input_format: "First line V vertices and E edges.\nNext E lines contain u v representing directed edge u -> v.",
    output_format: "Print space-separated valid topological sort order of vertices.",
    constraints: "1 <= V <= 10^4",
    sample_cases: [
      { input: "6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1", output: "4 5 0 1 2 3", explanation: "Valid topological order" },
      { input: "4 3\n0 1\n1 2\n2 3", output: "0 1 2 3", explanation: "Linear order" },
      { input: "2 1\n0 1", output: "0 1", explanation: "Simple edge topo sort" },
      { input: "3 2\n0 2\n1 2", output: "0 1 2", explanation: "In-degree ordering" },
      { input: "1 0", output: "0", explanation: "Single vertex topo" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 179,
    patternName: "Disjoint Set Union (DSU)",
    title: "DSA Placement 19: Disjoint Set Union (Union-Find)",
    slug: "placement-pattern-dsa-19-disjoint-set-union-dsu",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["Google", "Uber", "Amazon"],
    frequency: "93% Placement Frequency",
    description: "Implement Disjoint Set Union (Union-Find) with path compression and union by rank to detect connected components.",
    input_format: "First line N elements and Q operations.\nEach operation UNION u v or FIND u v.",
    output_format: "Print true or false for FIND query (whether u and v belong to same set).",
    constraints: "1 <= N, Q <= 10^5",
    sample_cases: [
      { input: "5 4\nUNION 0 1\nUNION 1 2\nFIND 0 2\nFIND 0 3", output: "true\nfalse", explanation: "0,1,2 in same component" },
      { input: "3 3\nUNION 0 1\nFIND 0 1\nFIND 1 2", output: "true\nfalse", explanation: "Union of 0 and 1" },
      { input: "2 1\nFIND 0 1", output: "false", explanation: "Not connected" },
      { input: "4 3\nUNION 1 3\nUNION 2 3\nFIND 1 2", output: "true", explanation: "Connected via 3" },
      { input: "3 2\nUNION 0 2\nFIND 0 2", output: "true", explanation: "Direct union" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 180,
    patternName: "Binary Tree DP Path Sum",
    title: "DSA Placement 20: Maximum Path Sum in Binary Tree",
    slug: "placement-pattern-dsa-20-max-path-sum-binary-tree",
    subject: "DSA",
    difficulty: "Hard",
    companyTags: ["Meta", "Google", "Amazon"],
    frequency: "92% Placement Frequency",
    description: "Find the maximum path sum in a binary tree where path can start and end at any node.",
    input_format: "First line N elements of binary tree in level order (-1 for null).",
    output_format: "Print maximum path sum integer value.",
    constraints: "1 <= N <= 10^4",
    sample_cases: [
      { input: "1 2 3", output: "6", explanation: "Path 2 -> 1 -> 3 has max sum 6" },
      { input: "-10 9 20 -1 -1 15 7", output: "42", explanation: "Path 15 -> 20 -> 7 has max sum 42" },
      { input: "-3", output: "-3", explanation: "Single negative root" },
      { input: "10 2 10 20 1 -1 -25 3 4", output: "42", explanation: "Maximum path sum 42" },
      { input: "5 4 8 11 -1 13 4 7 2 -1 -1 -1 1", output: "48", explanation: "Deep tree path sum" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];

const PLACEMENT_PATTERNS = [
  ...DSA_PLACEMENT_PATTERNS,
  ...ADA_PLACEMENT_PATTERNS,
  ...DBMS_PLACEMENT_PATTERNS,
  ...JAVA_PLACEMENT_PATTERNS,
  ...PYTHON_PLACEMENT_PATTERNS,
  ...MONGODB_PLACEMENT_PATTERNS,
  ...AI_PLACEMENT_PATTERNS,
  ...OS_PLACEMENT_PATTERNS,
  ...LATEX_PLACEMENT_PATTERNS
];

module.exports = {
  PLACEMENT_PATTERNS,
  DEFAULT_STARTER_CODE
};

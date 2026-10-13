const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/placementPatterns.js');
let content = fs.readFileSync(filePath, 'utf8');

const EDGEVERVE_BLOCK = `
const EDGEVERVE_PLACEMENT_PATTERNS = [
  {
    id: 181,
    patternName: "Dynamic Programming - Coin Change",
    title: "EdgeVerve Special 1: Currency Denomination & Coin Change",
    slug: "placement-pattern-edgeverve-1-coin-change",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Google", "Microsoft", "Amazon"],
    frequency: "99% Placement Frequency",
    description: "Given an array of coin denominations and a target customer transaction amount, determine the minimum number of coins needed to make up that amount. If that amount cannot be made up by any combination of coins, return -1.",
    input_format: "First line contains N and A.\\nSecond line contains N coin denominations.",
    output_format: "Print minimum number of coins needed, or -1.",
    constraints: "1 <= N <= 12, 0 <= A <= 10^4",
    sample_cases: [
      { input: "3 11\\n1 2 5", output: "3", explanation: "5 + 5 + 1 = 11" },
      { input: "1 3\\n2", output: "-1", explanation: "Cannot form 3" },
      { input: "1 0\\n1", output: "0", explanation: "0 amount needs 0 coins" },
      { input: "4 15\\n2 3 5 7", output: "3", explanation: "7 + 5 + 3 = 15" },
      { input: "3 7\\n2 4 6", output: "-1", explanation: "Cannot form odd number" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 182,
    patternName: "Stack - Valid Parentheses",
    title: "EdgeVerve Special 2: Financial Bracket Syntax Validator",
    slug: "placement-pattern-edgeverve-2-valid-parentheses",
    subject: "DSA",
    difficulty: "Easy",
    companyTags: ["EdgeVerve", "Microsoft", "Infosys", "Google"],
    frequency: "97% Placement Frequency",
    description: "In banking payload formats, validate whether all brackets (), [], and {} in a string are closed in the correct order and by the same type of brackets.",
    input_format: "A single string S containing only bracket characters.",
    output_format: "Print true if valid, otherwise false.",
    constraints: "1 <= |S| <= 10^4",
    sample_cases: [
      { input: "()[]{}", output: "true", explanation: "All correctly matched" },
      { input: "(]", output: "false", explanation: "Mismatched type" },
      { input: "([{}])", output: "true", explanation: "Nested correctly" },
      { input: "[(])", output: "false", explanation: "Cross closed" },
      { input: "{[()]}", output: "true", explanation: "Properly symmetric" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 183,
    patternName: "Monotonic Stack - Next Greater Element",
    title: "EdgeVerve Special 3: Stock Price Spike & Next Greater Element",
    slug: "placement-pattern-edgeverve-3-next-greater-element",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Amazon", "Microsoft", "Google"],
    frequency: "96% Placement Frequency",
    description: "Given an array of daily stock prices, find the next greater price for every element. The next greater price of an element x is the first greater element to its right. If it does not exist, output -1 for that day.",
    input_format: "First line contains N.\\nSecond line contains N integers.",
    output_format: "Print N space-separated integers representing next greater prices.",
    constraints: "1 <= N <= 10^5",
    sample_cases: [
      { input: "4\\n1 3 2 4", output: "3 4 4 -1", explanation: "Next greater elements" },
      { input: "5\\n6 8 0 1 3", output: "8 -1 1 3 -1", explanation: "Next greater elements" },
      { input: "3\\n5 4 3", output: "-1 -1 -1", explanation: "No greater element to right" },
      { input: "4\\n1 2 3 4", output: "2 3 4 -1", explanation: "Strictly increasing" },
      { input: "1\\n10", output: "-1", explanation: "Single element" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 184,
    patternName: "Matrix Simulation - Spiral Traversal",
    title: "EdgeVerve Special 4: Clockwise Spiral Matrix Audit",
    slug: "placement-pattern-edgeverve-4-spiral-matrix",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Google", "Microsoft", "Amazon"],
    frequency: "94% Placement Frequency",
    description: "Given an M x N transaction log matrix, return all elements of the matrix in clockwise spiral order.",
    input_format: "First line contains M and N.\\nNext M lines contain N space-separated integers.",
    output_format: "Print all elements visited in spiral order separated by space.",
    constraints: "1 <= M, N <= 100",
    sample_cases: [
      { input: "3 3\\n1 2 3\\n4 5 6\\n7 8 9", output: "1 2 3 6 9 8 7 4 5", explanation: "3x3 spiral" },
      { input: "3 4\\n1 2 3 4\\n5 6 7 8\\n9 10 11 12", output: "1 2 3 4 8 12 11 10 9 5 6 7", explanation: "3x4 spiral" },
      { input: "1 4\\n1 2 3 4", output: "1 2 3 4", explanation: "Single row" },
      { input: "4 1\\n1\\n2\\n3\\n4", output: "1 2 3 4", explanation: "Single column" },
      { input: "2 2\\n1 2\\n3 4", output: "1 2 4 3", explanation: "2x2 spiral" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 185,
    patternName: "Sliding Window - Unique Characters",
    title: "EdgeVerve Special 5: Longest Substring Without Repeating Characters",
    slug: "placement-pattern-edgeverve-5-longest-substring-non-repeating",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Google", "Microsoft", "Amazon"],
    frequency: "99% Placement Frequency",
    description: "Given a string s, find the length of the longest substring without repeating characters in O(N) time.",
    input_format: "A single string s.",
    output_format: "Print the length of the longest substring without repeating characters.",
    constraints: "0 <= |s| <= 5 * 10^4",
    sample_cases: [
      { input: "abcabcbb", output: "3", explanation: "abc has length 3" },
      { input: "bbbbb", output: "1", explanation: "b has length 1" },
      { input: "pwwkew", output: "3", explanation: "wke has length 3" },
      { input: "abcdef", output: "6", explanation: "all unique" },
      { input: "a", output: "1", explanation: "single character" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 186,
    patternName: "Prefix Sum & Hash Map",
    title: "EdgeVerve Special 6: Subarray Sum Equals Target",
    slug: "placement-pattern-edgeverve-6-subarray-sum-equals-k",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Microsoft", "Meta", "Google"],
    frequency: "95% Placement Frequency",
    description: "Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals to k in O(N) time.",
    input_format: "First line contains N and K.\\nSecond line contains N integers.",
    output_format: "Print the total number of continuous subarrays whose sum is K.",
    constraints: "1 <= N <= 2 * 10^4",
    sample_cases: [
      { input: "3 2\\n1 1 1", output: "2", explanation: "[1,1] twice" },
      { input: "3 3\\n1 2 3", output: "2", explanation: "[1,2] and [3]" },
      { input: "4 0\\n1 -1 1 -1", output: "4", explanation: "Zero sum subarrays" },
      { input: "5 5\\n2 3 -5 5 0", output: "4", explanation: "Multiple subarrays" },
      { input: "3 7\\n1 2 3", output: "0", explanation: "No subarray sums to 7" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 187,
    patternName: "Hash Map - Group Anagrams",
    title: "EdgeVerve Special 7: Group Anagrams by Character Signature",
    slug: "placement-pattern-edgeverve-7-group-anagrams",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Google", "Amazon", "Microsoft"],
    frequency: "96% Placement Frequency",
    description: "Given N words, group the anagrams together. Print the count of groups, followed by each group words sorted alphabetically on separate lines.",
    input_format: "First line contains N.\\nSecond line contains N space-separated lowercase words.",
    output_format: "Print number of groups, then each group sorted space-separated on new line.",
    constraints: "1 <= N <= 10^4",
    sample_cases: [
      { input: "6\\neat tea tan ate nat bat", output: "3\\nate eat tea\\nbat\\nnat tan", explanation: "3 anagram groups" },
      { input: "1\\na", output: "1\\na", explanation: "Single word" },
      { input: "2\\nab ba", output: "1\\nab ba", explanation: "1 anagram group" },
      { input: "3\\ncat dog rat", output: "3\\ncat\\ndog\\nrat", explanation: "All unique anagram groups" },
      { input: "4\\nabc bca cab def", output: "2\\nabc bca cab\\ndef", explanation: "2 anagram groups" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 188,
    patternName: "Dynamic Programming - 0/1 Knapsack",
    title: "EdgeVerve Special 8: Portfolio Knapsack 0/1 Value Maximization",
    slug: "placement-pattern-edgeverve-8-knapsack-01",
    subject: "ADA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Microsoft", "Goldman Sachs", "Google"],
    frequency: "98% Placement Frequency",
    description: "In banking portfolio allocation, given weights and values of N investment instruments, find the maximum profit that can be achieved within risk capacity W.",
    input_format: "First line contains N and W.\\nSecond line contains N weights.\\nThird line contains N values.",
    output_format: "Print the maximum achievable total value.",
    constraints: "1 <= N <= 1000, 1 <= W <= 1000",
    sample_cases: [
      { input: "3 4\\n1 2 3\\n10 15 40", output: "55", explanation: "Take items with weight 1 and 3: 10 + 40 = 55" },
      { input: "4 8\\n2 3 4 5\\n1 2 5 6", output: "8", explanation: "Optimal weight 8 value is 8" },
      { input: "3 50\\n10 20 30\\n60 100 120", output: "220", explanation: "Take weight 20 and 30: 100 + 120 = 220" },
      { input: "1 10\\n15\\n100", output: "0", explanation: "Cannot fit item" },
      { input: "2 5\\n2 3\\n6 10", output: "16", explanation: "Take both: 6 + 10 = 16" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 189,
    patternName: "Breadth-First Search - Multi-Source BFS",
    title: "EdgeVerve Special 9: Rotting Oranges (Grid BFS Infection Wave)",
    slug: "placement-pattern-edgeverve-9-rotting-oranges",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Microsoft", "Google", "Amazon"],
    frequency: "97% Placement Frequency",
    description: "In an M x N grid, 0 represents empty cell, 1 represents fresh orange, 2 represents rotten orange. Every minute, fresh oranges adjacent 4-directionally become rotten. Return minimum minutes until no cell has a fresh orange, or -1 if impossible.",
    input_format: "First line contains M and N.\\nNext M lines contain N integers (0, 1, or 2).",
    output_format: "Print minimum minutes elapsed, or -1.",
    constraints: "1 <= M, N <= 10",
    sample_cases: [
      { input: "3 3\\n2 1 1\\n1 1 0\\n0 1 1", output: "4", explanation: "4 minutes to rot all" },
      { input: "3 3\\n2 1 1\\n0 1 1\\n1 0 1", output: "-1", explanation: "Bottom-left cannot be reached" },
      { input: "1 2\\n0 2", output: "0", explanation: "No fresh oranges" },
      { input: "2 2\\n2 2\\n2 2", output: "0", explanation: "All already rotten" },
      { input: "2 2\\n1 1\\n1 1", output: "-1", explanation: "No rotten orange to start" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  },
  {
    id: 190,
    patternName: "Binary Tree - Lowest Common Ancestor",
    title: "EdgeVerve Special 10: Lowest Common Ancestor (LCA) in Binary Tree",
    slug: "placement-pattern-edgeverve-10-lowest-common-ancestor",
    subject: "DSA",
    difficulty: "Medium",
    companyTags: ["EdgeVerve", "Google", "Microsoft", "Meta"],
    frequency: "95% Placement Frequency",
    description: "Given a binary tree in level order format (-1 for null) and two node values P and Q, find their lowest common ancestor (LCA) node value.",
    input_format: "First line contains level order tree values (-1 for null).\\nSecond line contains P and Q.",
    output_format: "Print LCA node value.",
    constraints: "2 <= total nodes <= 10^4",
    sample_cases: [
      { input: "3 5 1 6 2 0 8 -1 -1 7 4\\n5 1", output: "3", explanation: "LCA of 5 and 1 is 3" },
      { input: "3 5 1 6 2 0 8 -1 -1 7 4\\n5 4", output: "5", explanation: "LCA of 5 and 4 is 5" },
      { input: "1 2\\n1 2", output: "1", explanation: "LCA of 1 and 2 is 1" },
      { input: "6 2 8 0 4 7 9\\n2 8", output: "6", explanation: "LCA of 2 and 8 is 6" },
      { input: "6 2 8 0 4 7 9\\n2 4", output: "2", explanation: "LCA of 2 and 4 is 2" }
    ],
    starter_code: DEFAULT_STARTER_CODE
  }
];
`;

const targetExport = `const PLACEMENT_PATTERNS = [`;
if (!content.includes('EDGEVERVE_PLACEMENT_PATTERNS')) {
  content = content.replace(targetExport, EDGEVERVE_BLOCK + '\n' + targetExport + '\n  ...EDGEVERVE_PLACEMENT_PATTERNS,');
}

const slugsToTag = [
  'placement-pattern-1-two-pointers',
  'placement-pattern-2-sliding-window',
  'placement-pattern-3-fast-slow-pointers',
  'placement-pattern-4-merge-intervals',
  'placement-pattern-5-cyclic-sort',
  'placement-pattern-dsa-1-reverse-linked-list',
  'placement-pattern-dsa-2-middle-of-linked-list',
  'placement-pattern-dsa-3-merge-sorted-lists',
  'placement-pattern-dsa-6-valid-parentheses',
  'placement-pattern-dsa-10-binary-search'
];

slugsToTag.forEach(slug => {
  const idx = content.indexOf(`slug: "${slug}"`);
  if (idx !== -1) {
    const tagIdx = content.indexOf('companyTags: [', idx);
    if (tagIdx !== -1 && tagIdx < idx + 400) {
      const closeBracket = content.indexOf(']', tagIdx);
      const curTags = content.slice(tagIdx, closeBracket);
      if (!curTags.includes('EdgeVerve')) {
        content = content.slice(0, closeBracket) + ',"EdgeVerve"' + content.slice(closeBracket);
      }
    }
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated placementPatterns.js with EdgeVerve patterns & tags!');


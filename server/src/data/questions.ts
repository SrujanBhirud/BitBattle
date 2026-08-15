import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Data Structures',
    difficulty: 'easy',
    question: 'What is the average time complexity of searching an element in a Hash Table?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 0,
    explanation: 'Hash tables offer O(1) constant average lookup time assuming a uniform hash distribution.'
  },
  {
    id: 'q2',
    category: 'Algorithms',
    difficulty: 'easy',
    question: 'Which sorting algorithm has the best worst-case time complexity?',
    options: ['Quick Sort', 'Bubble Sort', 'Merge Sort', 'Insertion Sort'],
    correctIndex: 2,
    explanation: 'Merge Sort guarantees O(n log n) in all cases (worst, average, best).'
  },
  {
    id: 'q3',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'What will be the output of the following code snippet?',
    codeSnippet: 'console.log(typeof NaN);\nconsole.log(NaN === NaN);',
    options: ['"number" and true', '"number" and false', '"undefined" and false', '"NaN" and false'],
    correctIndex: 1,
    explanation: 'In JavaScript, typeof NaN is "number", and NaN is unique in that it does not equal itself.'
  },
  {
    id: 'q4',
    category: 'Computer Networks',
    difficulty: 'medium',
    question: 'In TCP 3-way handshake, what is the sequence of flags exchanged?',
    options: ['SYN -> ACK -> SYN-ACK', 'SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'SYN -> FIN -> ACK'],
    correctIndex: 1,
    explanation: 'The TCP handshake sequence is SYN from client, SYN-ACK from server, and ACK from client.'
  },
  {
    id: 'q5',
    category: 'Operating Systems',
    difficulty: 'medium',
    question: 'Which condition is NOT strictly one of Coffman’s 4 conditions required for Deadlock?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctIndex: 2,
    explanation: 'Coffman requires "No Preemption". If preemption is allowed, deadlock cannot occur.'
  },
  {
    id: 'q6',
    category: 'System Design',
    difficulty: 'hard',
    question: 'According to the CAP theorem, what does a distributed system have to trade off during a network partition (P)?',
    options: ['Speed vs Memory', 'Consistency vs Availability', 'Throughput vs Latency', 'Durability vs Atomicity'],
    correctIndex: 1,
    explanation: 'When a network Partition occurs (P), a distributed system must choose between Consistency (C) and Availability (A).'
  },
  {
    id: 'q7',
    category: 'Python',
    difficulty: 'easy',
    question: 'What is the output of `[i*2 for i in range(3)]` in Python?',
    options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
    correctIndex: 0,
    explanation: 'range(3) yields 0, 1, 2. Multiplying each by 2 yields [0, 2, 4].'
  },
  {
    id: 'q8',
    category: 'Algorithms',
    difficulty: 'hard',
    question: 'Which algorithm is typically used to find the shortest path from a single source in a graph with negative edge weights (but no negative cycles)?',
    options: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
    correctIndex: 1,
    explanation: 'Bellman-Ford handles negative edge weights and detects negative weight cycles.'
  },
  {
    id: 'q9',
    category: 'Database & SQL',
    difficulty: 'medium',
    question: 'Which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads in standard SQL?',
    options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
    correctIndex: 2,
    explanation: 'Repeatable Read prevents dirty and non-repeatable reads, while Serializable prevents phantom reads as well.'
  },
  {
    id: 'q10',
    category: 'Data Structures',
    difficulty: 'easy',
    question: 'Which data structure is primarily used to implement Breadth-First Search (BFS)?',
    options: ['Stack', 'Queue', 'Heap', 'Tree'],
    correctIndex: 1,
    explanation: 'BFS uses a FIFO Queue to traverse nodes level by level.'
  }
];

import type { LucideIcon } from 'lucide-react'
import {
  BrainCircuit,
  Database,
  Sparkles,
  Network,
  LineChart,
  BookMarked,
} from 'lucide-react'

export type FileType = 'pdf' | 'note' | 'image' | 'presentation' | 'video'

export type Subject = {
  id: string
  name: string
  description: string
  color: string
  icon: LucideIcon
  documents: number
  concepts: number
  mastery: number
  lastStudied: string
  summaries: number
  quizzes: number
  topConcepts: { name: string; strength: number }[]
}

export type KnowledgeItem = {
  id: string
  userId: string
  title: string
  type: FileType
  subjectId: string
  subject: string
  size: string
  uploadedAt: number
  summarized: boolean
  concepts: number
  excerpt: string
}

/** Epoch-ms offsets so demo timestamps stay relative to "now". */
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const DEMO_USER_ID = 'demo-user'

export const subjects: Subject[] = [
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Supervised & unsupervised learning, model evaluation, optimization.',
    color: 'var(--chart-1)',
    icon: BrainCircuit,
    documents: 18,
    concepts: 142,
    mastery: 78,
    lastStudied: '2 hours ago',
    summaries: 14,
    quizzes: 9,
    topConcepts: [
      { name: 'Gradient Descent', strength: 88 },
      { name: 'Neural Networks', strength: 76 },
      { name: 'Regularization', strength: 64 },
      { name: 'Support Vector Machines', strength: 52 },
    ],
  },
  {
    id: 'bda',
    name: 'Big Data Analytics',
    description: 'Distributed systems, Hadoop, Spark, streaming pipelines.',
    color: 'var(--chart-2)',
    icon: Database,
    documents: 12,
    concepts: 96,
    mastery: 54,
    lastStudied: 'Yesterday',
    summaries: 10,
    quizzes: 5,
    topConcepts: [
      { name: 'Spark RDDs', strength: 70 },
      { name: 'MapReduce', strength: 58 },
      { name: 'HDFS', strength: 44 },
      { name: 'Stream Processing', strength: 38 },
    ],
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Search, knowledge representation, reasoning, planning agents.',
    color: 'var(--chart-3)',
    icon: Sparkles,
    documents: 24,
    concepts: 188,
    mastery: 65,
    lastStudied: '3 days ago',
    summaries: 18,
    quizzes: 11,
    topConcepts: [
      { name: 'A* Search', strength: 80 },
      { name: 'Bayesian Networks', strength: 68 },
      { name: 'Alpha-Beta Pruning', strength: 60 },
      { name: 'Markov Decision Processes', strength: 40 },
    ],
  },
  {
    id: 'ds',
    name: 'Data Structures',
    description: 'Trees, graphs, hashing, dynamic programming, complexity.',
    color: 'var(--chart-4)',
    icon: Network,
    documents: 9,
    concepts: 74,
    mastery: 88,
    lastStudied: '5 days ago',
    summaries: 7,
    quizzes: 6,
    topConcepts: [
      { name: 'Hash Tables', strength: 97 },
      { name: 'Binary Trees', strength: 90 },
      { name: 'Dynamic Programming', strength: 82 },
      { name: 'Graph Traversal', strength: 78 },
    ],
  },
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Probability, distributions, hypothesis testing, regression.',
    color: 'var(--chart-5)',
    icon: LineChart,
    documents: 14,
    concepts: 110,
    mastery: 42,
    lastStudied: '1 week ago',
    summaries: 11,
    quizzes: 4,
    topConcepts: [
      { name: 'Probability', strength: 60 },
      { name: 'Distributions', strength: 50 },
      { name: 'Hypothesis Testing', strength: 36 },
      { name: 'Regression', strength: 30 },
    ],
  },
  {
    id: 'dbms',
    name: 'Database Systems',
    description: 'Relational models, normalization, transactions, indexing.',
    color: 'var(--chart-2)',
    icon: BookMarked,
    documents: 7,
    concepts: 63,
    mastery: 71,
    lastStudied: '4 days ago',
    summaries: 6,
    quizzes: 5,
    topConcepts: [
      { name: 'Normalization', strength: 78 },
      { name: 'Indexing', strength: 70 },
      { name: 'Transactions', strength: 66 },
      { name: 'Query Optimization', strength: 58 },
    ],
  },
]

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1',
    userId: DEMO_USER_ID,
    title: 'Gradient Descent & Optimization.pdf',
    type: 'pdf',
    subjectId: 'ml',
    subject: 'Machine Learning',
    size: '2.4 MB',
    uploadedAt: Date.now() - 2 * HOUR,
    summarized: true,
    concepts: 14,
    excerpt:
      'Covers batch, stochastic, and mini-batch gradient descent with learning rate schedules and momentum.',
  },
  {
    id: 'k2',
    userId: DEMO_USER_ID,
    title: 'Spark Architecture Deep Dive.pptx',
    type: 'presentation',
    subjectId: 'bda',
    subject: 'Big Data Analytics',
    size: '8.1 MB',
    uploadedAt: Date.now() - 1 * DAY,
    summarized: true,
    concepts: 11,
    excerpt:
      'RDDs, DAG scheduler, executors, and the difference between transformations and actions.',
  },
  {
    id: 'k3',
    userId: DEMO_USER_ID,
    title: 'A* Search Lecture Notes',
    type: 'note',
    subjectId: 'ai',
    subject: 'Artificial Intelligence',
    size: '320 KB',
    uploadedAt: Date.now() - 2 * DAY,
    summarized: true,
    concepts: 8,
    excerpt:
      'Admissible heuristics, the open/closed list, and optimality conditions for informed search.',
  },
  {
    id: 'k4',
    userId: DEMO_USER_ID,
    title: 'Whiteboard - Red-Black Trees.png',
    type: 'image',
    subjectId: 'ds',
    subject: 'Data Structures',
    size: '1.2 MB',
    uploadedAt: Date.now() - 3 * DAY,
    summarized: false,
    concepts: 0,
    excerpt: 'Hand-drawn rotations and recoloring rules from the tutorial session.',
  },
  {
    id: 'k5',
    userId: DEMO_USER_ID,
    title: 'Hypothesis Testing Cheat Sheet.pdf',
    type: 'pdf',
    subjectId: 'stats',
    subject: 'Statistics',
    size: '640 KB',
    uploadedAt: Date.now() - 4 * DAY,
    summarized: true,
    concepts: 12,
    excerpt: 'p-values, type I/II errors, t-tests, chi-square, and ANOVA in one reference.',
  },
  {
    id: 'k6',
    userId: DEMO_USER_ID,
    title: 'Normalization Forms Explained',
    type: 'note',
    subjectId: 'dbms',
    subject: 'Database Systems',
    size: '210 KB',
    uploadedAt: Date.now() - 5 * DAY,
    summarized: true,
    concepts: 9,
    excerpt: '1NF through BCNF with worked examples and decomposition strategies.',
  },
  {
    id: 'k7',
    userId: DEMO_USER_ID,
    title: 'Neural Networks Crash Course.mp4',
    type: 'video',
    subjectId: 'ml',
    subject: 'Machine Learning',
    size: '124 MB',
    uploadedAt: Date.now() - 7 * DAY,
    summarized: true,
    concepts: 16,
    excerpt: 'Backpropagation, activation functions, and regularization in a 45 min recording.',
  },
  {
    id: 'k8',
    userId: DEMO_USER_ID,
    title: 'MapReduce Patterns.pptx',
    type: 'presentation',
    subjectId: 'bda',
    subject: 'Big Data Analytics',
    size: '5.6 MB',
    uploadedAt: Date.now() - 8 * DAY,
    summarized: false,
    concepts: 0,
    excerpt: 'Common MapReduce design patterns: summarization, filtering, and joins.',
  },
  {
    id: 'k9',
    userId: DEMO_USER_ID,
    title: 'Bayesian Networks Notes',
    type: 'note',
    subjectId: 'ai',
    subject: 'Artificial Intelligence',
    size: '480 KB',
    uploadedAt: Date.now() - 14 * DAY,
    summarized: true,
    concepts: 13,
    excerpt: 'Conditional independence, d-separation, and inference via variable elimination.',
  },
]

export type Activity = {
  id: string
  action: string
  target: string
  time: string
  type: 'upload' | 'quiz' | 'summary' | 'subject'
}

export const recentActivity: Activity[] = [
  { id: 'a1', action: 'Generated summary for', target: 'Gradient Descent & Optimization', time: '2h ago', type: 'summary' },
  { id: 'a2', action: 'Scored 92% on', target: 'Machine Learning Quiz', time: '5h ago', type: 'quiz' },
  { id: 'a3', action: 'Uploaded', target: 'Spark Architecture Deep Dive', time: 'Yesterday', type: 'upload' },
  { id: 'a4', action: 'Created subject', target: 'Database Systems', time: '2 days ago', type: 'subject' },
  { id: 'a5', action: 'Completed quiz on', target: 'A* Search', time: '3 days ago', type: 'quiz' },
]

export const knowledgeGrowth = [
  { month: 'Jan', concepts: 120, documents: 18 },
  { month: 'Feb', concepts: 210, documents: 31 },
  { month: 'Mar', concepts: 280, documents: 42 },
  { month: 'Apr', concepts: 410, documents: 58 },
  { month: 'May', concepts: 520, documents: 71 },
  { month: 'Jun', concepts: 673, documents: 84 },
]

export const studyActivity = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 80 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 95 },
  { day: 'Fri', minutes: 60 },
  { day: 'Sat', minutes: 120 },
  { day: 'Sun', minutes: 70 },
]

export const examReadiness = [
  { subject: 'Machine Learning', coverage: 88, accuracy: 92, consistency: 80, confidence: 85 },
  { subject: 'Big Data', coverage: 62, accuracy: 70, consistency: 55, confidence: 60 },
  { subject: 'AI', coverage: 74, accuracy: 81, consistency: 68, confidence: 72 },
  { subject: 'Data Structures', coverage: 94, accuracy: 89, consistency: 90, confidence: 92 },
  { subject: 'Statistics', coverage: 48, accuracy: 55, consistency: 42, confidence: 50 },
]

export type GapTopic = {
  name: string
  subject: string
  status: 'mastered' | 'partial' | 'missing'
  progress: number
}

export const learningGaps: GapTopic[] = [
  { name: 'Linear Regression', subject: 'Machine Learning', status: 'mastered', progress: 95 },
  { name: 'Backpropagation', subject: 'Machine Learning', status: 'mastered', progress: 90 },
  { name: 'Support Vector Machines', subject: 'Machine Learning', status: 'partial', progress: 58 },
  { name: 'Spark Streaming', subject: 'Big Data', status: 'partial', progress: 45 },
  { name: 'HDFS Internals', subject: 'Big Data', status: 'missing', progress: 12 },
  { name: 'Alpha-Beta Pruning', subject: 'AI', status: 'partial', progress: 64 },
  { name: 'Markov Decision Processes', subject: 'AI', status: 'missing', progress: 20 },
  { name: 'Hypothesis Testing', subject: 'Statistics', status: 'missing', progress: 18 },
  { name: 'Hash Tables', subject: 'Data Structures', status: 'mastered', progress: 97 },
]

export type ConceptStatus = 'core' | 'emerging' | 'weak' | 'connected'
export type ConceptDifficulty = 'foundational' | 'intermediate' | 'advanced'

export type Concept = {
  id: string
  label: string
  group: 'subject' | 'core' | 'concept' | 'document'
  subject?: string
  mastery?: number
  importance?: number
  frequency?: number
  status?: ConceptStatus
  difficulty?: ConceptDifficulty
  recent?: boolean
}
export type Edge = { source: string; target: string; strength?: number }

export const graphConcepts: Concept[] = [
  // Subjects
  { id: 'ml', label: 'Machine Learning', group: 'subject', subject: 'Machine Learning', mastery: 78, importance: 95, frequency: 142, status: 'connected', difficulty: 'intermediate' },
  { id: 'stats', label: 'Statistics', group: 'subject', subject: 'Statistics', mastery: 42, importance: 88, frequency: 110, status: 'weak', difficulty: 'foundational' },
  { id: 'ai', label: 'Artificial Intelligence', group: 'subject', subject: 'Artificial Intelligence', mastery: 65, importance: 90, frequency: 188, status: 'connected', difficulty: 'advanced' },
  { id: 'ds', label: 'Data Structures', group: 'subject', subject: 'Data Structures', mastery: 88, importance: 80, frequency: 74, status: 'core', difficulty: 'intermediate' },
  // Core concepts
  { id: 'regression', label: 'Regression', group: 'core', subject: 'Statistics', mastery: 72, importance: 92, frequency: 64, status: 'core', difficulty: 'foundational', recent: true },
  { id: 'optimization', label: 'Optimization', group: 'core', subject: 'Machine Learning', mastery: 70, importance: 90, frequency: 58, status: 'core', difficulty: 'intermediate' },
  // Concepts
  { id: 'gradient', label: 'Gradient Descent', group: 'concept', subject: 'Machine Learning', mastery: 88, importance: 85, frequency: 70, status: 'connected', difficulty: 'intermediate', recent: true },
  { id: 'neural', label: 'Neural Networks', group: 'concept', subject: 'Machine Learning', mastery: 76, importance: 88, frequency: 64, status: 'emerging', difficulty: 'advanced', recent: true },
  { id: 'overfitting', label: 'Overfitting', group: 'concept', subject: 'Machine Learning', mastery: 64, importance: 70, frequency: 40, status: 'emerging', difficulty: 'intermediate' },
  { id: 'svm', label: 'Support Vector Machines', group: 'concept', subject: 'Machine Learning', mastery: 52, importance: 60, frequency: 30, status: 'weak', difficulty: 'advanced' },
  { id: 'classification', label: 'Classification', group: 'concept', subject: 'Machine Learning', mastery: 58, importance: 78, frequency: 44, status: 'emerging', difficulty: 'intermediate', recent: true },
  { id: 'probability', label: 'Probability', group: 'concept', subject: 'Statistics', mastery: 60, importance: 80, frequency: 50, status: 'connected', difficulty: 'foundational' },
  { id: 'bayes', label: 'Bayes Theorem', group: 'concept', subject: 'Statistics', mastery: 50, importance: 72, frequency: 38, status: 'emerging', difficulty: 'intermediate' },
  { id: 'hypothesis', label: 'Hypothesis Testing', group: 'concept', subject: 'Statistics', mastery: 28, importance: 75, frequency: 18, status: 'weak', difficulty: 'intermediate' },
  { id: 'search', label: 'A* Search', group: 'concept', subject: 'Artificial Intelligence', mastery: 80, importance: 70, frequency: 60, status: 'core', difficulty: 'intermediate' },
  { id: 'bayesnet', label: 'Bayesian Networks', group: 'concept', subject: 'Artificial Intelligence', mastery: 68, importance: 74, frequency: 38, status: 'emerging', difficulty: 'advanced' },
  { id: 'trees', label: 'Binary Trees', group: 'concept', subject: 'Data Structures', mastery: 90, importance: 65, frequency: 50, status: 'core', difficulty: 'foundational' },
  { id: 'dp', label: 'Dynamic Programming', group: 'concept', subject: 'Data Structures', mastery: 82, importance: 68, frequency: 42, status: 'core', difficulty: 'advanced' },
  // Documents
  { id: 'doc-gd', label: 'Gradient Descent.pdf', group: 'document', subject: 'Machine Learning', mastery: 0, importance: 40, frequency: 6, difficulty: 'intermediate', recent: true },
  { id: 'doc-ht', label: 'Hypothesis Testing.pdf', group: 'document', subject: 'Statistics', mastery: 0, importance: 40, frequency: 3, difficulty: 'intermediate' },
  { id: 'doc-as', label: 'A* Search Notes', group: 'document', subject: 'Artificial Intelligence', mastery: 0, importance: 40, frequency: 4, difficulty: 'intermediate' },
]

export const graphEdges: Edge[] = [
  // Subject -> concept
  { source: 'ml', target: 'gradient', strength: 90 },
  { source: 'ml', target: 'neural', strength: 82 },
  { source: 'ml', target: 'overfitting', strength: 70 },
  { source: 'ml', target: 'svm', strength: 55 },
  { source: 'ml', target: 'classification', strength: 64 },
  { source: 'ml', target: 'optimization', strength: 88 },
  { source: 'stats', target: 'regression', strength: 80 },
  { source: 'stats', target: 'probability', strength: 75 },
  { source: 'stats', target: 'bayes', strength: 60 },
  { source: 'stats', target: 'hypothesis', strength: 45 },
  { source: 'ai', target: 'search', strength: 80 },
  { source: 'ai', target: 'bayesnet', strength: 66 },
  { source: 'ds', target: 'trees', strength: 92 },
  { source: 'ds', target: 'dp', strength: 82 },
  // Cross links
  { source: 'regression', target: 'ml', strength: 85 },
  { source: 'regression', target: 'optimization', strength: 78 },
  { source: 'optimization', target: 'gradient', strength: 86 },
  { source: 'optimization', target: 'neural', strength: 70 },
  { source: 'gradient', target: 'neural', strength: 75 },
  { source: 'probability', target: 'bayes', strength: 72 },
  { source: 'bayes', target: 'bayesnet', strength: 64 },
  { source: 'classification', target: 'svm', strength: 58 },
  { source: 'classification', target: 'neural', strength: 60 },
  { source: 'probability', target: 'classification', strength: 50 },
  { source: 'regression', target: 'classification', strength: 55 },
  // Documents
  { source: 'doc-gd', target: 'gradient', strength: 90 },
  { source: 'doc-ht', target: 'hypothesis', strength: 88 },
  { source: 'doc-as', target: 'search', strength: 85 },
]

export const conceptJourney = ['regression', 'gradient', 'optimization', 'neural']

export type StudyPathStatus = 'done' | 'current' | 'next' | 'locked'
export type StudyPathStep = { label: string; subject: string; status: StudyPathStatus }

export const aiCoach = {
  nextTopic: {
    mastered: 'Linear Regression',
    recommended: 'Logistic Regression',
    subject: 'Machine Learning',
    reason:
      "You've mastered Linear Regression (95%). Logistic Regression builds directly on it and unlocks the Classification track.",
    confidence: 91,
  },
  weakAreas: [
    { name: 'Hypothesis Testing', subject: 'Statistics', confidence: 28 },
    { name: 'Markov Decision Processes', subject: 'Artificial Intelligence', confidence: 20 },
    { name: 'Support Vector Machines', subject: 'Machine Learning', confidence: 52 },
  ],
  knowledgeGaps: [
    { subject: 'Machine Learning', missing: ['Ensemble Methods', 'Feature Engineering'] },
    { subject: 'Statistics', missing: ['ANOVA', 'Bayesian Inference'] },
    { subject: 'Big Data Analytics', missing: ['Stream Windowing', 'Lambda Architecture'] },
  ],
  studyPath: [
    { label: 'Statistics', subject: 'Foundations', status: 'done' },
    { label: 'Regression', subject: 'Machine Learning', status: 'done' },
    { label: 'Classification', subject: 'Machine Learning', status: 'current' },
    { label: 'Neural Networks', subject: 'Deep Learning', status: 'next' },
  ] as StudyPathStep[],
  examReadiness: {
    current: 72,
    potential: 85,
    hoursNeeded: 8,
    examName: 'GATE 2026',
  },
}

export const learningIntelligence = {
  mostStudied: { concept: 'Gradient Descent', subject: 'Machine Learning', sessions: 24 },
  weakest: { concept: 'Hypothesis Testing', subject: 'Statistics', mastery: 28 },
  fastestImproving: { subject: 'Machine Learning', delta: 12 },
  consistency: 86,
  coverage: 68,
  aiConfidence: 74,
  weeklyInsights: [
    'You improved Machine Learning mastery by 12% this week.',
    'Statistics is your weakest area — 3 concepts need review before your exam.',
    'A 14-day streak makes this your most consistent month yet.',
  ],
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which gradient descent variant updates parameters after every single training example?',
    options: ['Batch Gradient Descent', 'Stochastic Gradient Descent', 'Mini-batch Gradient Descent', 'Adam'],
    answer: 1,
    explanation: 'Stochastic Gradient Descent (SGD) updates weights after each individual sample, leading to noisier but faster updates.',
  },
  {
    id: 'q2',
    question: 'What does a high bias, low variance model typically suffer from?',
    options: ['Overfitting', 'Underfitting', 'Data leakage', 'Vanishing gradients'],
    answer: 1,
    explanation: 'High bias means the model is too simple to capture the underlying pattern, which causes underfitting.',
  },
  {
    id: 'q3',
    question: 'In A* search, the evaluation function is best described as:',
    options: ['f(n) = g(n)', 'f(n) = h(n)', 'f(n) = g(n) + h(n)', 'f(n) = g(n) - h(n)'],
    answer: 2,
    explanation: 'A* combines the actual cost so far g(n) with the heuristic estimate h(n): f(n) = g(n) + h(n).',
  },
  {
    id: 'q4',
    question: 'Which Spark abstraction represents an immutable distributed collection?',
    options: ['DataFrame only', 'RDD', 'Executor', 'DAG'],
    answer: 1,
    explanation: 'A Resilient Distributed Dataset (RDD) is the fundamental immutable, partitioned collection in Spark.',
  },
  {
    id: 'q5',
    question: 'A p-value of 0.03 with significance level 0.05 means you should:',
    options: ['Fail to reject H0', 'Reject the null hypothesis', 'Increase sample size', 'Accept H0 as true'],
    answer: 1,
    explanation: 'Since 0.03 < 0.05, the result is statistically significant and you reject the null hypothesis.',
  },
]

export const adminStats = {
  totalUsers: 24830,
  totalDocuments: 186420,
  totalConcepts: 1284000,
  activeToday: 7340,
  userGrowth: [
    { month: 'Jan', users: 4200 },
    { month: 'Feb', users: 7800 },
    { month: 'Mar', users: 11200 },
    { month: 'Apr', users: 15600 },
    { month: 'May', users: 20100 },
    { month: 'Jun', users: 24830 },
  ],
  engagement: [
    { feature: 'Summaries', usage: 84 },
    { feature: 'Quizzes', usage: 67 },
    { feature: 'Graph', usage: 52 },
    { feature: 'Search', usage: 91 },
    { feature: 'Gap Analysis', usage: 43 },
  ],
}

export const user = {
  name: 'Aarav Sharma',
  email: 'aarav@university.edu',
  initials: 'AS',
  plan: 'Pro',
  streak: 14,
  goal: 'GATE 2026 Preparation',
}

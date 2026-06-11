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
  title: string
  type: FileType
  subjectId: string
  subject: string
  size: string
  uploadedAt: string
  summarized: boolean
  concepts: number
  excerpt: string
}

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
    title: 'Gradient Descent & Optimization.pdf',
    type: 'pdf',
    subjectId: 'ml',
    subject: 'Machine Learning',
    size: '2.4 MB',
    uploadedAt: '2 hours ago',
    summarized: true,
    concepts: 14,
    excerpt:
      'Covers batch, stochastic, and mini-batch gradient descent with learning rate schedules and momentum.',
  },
  {
    id: 'k2',
    title: 'Spark Architecture Deep Dive.pptx',
    type: 'presentation',
    subjectId: 'bda',
    subject: 'Big Data Analytics',
    size: '8.1 MB',
    uploadedAt: 'Yesterday',
    summarized: true,
    concepts: 11,
    excerpt:
      'RDDs, DAG scheduler, executors, and the difference between transformations and actions.',
  },
  {
    id: 'k3',
    title: 'A* Search Lecture Notes',
    type: 'note',
    subjectId: 'ai',
    subject: 'Artificial Intelligence',
    size: '320 KB',
    uploadedAt: '2 days ago',
    summarized: true,
    concepts: 8,
    excerpt:
      'Admissible heuristics, the open/closed list, and optimality conditions for informed search.',
  },
  {
    id: 'k4',
    title: 'Whiteboard - Red-Black Trees.png',
    type: 'image',
    subjectId: 'ds',
    subject: 'Data Structures',
    size: '1.2 MB',
    uploadedAt: '3 days ago',
    summarized: false,
    concepts: 0,
    excerpt: 'Hand-drawn rotations and recoloring rules from the tutorial session.',
  },
  {
    id: 'k5',
    title: 'Hypothesis Testing Cheat Sheet.pdf',
    type: 'pdf',
    subjectId: 'stats',
    subject: 'Statistics',
    size: '640 KB',
    uploadedAt: '4 days ago',
    summarized: true,
    concepts: 12,
    excerpt: 'p-values, type I/II errors, t-tests, chi-square, and ANOVA in one reference.',
  },
  {
    id: 'k6',
    title: 'Normalization Forms Explained',
    type: 'note',
    subjectId: 'dbms',
    subject: 'Database Systems',
    size: '210 KB',
    uploadedAt: '5 days ago',
    summarized: true,
    concepts: 9,
    excerpt: '1NF through BCNF with worked examples and decomposition strategies.',
  },
  {
    id: 'k7',
    title: 'Neural Networks Crash Course.mp4',
    type: 'video',
    subjectId: 'ml',
    subject: 'Machine Learning',
    size: '124 MB',
    uploadedAt: '1 week ago',
    summarized: true,
    concepts: 16,
    excerpt: 'Backpropagation, activation functions, and regularization in a 45 min recording.',
  },
  {
    id: 'k8',
    title: 'MapReduce Patterns.pptx',
    type: 'presentation',
    subjectId: 'bda',
    subject: 'Big Data Analytics',
    size: '5.6 MB',
    uploadedAt: '1 week ago',
    summarized: false,
    concepts: 0,
    excerpt: 'Common MapReduce design patterns: summarization, filtering, and joins.',
  },
  {
    id: 'k9',
    title: 'Bayesian Networks Notes',
    type: 'note',
    subjectId: 'ai',
    subject: 'Artificial Intelligence',
    size: '480 KB',
    uploadedAt: '2 weeks ago',
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

export type Concept = {
  id: string
  label: string
  group: string
}
export type Edge = { source: string; target: string }

export const graphConcepts: Concept[] = [
  { id: 'regression', label: 'Regression', group: 'core' },
  { id: 'statistics', label: 'Statistics', group: 'subject' },
  { id: 'ml', label: 'Machine Learning', group: 'subject' },
  { id: 'datascience', label: 'Data Science', group: 'subject' },
  { id: 'gradient', label: 'Gradient Descent', group: 'concept' },
  { id: 'probability', label: 'Probability', group: 'concept' },
  { id: 'neural', label: 'Neural Networks', group: 'concept' },
  { id: 'overfitting', label: 'Overfitting', group: 'concept' },
  { id: 'bayes', label: 'Bayes Theorem', group: 'concept' },
]

export const graphEdges: Edge[] = [
  { source: 'regression', target: 'statistics' },
  { source: 'regression', target: 'ml' },
  { source: 'regression', target: 'datascience' },
  { source: 'ml', target: 'gradient' },
  { source: 'ml', target: 'neural' },
  { source: 'ml', target: 'overfitting' },
  { source: 'statistics', target: 'probability' },
  { source: 'statistics', target: 'bayes' },
  { source: 'datascience', target: 'probability' },
]

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

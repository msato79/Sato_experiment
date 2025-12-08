export type TaskType = 'A' | 'B';
export type Condition = 'A' | 'B' | 'C' | 'D';
export type AxisOffset = 0 | 1;
export type TaskOrder = 'A-B' | 'B-A';

export interface Trial {
  trial_id: string;
  task: TaskType;
  condition: Condition;
  axis_offset: AxisOffset;
  graph_file: string;
  node1: number;
  node2: number;
  node_pair_id?: string; // ノードペアの識別子（例: "pair_1", "pair_2", "pair_3"）
  set_id?: number; // セットID（ラテン方格法用、1-4）
  is_practice?: boolean; // If true, this is a practice trial (not logged to main data)
}

export interface TrialResult {
  subject_id: string;
  task: TaskType;
  condition: Condition;
  axis_offset: AxisOffset;
  graph_file: string;
  trial_id: string;
  node_pair_id?: string; // ノードペアの識別子（例: "pair_1", "pair_2", "pair_3"）
  set_id?: number; // セットID（ラテン方格法用、1-4）
  node1?: number; // ノード1のID（分析用）
  node2?: number; // ノード2のID（分析用）
  highlighted_nodes: number[]; // Array of 2 node IDs (node1, node2)
  answer: string; // For Task A: "2" or "3" (where "3" means "3 or more"); For Task B: comma-separated node IDs
  correct: boolean;
  reaction_time_ms: number;
  click_count: number;
  timestamp: string;
}

export interface SurveyResponse {
  task: TaskType; // どのタスクのアンケートか
  preferredCondition: Condition; // 最もわかりやすい表示方法
  timestamp: string;
}

export interface ParticipantData {
  participant_id: string;
  trials: TrialResult[];
  task_surveys: SurveyResponse[]; // Task-level surveys（タスク終了後のアンケート）
  start_time: string;
  end_time?: string;
}

export interface ExperimentConfig {
  PER_TRIAL_SURVEY: boolean;
  COUNTERBALANCING_METHOD: 'latin-square' | 'random';
}

export interface GraphViewerConfig {
  condition: Condition;
  axis_offset: AxisOffset;
  onNodeClick?: (nodeId: number) => void;
}

export interface GraphViewerAPI {
  loadGraph: (graphData: { nodes: any[]; edges: any[] }) => void;
  setCondition: (condition: Condition, axisOffset: AxisOffset) => void;
  highlightNode: (nodeId: number, highlight: boolean) => void;
  setStartNode: (nodeId: number | null) => void;
  setTargetNode: (nodeId: number | null) => void;
  setSelectedNodes: (nodeIds: number[]) => void; // For Task B: highlight selected nodes (yellow/orange)
  setCorrectAnswerNodes: (nodeIds: number[]) => void; // For Task B practice: highlight correct answer nodes (blue)
  onNodeClick: (callback: (nodeId: number) => void) => void;
  pauseRotation: () => void;
  resumeRotation: () => void;
  setWiggleFrequency?: (frequencyMs: number) => void; // Optional: for wiggle animation
  destroy: () => void;
}


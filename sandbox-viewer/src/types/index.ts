export interface RunMetadata {
  run_id: string;
  started_at: string;
  rollout_count: number;
}

export interface RolloutMetadata {
  run_id: string;
  rollout_id: string;
  sandbox_id: string;
  started_at: string;
  finished_at: string | null;
  commands_count: number;
}

export interface Command {
  timestamp: string;
  turn: number | null;
  tool_call_id: string | null;
  tool_name: string | null;
  tool_args: Record<string, unknown> | null;
  command: string;
  stdout: string;
  stderr: string;
  duration_ms: number;
  error: string | null;
  tool_response: string | null;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
}

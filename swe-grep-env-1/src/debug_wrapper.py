import json
import time
import base64
import os
from pathlib import Path
from datetime import datetime

# Default output to sandbox-viewer's debug_output directory
DEFAULT_OUTPUT_DIR = Path(__file__).parent.parent.parent / "sandbox-viewer" / "debug_output"


class DebugSandboxClient:
    def __init__(self, client, output_dir=None, workspace="/root"):
        if output_dir is None:
            output_dir = os.environ.get("DEBUG_OUTPUT_DIR", str(DEFAULT_OUTPUT_DIR))
        self._client = client
        self._output_dir = Path(output_dir)
        self._workspace = workspace
        # Per-sandbox state to handle parallel rollouts
        self._sandbox_state = {}

    def set_context(self, run_id: str, rollout_id: str, sandbox_id: str):
        started_at = datetime.now().isoformat()

        # Structure: debug_output/runs/{run_id}/rollouts/{rollout_id}/
        run_dir = self._output_dir / "runs" / run_id
        rollout_dir = run_dir / "rollouts" / rollout_id
        rollout_dir.mkdir(parents=True, exist_ok=True)

        # Store per-sandbox state
        self._sandbox_state[sandbox_id] = {
            "run_id": run_id,
            "rollout_id": rollout_id,
            "sandbox_id": sandbox_id,
            "started_at": started_at,
            "command_count": 0,
            "rollout_dir": rollout_dir,
            "log_file": rollout_dir / "commands.jsonl",
            "tar_file": rollout_dir / "filesystem.tar.gz",
        }

        # Write rollout metadata immediately (will be updated in delete with finished_at)
        rollout_metadata = {
            "run_id": run_id,
            "rollout_id": rollout_id,
            "sandbox_id": sandbox_id,
            "started_at": started_at,
            "finished_at": None,
            "commands_count": 0
        }
        metadata_file = rollout_dir / "metadata.json"
        metadata_file.write_text(json.dumps(rollout_metadata, indent=2))

        # Write/update run metadata
        run_metadata_file = run_dir / "metadata.json"
        if run_metadata_file.exists():
            run_metadata = json.loads(run_metadata_file.read_text())
            run_metadata["rollout_count"] = run_metadata["rollout_count"] + 1
        else:
            run_metadata = {
                "run_id": run_id,
                "started_at": started_at,
                "rollout_count": 1
            }
        run_metadata_file.write_text(json.dumps(run_metadata, indent=2))

    async def execute_command(self, sandbox_id: str, command: str, **kwargs):
        start = time.perf_counter()
        try:
            result = await self._client.execute_command(sandbox_id, command, **kwargs)
            self._log(sandbox_id, command, result.stdout or "", result.stderr or "", time.perf_counter() - start)
            return result
        except Exception as e:
            self._log(sandbox_id, command, "", "", time.perf_counter() - start, str(e))
            raise

    def set_turn_context(self, sandbox_id: str, turn: int, tool_call_id: str):
        """Set the current turn context for command logging."""
        state = self._sandbox_state.get(sandbox_id)
        if state:
            state["current_turn"] = turn
            state["current_tool_call_id"] = tool_call_id

    def _log(self, sandbox_id: str, command: str, stdout: str, stderr: str, duration: float, error: str = None):
        state = self._sandbox_state.get(sandbox_id)
        if not state:
            return
        state["command_count"] += 1
        with open(state["log_file"], "a") as f:
            f.write(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "turn": state.get("current_turn"),
                "tool_call_id": state.get("current_tool_call_id"),
                "command": command,
                "stdout": stdout,
                "stderr": stderr,
                "duration_ms": round(duration * 1000),
                "error": error
            }) + "\n")

    async def delete(self, sandbox_id, **kwargs):
        state = self._sandbox_state.get(sandbox_id)

        # Only capture filesystem if we have state for this sandbox
        if state:
            try:
                # Capture from the sandbox's working directory (where vscode is cloned)
                result = await self._client.execute_command(
                    sandbox_id, "tar -czf - . 2>/dev/null | base64 -w0"
                )
                if result.stdout:
                    state["tar_file"].write_bytes(base64.b64decode(result.stdout))
            except:
                pass

            # Write rollout metadata
            rollout_metadata = {
                "run_id": state["run_id"],
                "rollout_id": state["rollout_id"],
                "sandbox_id": state["sandbox_id"],
                "started_at": state["started_at"],
                "finished_at": datetime.now().isoformat(),
                "commands_count": state["command_count"]
            }
            metadata_file = state["rollout_dir"] / "metadata.json"
            metadata_file.write_text(json.dumps(rollout_metadata, indent=2))

            # Clean up state
            del self._sandbox_state[sandbox_id]

        return await self._client.delete(sandbox_id, **kwargs)

    def teardown(self):
        if hasattr(self._client, 'teardown'):
            self._client.teardown()

    def __getattr__(self, name):
        return getattr(self._client, name)

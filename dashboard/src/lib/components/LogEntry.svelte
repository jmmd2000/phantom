<script lang="ts">
  import { fly } from "svelte/transition";
  let { log, onCopy } = $props();

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();

  const getStatusType = (status: number) => {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "success";
  };
</script>

<div class="log-entry" in:fly={{ y: -10, duration: 200 }}>
  <span class="method method-{log.method.toLowerCase()}">{log.method}</span>
  <span class="path">{log.path}</span>
  <button class="copy-button" onclick={() => onCopy(log.path)}>Copy</button>
  <span class="status status-{getStatusType(log.status)}">
    {log.status}
  </span>
  <span class="timestamp">{formatTime(log.timestamp)}</span>
</div>

<style>
  .log-entry {
    background-color: var(--bg-surface);
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    min-width: 0;

    &:hover {
      border-color: var(--accent-light);
      border-left: 3px solid var(--accent);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    &:hover .copy-button {
      opacity: 1;
    }
  }

  .method {
    font-weight: 700;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    min-width: 58px;
    text-align: center;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .method-get {
    color: var(--method-get);
    background: rgba(91, 164, 207, 0.12);
  }
  .method-post {
    color: var(--method-post);
    background: rgba(139, 92, 246, 0.1);
  }
  .method-put {
    color: var(--method-put);
    background: rgba(196, 107, 26, 0.1);
  }
  .method-patch {
    color: var(--method-patch);
    background: rgba(244, 132, 95, 0.1);
  }
  .method-delete {
    color: var(--method-delete);
    background: rgba(160, 48, 48, 0.1);
  }

  .path {
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .copy-button {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.15rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.15s ease;
    flex-shrink: 0;
    font-size: 0.7rem;
    font-family: inherit;

    &:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
  }

  .status {
    margin-left: auto;
    font-weight: 700;
    flex-shrink: 0;
  }

  .status-success {
    color: var(--status-success);
  }
  .status-warn {
    color: var(--status-warning);
  }
  .status-error {
    color: var(--status-error);
  }

  .timestamp {
    color: var(--accent-light);
    font-size: 0.8rem;
    flex-shrink: 0;
  }
</style>

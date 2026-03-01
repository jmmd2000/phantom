<script lang="ts">
  import { onMount } from "svelte";
  import { connectToServer, requestLog } from "$lib/ws";

  onMount(() => {
    connectToServer();
  });

  function getStatusClass(status: number) {
    if (status >= 500) return "status-error";
    if (status >= 400) return "status-warn";
    return "status-success";
  }
</script>

<div class="page-header">
  <h2>Request Feed</h2>
  <div class="status-indicator">
    <span class="dot"></span>
    Dashboard active
  </div>
</div>

{#if $requestLog.length === 0}
  <div class="empty">
    <p>No activity yet...</p>
    <code>curl http://localhost:3001/health</code>
  </div>
{:else}
  <div class="log-feed">
    {#each $requestLog as log (log.id)}
      <div class="log-entry {log.status >= 400 ? 'entry-fail' : ''}">
        <span class="method method-{log.method.toLowerCase()}">{log.method}</span>
        <span class="path">{log.path}</span>
        <span class="status {getStatusClass(log.status)}">{log.status}</span>
        <span class="time">{new Date(log.timestamp).toLocaleTimeString()}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
    margin-bottom: 2rem;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .dot {
    width: 8px;
    height: 8px;
    background-color: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 8px #22c55e;
  }
  .log-entry {
    background-color: var(--bg-sidebar);
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9rem;
    transition: transform 0.1s ease;
  }

  .log-entry:hover {
    border-color: var(--color-cyan);
    cursor: pointer;
  }

  .entry-fail {
    border-left: 3px solid #f87171 !important;
    background-color: rgba(248, 113, 113, 0.05);
  }

  .method {
    font-weight: 800;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    min-width: 60px;
    text-align: center;
    background: #334155;
  }

  /* Color coding methods */
  .method-get {
    color: #60a5fa;
    border: 1px solid #1e40af;
  }
  .method-post {
    color: #4ade80;
    border: 1px solid #166534;
  }
  .method-put {
    color: #facc15;
    border: 1px solid #854d0e;
  }
  .method-delete {
    color: #f87171;
    border: 1px solid #991b1b;
  }

  .path {
    flex: 1;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status {
    font-weight: bold;
  }
  .status-success {
    color: #4ade80;
  }
  .status-warn {
    color: #fbbf24;
  }
  .status-error {
    color: #f87171;
  }

  .time {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 6rem;
    color: var(--text-secondary);
    text-align: center;
  }

  .empty p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .empty code {
    background-color: var(--bg-sidebar);
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    color: var(--color-cyan);
    font-family: ui-monospace, monospace;
    font-size: 0.9rem;
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { connectToServer, requestLog, isConnected } from "$lib/ws";
  import StatusIndicator from "$lib/components/StatusIndicator.svelte";
  import LogEntry from "$lib/components/LogEntry.svelte";

  onMount(() => {
    connectToServer();
  });

  function getStatusClass(status: number) {
    if (status >= 500) return "status-error";
    if (status >= 400) return "status-warn";
    return "status-success";
  }

  async function clearLogs() {
    await fetch("http://localhost:3001/_admin/clear", { method: "POST" });
    requestLog.set([]);
  }

  async function copyToClipboard(path: string) {
    const fullUrl = `http://localhost:3001${path}`;
    await navigator.clipboard.writeText(fullUrl);
  }
</script>

<div class="page-header">
  <div class="header-left">
    <h2>Request Feed</h2>
    <StatusIndicator online={$isConnected} />
  </div>

  {#if $requestLog.length > 0}
    <button class="clear-button" onclick={clearLogs}>Clear Logs</button>
  {/if}
</div>

{#if $requestLog.length === 0}
  <div class="empty">
    <p>No activity yet...</p>
    <code>curl http://localhost:3001/health</code>
  </div>
{:else}
  <div class="log-feed">
    {#each $requestLog as log (log.id)}
      <LogEntry {log} onCopy={copyToClipboard} />
    {/each}
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.75rem;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--accent);
  }

  .log-feed {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 2rem;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 6rem;
    color: var(--text-secondary);
    text-align: center;

    & p {
      font-size: 1.05rem;
      margin-bottom: 1.25rem;
    }

    & code {
      background-color: var(--accent-subtle);
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      color: var(--accent);
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
    }
  }

  .clear-button {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 0.85rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: inherit;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
  }
</style>

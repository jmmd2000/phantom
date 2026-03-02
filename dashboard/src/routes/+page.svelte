<script lang="ts">
  import { onMount } from "svelte";
  import { connectToServer, requestLog, isConnected, isGlobalExpanded } from "$lib/ws";
  import StatusIndicator from "$lib/components/StatusIndicator.svelte";
  import LogEntry from "$lib/components/LogEntry.svelte";
  import SearchInput from "$lib/components/SearchInput.svelte";

  onMount(() => {
    connectToServer();
  });

  let searchTerm = $state("");

  let filteredLogs = $derived(
    $requestLog.filter(
      (log) =>
        log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function toggleExpandAll() {
    isGlobalExpanded.update((v) => !v);
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

    {#if $requestLog.length > 0}
      <div class="header-controls">
        <SearchInput bind:value={searchTerm} />
        <button class="control-button" onclick={toggleExpandAll}>
          {$isGlobalExpanded ? "Collapse All" : "Expand All"}
        </button>
        <button class="clear-button" onclick={clearLogs}>Clear Logs</button>
      </div>
    {/if}
  </div>
</div>

{#if filteredLogs.length === 0}
  <div class="empty">
    <p>{searchTerm ? "No requests match your search." : "No activity yet..."}</p>
    {#if !searchTerm}
      <code>curl http://localhost:3001/health</code>
    {/if}
  </div>
{:else}
  <div class="log-feed">
    {#each filteredLogs as log (log.id)}
      <LogEntry {log} onCopy={copyToClipboard} />
    {/each}
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    justify-content: start;
    align-items: flex-end;
    margin-bottom: 2rem;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .control-button {
    background: transparent;
    border: 2px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--accent);
      color: var(--text-sidebar);
      background-color: var(--accent);
    }
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
    gap: 0.2rem;
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
    border: 2px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 0.85rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: inherit;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--accent);
      color: var(--text-sidebar);
      background-color: var(--accent);
    }
  }
</style>

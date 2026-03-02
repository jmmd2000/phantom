<script lang="ts">
  import { Download, Trash2, Maximize2, Minimize2 } from "lucide-svelte";
  import {
    requestLog,
    isConnected,
    isGlobalExpanded,
    activeMethodFilter,
    activeStatusFilter,
  } from "$lib/ws";
  import StatusIndicator from "$lib/components/StatusIndicator.svelte";
  import LogEntry from "$lib/components/LogEntry.svelte";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import ExportButton from "$lib/components/ExportButton.svelte";
  import Button from "$lib/components/Button.svelte";

  let searchTerm = $state("");

  let filteredLogs = $derived(
    $requestLog.filter((log) => {
      const matchesSearch =
        log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.body && log.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.responseBody && JSON.stringify(log.responseBody).toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMethod = $activeMethodFilter ? log.method === $activeMethodFilter : true;

      let matchesStatus = true;
      if ($activeStatusFilter === "2xx") matchesStatus = log.status >= 200 && log.status < 300;
      if ($activeStatusFilter === "4xx") matchesStatus = log.status >= 400 && log.status < 500;
      if ($activeStatusFilter === "5xx") matchesStatus = log.status >= 500;

      return matchesSearch && matchesMethod && matchesStatus;
    })
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
        <Button onclick={toggleExpandAll} active={$isGlobalExpanded}>
          {#snippet icon()}
            {#if $isGlobalExpanded}
              <Minimize2 size={14} strokeWidth={2.5} />
            {:else}
              <Maximize2 size={14} strokeWidth={2.5} />
            {/if}
          {/snippet}
          {$isGlobalExpanded ? "Collapse All" : "Expand All"}
        </Button>
        <ExportButton />
        <Button variant="danger" onclick={clearLogs}>
          {#snippet icon()}
            <Trash2 size={14} strokeWidth={2.5} />
          {/snippet}
          Clear Logs
        </Button>
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
</style>

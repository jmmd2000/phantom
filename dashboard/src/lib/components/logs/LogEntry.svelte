<script lang="ts">
  import { fly } from "svelte/transition";
  import { ChevronRight } from "lucide-svelte";
  import { isGlobalExpanded } from "$lib/ws";
  import LogDetails from "./LogDetails.svelte";
  import Badge from "../ui/Badge.svelte";
  let { log, onCopy } = $props();

  let isExpanded = $state(false);

  // Sync with global store toggle
  $effect(() => {
    isExpanded = $isGlobalExpanded;
  });

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toTimeString().split(" ")[0];
  };

  const getStatusType = (status: number) => {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "success";
  };
</script>

<div
  class="log-entry"
  class:expanded={isExpanded}
  in:fly={{ y: -10, duration: 200 }}
  onclick={() => (isExpanded = !isExpanded)}
  onkeydown={(e) => e.key === "Enter" && (isExpanded = !isExpanded)}
  role="button"
  tabindex="0"
>
  <div class="summary-line">
    <span class="chevron" class:rotated={isExpanded}>
      <ChevronRight size={14} strokeWidth={3} />
    </span>
    <Badge type={log.method} label={log.method} />
    <span class="path">{log.path}</span>
    <button
      class="copy-button"
      onclick={(e) => {
        e.stopPropagation();
        onCopy(log.path);
      }}
    >
      Copy
    </button>

    {#if log.duration !== undefined}
      <span class="duration" class:slow={log.duration > 500}>
        {log.duration}ms
      </span>
    {/if}

    <Badge type={getStatusType(log.status)} label={log.status} />
    <span class="timestamp">{formatTime(log.timestamp)}</span>
  </div>

  {#if isExpanded}
    <LogDetails {log} />
  {/if}
</div>

<style>
  .log-entry {
    background-color: var(--bg-surface);
    padding: 0.75rem 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    min-width: 0;
    cursor: pointer;
    outline: none;

    &:hover {
      border-color: var(--accent-light);
      border-left: 3px solid var(--accent);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    &:focus-visible {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-subtle);
    }

    &.expanded {
      border-color: var(--accent-light);
      border-left: 3px solid var(--accent);
      background-color: var(--bg-surface-elevated);
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    &:hover .copy-button {
      opacity: 1;
    }
  }

  .summary-line {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .chevron {
    color: var(--text-secondary);
    transition:
      transform 0.2s ease,
      color 0.15s ease;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: -0.25rem;
  }

  .chevron.rotated {
    transform: rotate(90deg);
    color: var(--accent);
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
    border: 2px solid var(--border-color);
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
      color: var(--text-sidebar);
      background-color: var(--accent);
    }
  }

  .duration {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;

    &.slow {
      color: var(--status-warning);
    }
  }

  .timestamp {
    color: var(--accent-light);
    font-size: 0.8rem;
    flex-shrink: 0;
    min-width: 85px;
    text-align: right;
  }
</style>

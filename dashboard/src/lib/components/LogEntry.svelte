<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { ChevronRight } from "lucide-svelte";
  import { isGlobalExpanded } from "$lib/ws";
  let { log, onCopy } = $props();

  let isExpanded = $state(false);

  // Sync with global store toggle
  $effect(() => {
    isExpanded = $isGlobalExpanded;
  });

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();

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
    <span class="method method-{log.method.toLowerCase()}">{log.method}</span>
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

    <span class="status status-{getStatusType(log.status)}">
      {log.status}
    </span>
    <span class="timestamp">{formatTime(log.timestamp)}</span>
  </div>

  {#if isExpanded}
    <div class="details" transition:slide={{ duration: 200 }}>
      <div class="exchange-grid">
        <div class="detail-section">
          <h4 class="detail-label">Request</h4>
          <div class="section-content">
            <h5 class="sub-label">Headers</h5>
            <div class="headers-grid">
              {#each Object.entries(log.headers ?? {}) as [key, val]}
                <span class="header-key">{key}:</span>
                <span class="header-val">{val}</span>
              {/each}
            </div>

            {#if log.body}
              <h5 class="sub-label">Body</h5>
              <pre class="body-content"><code>{log.body}</code></pre>
            {/if}
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-label">Response</h4>
          <div class="section-content">
            <div class="status-summary">
              <span class="status status-{getStatusType(log.status)}">
                {log.status}
              </span>
              <span class="duration">{log.duration}ms</span>
            </div>

            <h5 class="sub-label">Body</h5>
            <pre class="body-content"><code>{JSON.stringify(log.responseBody, null, 2)}</code
              ></pre>
          </div>
        </div>
      </div>
    </div>
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

  .status {
    font-weight: 700;
    flex-shrink: 0;
    min-width: 32px;
    text-align: right;
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
    min-width: 85px;
    text-align: right;
  }

  /* Details Section */
  .details {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 0 0.5rem 0;
    border-top: 1px solid var(--border-color);
    width: 100%;
    overflow: hidden;
  }

  .exchange-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.05);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }

  .detail-label {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sub-label {
    margin: 0;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--accent-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-summary {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: -0.25rem;

    & .status {
      text-align: left;
      min-width: 0;
    }

    & .duration {
      margin-left: 0;
    }
  }

  .headers-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1.5rem;
    row-gap: 0.35rem;
    font-size: 0.82rem;
  }

  .header-key {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .header-val {
    color: var(--text-primary);
    word-break: break-all;
  }

  .body-content {
    margin: 0;
    background: var(--bg-main);
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    font-size: 0.82rem;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 250px;
    overflow-y: auto;
  }
</style>

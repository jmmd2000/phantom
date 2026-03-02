  <script lang="ts">
  import { slide } from "svelte/transition";
  import Badge from "../ui/Badge.svelte";

  let { log }: { log: any } = $props();

  const getStatusType = (status: number) => {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "success";
  };
</script>

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
          <Badge type={getStatusType(log.status)} label={log.status} />
          <span class="duration">{log.duration}ms</span>
        </div>

        <h5 class="sub-label">Body</h5>
        <pre class="body-content"><code>{JSON.stringify(log.responseBody, null, 2)}</code></pre>
      </div>
    </div>
  </div>
</div>

<style>
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
  }

  .duration {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
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

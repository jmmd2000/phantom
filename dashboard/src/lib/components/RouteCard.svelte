<script lang="ts">
  let { path, status, method = "GET" } = $props();
</script>

<div class="route-card">
  <span class="route-path">{path}</span>
  <div class="route-info">
    <span>status: <span class="status-tag">{status}</span></span>
    <span class="route-method">{method}</span>
  </div>
</div>

<style>
  .route-card {
    background: var(--bg-sidebar-surface);
    border: 1px solid var(--border-sidebar);
    padding: 0.65rem 0.85rem;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--accent-light);
    }
  }

  .route-path {
    color: var(--text-sidebar);
    font-family: ui-monospace, monospace;
    font-size: 0.82rem;
    font-weight: 600;
    word-break: break-all;
  }

  .route-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    color: var(--text-sidebar-muted);
  }

  .status-tag {
    font-weight: 700;
    color: var(--text-sidebar);
    background: rgba(255, 255, 255, 0.08);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
  }

  .route-method {
    font-weight: 700;
    font-size: 0.65rem;
    color: var(--text-sidebar-muted);
  }
</style>

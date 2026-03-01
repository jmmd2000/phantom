<script lang="ts">
  import { tick } from "svelte";
  import { Settings } from "lucide-svelte";
  import { mockRoutes, saveRoutes, type RouteConfig } from "$lib/routes.svelte";
  import Toggle from "./Toggle.svelte";

  let {
    route,
    index,
    onopen,
  }: {
    route: RouteConfig;
    index: number;
    onopen: () => void;
  } = $props();

  const handleToggle = async () => {
    await tick();
    saveRoutes();
  };
</script>

<div class="route-card" class:disabled={!route.enabled}>
  <div class="route-header">
    <span class="route-path">{route.path}</span>
    <div class="route-controls">
      <button class="settings-button" onclick={onopen} aria-label="Route settings">
        <Settings size={16} />
      </button>
      <Toggle bind:checked={mockRoutes.items[index].enabled} onchange={handleToggle} />
    </div>
  </div>
  <div class="route-info">
    <span>status: <span class="status-tag">{route.status}</span></span>
    <span class="route-method">{route.method}</span>
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
    transition:
      border-color 0.2s ease,
      opacity 0.2s ease;

    &:hover {
      border-color: var(--accent-light);
    }
  }

  .route-card.disabled {
    opacity: 0.4;
  }

  .route-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
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

  .route-controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
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

  .settings-button {
    background: none;
    border: none;
    color: var(--text-sidebar-muted);
    cursor: pointer;
    padding: 0.15rem;
    border-radius: 3px;
    display: flex;
    align-items: center;
    transition: color 0.15s ease;

    &:hover {
      color: var(--text-sidebar);
    }
  }
</style>

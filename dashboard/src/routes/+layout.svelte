<script lang="ts">
  import { fetchMockRoutes, mockRoutes } from "$lib/routes";
  import { onMount } from "svelte";
  import "../app.css";

  onMount(() => {
    fetchMockRoutes();
  });
</script>

<div class="app-layout">
  <aside class="sidebar">
    <div class="logo-area">
      <span class="logo-box">PHANTOM</span>
      <span class="version">v0.0.0</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-header">MOCK ROUTES</div>
      <div class="route-list">
        {#each $mockRoutes as route}
          <div class="route-card">
            <span class="route-path">{route.path}</span>
            <div class="route-info">
              <span>status: <span class="status-tag">{route.status}</span></span>
              <span>{route.method || "GET"}</span>
            </div>
          </div>
        {/each}
      </div>
    </nav>
  </aside>

  <main class="content">
    <slot />
  </main>
</div>

<style>
  .app-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .sidebar {
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100vh;
    overflow: hidden;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .logo-box {
    background-color: var(--color-cyan);
    color: #000;
    padding: 0.25rem 0.5rem;
    font-weight: 800;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
  }

  .version {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .nav-header {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .content {
    overflow-y: auto;
    height: 100vh;
    padding: 2rem;
    min-width: 0;
  }

  .route-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    flex: 1;
    padding-right: 0.5rem;
  }

  .route-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: var(--color-cyan);
    }
  }

  .route-path {
    color: var(--color-cyan);
    font-family: ui-monospace, monospace;
    font-size: 0.85rem;
    font-weight: 600;
    word-break: break-all;
  }

  .route-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .status-tag {
    font-weight: bold;
    color: var(--text-primary);
    background: var(--border-color);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
  }
</style>

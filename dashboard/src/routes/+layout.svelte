<script lang="ts">
  import type { Snippet } from "svelte";
  import { fetchMockRoutes, mockRoutes } from "$lib/routes.svelte";
  import { onMount } from "svelte";
  import PhantomLogo from "$lib/components/PhantomLogo.svelte";
  import "../app.css";
  import RouteCard from "$lib/components/RouteCard.svelte";
  import RouteDialog from "$lib/components/RouteDialog.svelte";
  import { connectToServer, activeMethodFilter, activeStatusFilter } from "$lib/ws";
  import { ChevronRight } from "lucide-svelte";
  import { slide } from "svelte/transition";

  let { children }: { children: Snippet } = $props();
  let selectedRouteIndex = $state<number | null>(null);
  let isFiltersOpen = $state(true);

  onMount(() => {
    fetchMockRoutes();
    connectToServer();
  });
</script>

<div class="app-layout">
  <aside class="sidebar">
    <div class="logo-area">
      <span class="logo">
        <PhantomLogo size={36} />
      </span>
      <div class="logo-text">
        <span class="logo-name">PHANTOM</span>
        <span class="version">v0.0.0</span>
      </div>
    </div>
    <div class="sidebar-divider"></div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div
          class="section-header interactive"
          onclick={() => (isFiltersOpen = !isFiltersOpen)}
          onkeydown={(e) => e.key === "Enter" && (isFiltersOpen = !isFiltersOpen)}
          role="button"
          tabindex="0"
        >
          <span class="nav-label">FILTERS</span>
          <ChevronRight
            size={14}
            strokeWidth={3}
            class="section-chevron {isFiltersOpen ? 'rotated' : ''}"
          />
        </div>

        {#if isFiltersOpen}
          <div class="section-content" transition:slide={{ duration: 200 }}>
            <div class="filter-group">
              <div class="filter-label">Method</div>
              <div class="filter-buttons">
                {#each ["GET", "POST", "PUT", "PATCH", "DELETE"] as m}
                  <button
                    class="filter-btn"
                    class:active={$activeMethodFilter === m}
                    onclick={() =>
                      activeMethodFilter.set($activeMethodFilter === m ? null : m)}
                  >
                    {m}
                  </button>
                {/each}
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-label">Status</div>
              <div class="filter-buttons">
                {#each ["2xx", "4xx", "5xx"] as s}
                  <button
                    class="filter-btn"
                    class:active={$activeStatusFilter === s}
                    onclick={() =>
                      activeStatusFilter.set($activeStatusFilter === s ? null : s)}
                  >
                    {s}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="nav-section">
        <div class="section-header">
          <span class="nav-label">MOCK ROUTES</span>
        </div>
        <div class="route-list">
          {#each mockRoutes.items as route, i}
            <RouteCard {route} index={i} onopen={() => (selectedRouteIndex = i)} />
          {/each}
        </div>
      </div>
    </nav>
  </aside>

  <main class="content">
    {@render children()}
  </main>
</div>

{#if selectedRouteIndex !== null}
  <RouteDialog index={selectedRouteIndex} onclose={() => (selectedRouteIndex = null)} />
{/if}

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
    border-right: 1px solid var(--border-sidebar);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100vh;
    overflow: hidden;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .logo {
    flex-shrink: 0;
    color: var(--accent-light);
    display: flex;
    align-items: center;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .logo-name {
    color: var(--text-sidebar);
    font-weight: 800;
    font-size: 0.95rem;
    letter-spacing: 0.12em;
  }

  .version {
    font-size: 0.65rem;
    color: var(--text-sidebar-muted);
  }

  .sidebar-divider {
    height: 1px;
    background: linear-gradient(to right, var(--accent-light), transparent);
    flex-shrink: 0;
    margin: -0.25rem 0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin-bottom: 1.5rem;
  }

  .nav-section:last-of-type {
    flex: 1;
    overflow: hidden;
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 0.75rem;
    transition: border-color 0.15s ease;
  }

  .section-header.interactive {
    cursor: pointer;
    user-select: none;
    outline: none;

    &:hover {
      border-bottom-color: rgba(255, 255, 255, 0.15);
    }

    &:hover .nav-label {
      opacity: 1;
    }
  }

  .nav-label {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-sidebar);
    letter-spacing: 0.15em;
    opacity: 0.8;
    transition: opacity 0.15s ease;
  }

  :global(.section-chevron) {
    color: var(--text-sidebar-muted);
    transition:
      transform 0.2s ease,
      color 0.15s ease;
  }

  :global(.section-chevron.rotated) {
    transform: rotate(90deg);
    color: var(--accent);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .filter-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-sidebar);
    opacity: 0.6;
    text-transform: uppercase;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .filter-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-sidebar-muted);
    font-family: ui-monospace, monospace;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-sidebar);
      border-color: rgba(255, 255, 255, 0.15);
    }

    &.active {
      background: var(--accent);
      color: var(--text-sidebar);
      border-color: var(--accent);
      box-shadow: 0 0 12px rgba(91, 164, 207, 0.2);
    }
  }

  .content {
    overflow-y: auto;
    height: 100vh;
    padding: 2rem;
    min-width: 0;
    scrollbar-color: var(--accent-light) transparent;
  }

  .route-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow-y: auto;
    flex: 1;
    padding-right: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--accent-light) transparent;
  }
</style>

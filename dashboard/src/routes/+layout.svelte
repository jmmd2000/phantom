<script lang="ts">
  import type { Snippet } from "svelte";
  import { fetchMockRoutes, mockRoutes } from "$lib/routes.svelte";
  import { onMount } from "svelte";
  import PhantomLogo from "$lib/components/PhantomLogo.svelte";
  import "../app.css";
  import RouteCard from "$lib/components/RouteCard.svelte";
  import RouteDialog from "$lib/components/RouteDialog.svelte";
  import { connectToServer } from "$lib/ws";

  let { children }: { children: Snippet } = $props();
  let selectedRouteIndex = $state<number | null>(null);

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
      <div class="nav-header">MOCK ROUTES</div>
      <div class="route-list">
        {#each mockRoutes.items as route, i}
          <RouteCard {route} index={i} onopen={() => (selectedRouteIndex = i)} />
        {/each}
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
    gap: 2rem;
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
    margin: -0.5rem 0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .nav-header {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-sidebar-muted);
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    flex-shrink: 0;
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
  }
</style>

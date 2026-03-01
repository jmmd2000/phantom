<script lang="ts">
  import "../app.css";
</script>

<div class="app-layout">
  <aside class="sidebar">
    <div class="logo-area">
      <span class="logo-box">PHANTOM</span>
      <span class="version">v0.0.0</span>
    </div>
    <nav>
      <div class="nav-header">MOCK ROUTES</div>
      <div class="route-text">Routes will appear here</div>
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
  }

  .sidebar {
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  .nav-header {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }

  .route-text {
    font-size: 0.875rem;
    color: #475569;
    font-style: italic;
  }

  .content {
    overflow-y: auto;
    padding: 2rem;
  }
</style>

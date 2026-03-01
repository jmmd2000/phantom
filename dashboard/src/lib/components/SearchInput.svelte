<script lang="ts">
  let { value = $bindable("") } = $props();
</script>

<div class="search-container">
  <input
    type="text"
    placeholder="Filter by path or method..."
    bind:value
    class="search-input"
  />
  {#if value}
    <button class="clear-search" onclick={() => (value = "")} title="Clear search">
      &times;
    </button>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    background: var(--bg-main);
    border: 2px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 2rem 0.4rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    width: 200px;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: var(--accent);
    }
  }

  .clear-search {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0;

    &:hover {
      color: var(--text-primary);
    }
  }
</style>

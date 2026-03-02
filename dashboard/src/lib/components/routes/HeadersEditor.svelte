<script lang="ts">
  let {
    headers = $bindable({}),
    onchange,
  }: {
    headers: Record<string, string>;
    onchange: () => void;
  } = $props();

  // Local UI state for rows to handle reactivity smoothly
  let rows = $state(
    Object.entries(headers).map(([key, value]) => ({ key, value })),
  );

  const handleHeaderChange = () => {
    const newHeaders: Record<string, string> = {};
    rows.forEach((row) => {
      if (row.key.trim()) {
        newHeaders[row.key.trim()] = row.value;
      }
    });
    headers = newHeaders;
    onchange();
  };

  const addHeader = () => {
    rows.push({ key: "", value: "" });
  };

  const removeHeader = (i: number) => {
    rows.splice(i, 1);
    handleHeaderChange();
  };
</script>

<div class="headers-list">
  {#each rows as row, i}
    <div class="header-row">
      <input
        type="text"
        placeholder="Header-Name"
        bind:value={row.key}
        onchange={handleHeaderChange}
        class="header-input"
      />
      <span class="separator">:</span>
      <input
        type="text"
        placeholder="value"
        bind:value={row.value}
        onchange={handleHeaderChange}
        class="header-input"
      />
      <button
        class="remove-header"
        onclick={() => removeHeader(i)}
        title="Remove header"
      >
        &times;
      </button>
    </div>
  {/each}

  <button class="add-header-btn" onclick={addHeader}> + Add Header </button>
</div>

<style>
  .headers-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-main);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    margin-top: 0.25rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-input {
    flex: 1;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    font-family: ui-monospace, monospace;
    outline: none;
    min-width: 0;
    transition: border-color 0.15s ease;

    &:focus {
      border-color: var(--accent);
    }
  }

  .separator {
    color: var(--text-secondary);
    font-weight: bold;
    opacity: 0.5;
  }

  .remove-header {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0 0.2rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;

    &:hover {
      color: var(--status-error);
    }
  }

  .add-header-btn {
    background: transparent;
    border: 1px dashed var(--border-color);
    color: var(--text-secondary);
    padding: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.25rem;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: rgba(91, 164, 207, 0.04);
    }
  }
</style>

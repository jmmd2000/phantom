<script lang="ts">
  let {
    value = $bindable(0),
    onchange,
    id,
  }: { value?: number; onchange?: () => void; id?: string } = $props();
</script>

<div class="delay-input">
  <input type="number" bind:value min={0} step={100} onchange={() => onchange?.()} {id} />
  <span class="suffix">ms</span>
</div>

<style>
  .delay-input {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  input {
    width: 100%;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    color: var(--text-primary);
    font-family: ui-monospace, monospace;
    font-size: 0.82rem;
    padding: 0.4rem 0.5rem;
    outline: none;
    transition: border-color 0.2s ease;
    appearance: textfield;
    -moz-appearance: textfield;

    &:focus {
      border-color: var(--accent);
    }

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .suffix {
    font-size: 0.72rem;
    color: var(--text-secondary);
    font-family: ui-monospace, monospace;
    flex-shrink: 0;
  }
</style>

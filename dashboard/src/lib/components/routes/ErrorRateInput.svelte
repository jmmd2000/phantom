<script lang="ts">
  let {
    value = $bindable(0),
    onchange,
    id,
  }: { value: number; onchange: () => void; id: string } = $props();

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = parseFloat(target.value) / 100;
    value = Math.max(0, Math.min(1, val));
  };

  const handleCommit = () => {
    onchange();
  };
</script>

<div class="error-rate-wrapper">
  <input
    type="range"
    min="0"
    max="100"
    step="1"
    value={value * 100}
    oninput={handleInput}
    onchange={handleCommit}
    class="slider"
    {id}
  />
  <span class="percentage">{Math.round(value * 100)}%</span>
</div>

<style>
  .error-rate-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .slider {
    flex: 1;
    accent-color: var(--status-error);
  }

  .percentage {
    font-family: ui-monospace, monospace;
    font-size: 0.9rem;
    font-weight: 700;
    min-width: 3rem;
    color: var(--text-primary);
  }
</style>

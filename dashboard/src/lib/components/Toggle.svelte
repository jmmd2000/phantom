<script lang="ts">
  let { checked = $bindable(true), onchange }: { checked?: boolean; onchange?: () => void } =
    $props();
</script>

<button
  class="toggle"
  class:active={checked}
  onclick={() => {
    checked = !checked;
    onchange?.();
  }}
  role="switch"
  aria-checked={checked}
  aria-label="Toggle route on/off"
>
  <span class="knob"></span>
</button>

<style>
  .toggle {
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: 9px;
    border: none;
    padding: 2px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.12);
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  .toggle.active {
    background: var(--accent-light);
  }

  .knob {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--text-sidebar);
    transition: transform 0.2s ease;
    transform: translateX(0);
  }

  .toggle.active .knob {
    transform: translateX(14px);
  }
</style>

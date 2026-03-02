<script lang="ts">
  import { tick } from "svelte";
  import { mockRoutes, saveRoutes, type RouteConfig } from "$lib/routes.svelte";
  import DelayInput from "./DelayInput.svelte";
  import ErrorRateInput from "./ErrorRateInput.svelte";

  let { index, onclose }: { index: number; onclose: () => void } = $props();

  let route = $derived(mockRoutes.items[index]);

  const handleChange = async () => {
    await tick();
    saveRoutes();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onclose();
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onclose();
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="backdrop"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  role="presentation"
>
  <div class="dialog" role="dialog" aria-label="Route settings for {route.path}">
    <div class="dialog-header">
      <div class="dialog-title">
        <span class="dialog-method">{route.method}</span>
        <span class="dialog-path">{route.path}</span>
      </div>
      <button class="close-button" onclick={onclose}>&times;</button>
    </div>

    <div class="dialog-body">
      <div class="field">
        <label class="field-label" for="delay-input">Delay</label>
        <DelayInput
          bind:value={mockRoutes.items[index].delay}
          onchange={handleChange}
          id="delay-input"
        />
      </div>
      <div class="field">
        <label class="field-label" for="error-rate-input">Error Rate</label>
        <ErrorRateInput
          bind:value={mockRoutes.items[index].errorRate}
          onchange={handleChange}
          id="error-rate-input"
        />
      </div>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.15s ease;
  }

  .dialog {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    width: 420px;
    max-width: 90vw;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.15s ease;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
  }

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dialog-method {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .dialog-path {
    font-family: ui-monospace, monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.4rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0 0.25rem;
    line-height: 1;
    border-radius: 4px;
    transition: color 0.15s ease;

    &:hover {
      color: var(--text-primary);
    }
  }

  .dialog-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .field-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<script lang="ts">
  import { tick } from "svelte";
  import { mockRoutes, saveRoutes, type RouteConfig } from "$lib/routes.svelte";
  import DelayInput from "./DelayInput.svelte";
  import ErrorRateInput from "./ErrorRateInput.svelte";
  import HeadersEditor from "./HeadersEditor.svelte";

  let { index, onclose }: { index: number; onclose: () => void } = $props();

  const handleChange = async () => {
    await tick();
    saveRoutes();
  };

  let clickStartedOnBackdrop = false;

  const handleMouseDown = (e: MouseEvent) => {
    clickStartedOnBackdrop = e.target === e.currentTarget;
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (clickStartedOnBackdrop && e.target === e.currentTarget) {
      onclose();
    }
    clickStartedOnBackdrop = false;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onclose();
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="backdrop"
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  role="presentation"
>
  <div
    class="dialog"
    role="dialog"
    aria-label="Route settings for {mockRoutes.items[index].path}"
  >
    <div class="dialog-header">
      <div class="dialog-title">
        <span class="dialog-method">{mockRoutes.items[index].method}</span>
        <span class="dialog-path">{mockRoutes.items[index].path}</span>
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

      <div class="field">
        <label class="field-label">Custom Response Headers</label>
        <HeadersEditor
          bind:headers={mockRoutes.items[index].headers}
          onchange={handleChange}
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

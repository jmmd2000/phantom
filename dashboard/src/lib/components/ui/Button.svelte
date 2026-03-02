<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    onclick,
    variant = "outline",
    active = false,
    title,
    icon,
    children,
    class: className = "",
  }: {
    onclick?: (e: MouseEvent) => void;
    variant?: "outline" | "danger" | "ghost";
    active?: boolean;
    title?: string;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<button
  class="button variant-{variant} {className}"
  class:active
  {onclick}
  {title}
>
  {#if icon}
    <span class="button-icon">{@render icon()}</span>
  {/if}
  {#if children}
    <span class="button-label">{@render children()}</span>
  {/if}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
    border: 2px solid transparent;
    user-select: none;
    outline: none;

    &:active {
      transform: translateY(1px);
    }
  }


  .variant-outline {
    background: transparent;
    border-color: var(--border-color);
    color: var(--text-secondary);
  }
  .variant-outline:hover {
    border-color: var(--accent);
    color: var(--text-primary);
    background-color: var(--bg-surface);
  }
  .variant-outline.active {
    background-color: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .variant-danger {
    background: transparent;
    border-color: var(--border-color);
    color: var(--text-secondary);
  }
  .variant-danger:hover {
    border-color: var(--status-error);
    color: #ffffff;
    background-color: var(--status-error);
  }

  .variant-ghost {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 0.25rem;
  }
  .variant-ghost:hover {
    color: var(--text-primary);
  }

  .button-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .button-label {
    line-height: 1;
  }
</style>

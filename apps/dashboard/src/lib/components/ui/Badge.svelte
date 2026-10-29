<script lang="ts">
  let {
    label,
    type,
    class: className = "",
  }: {
    label: string | number;
    type: string;
    class?: string;
  } = $props();
</script>

<span class="badge badge-{type.toLowerCase()} {className}">
  {label}
</span>

<style>
  .badge {
    font-weight: 700;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-align: center;
    flex-shrink: 0;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    user-select: none;
  }

  /* Methods */
  .badge-get {
    color: var(--method-get);
    background: rgba(91, 164, 207, 0.12);
    border-color: rgba(91, 164, 207, 0.2);
    min-width: 58px;
  }
  .badge-post {
    color: var(--method-post);
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.2);
    min-width: 58px;
  }
  .badge-put {
    color: var(--method-put);
    background: rgba(196, 107, 26, 0.1);
    border-color: rgba(196, 107, 26, 0.2);
    min-width: 58px;
  }
  .badge-patch {
    color: var(--method-patch);
    background: rgba(244, 132, 95, 0.1);
    border-color: rgba(244, 132, 95, 0.2);
    min-width: 58px;
  }
  .badge-delete {
    color: var(--method-delete);
    background: rgba(160, 48, 48, 0.1);
    border-color: rgba(160, 48, 48, 0.2);
    min-width: 58px;
  }

  /* Status Types */
  .badge-success {
    color: var(--status-success);
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(22, 163, 74, 0.15);
    min-width: 42px;
  }
  .badge-warn {
    color: var(--status-warning);
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.15);
    min-width: 42px;
  }
  .badge-error {
    color: var(--status-error);
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.15);
    min-width: 42px;
  }
</style>

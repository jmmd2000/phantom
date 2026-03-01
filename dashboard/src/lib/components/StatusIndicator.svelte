<script lang="ts">
  let { online = false } = $props();
</script>

<div class="status-indicator">
  <span class="dot" class:online></span>
  <p class="status-text">{online ? "Dashboard active" : "Connecting to server..."}</p>
</div>

<style>
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-secondary);
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #b0a8a0;

    &.online {
      background-color: var(--status-success);
      animation: pulse 2s infinite;
    }
  }

  .status-text {
    font-size: 0.825rem;
    font-style: italic;
    margin: 0;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(22, 163, 74, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
    }
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { connectToServer, requestLog } from "$lib/ws";

  onMount(() => {
    connectToServer();
  });
</script>

<main>
  <h1>Phantom Dashboard</h1>
  <p>Listening for mock requests...</p>

  {#if $requestLog.length === 0}
    <p><i>Waiting for requests... (Try running curl http://localhost:3001/health)</i></p>
  {:else}
    <ul>
      {#each $requestLog as log (log.id)}
        <li>
          <strong>{log.method}</strong>
          {log.path}
          <span>[{log.status}]</span>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    padding: 2rem;
    font-family: sans-serif;
  }
</style>

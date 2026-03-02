<script lang="ts">
  import { get } from "svelte/store";
  import { requestLog } from "$lib/ws";
  import { Download } from "lucide-svelte";
  import Button from "./Button.svelte";

  function exportLogs() {
    const logs = get(requestLog);
    if (logs.length === 0) return;

    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    a.download = `phantom-logs-${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
</script>

<Button onclick={exportLogs} title="Export as JSON">
  {#snippet icon()}
    <Download size={14} strokeWidth={2.5} />
  {/snippet}
  Export Logs
</Button>

<style>
</style>

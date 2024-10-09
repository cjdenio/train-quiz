<script>
  import { onMount } from "svelte";
  import Route from "./Route.svelte";

  export let route = []
  export let errors = []

  export let lines
  export let stations
  export let origin
  export let showRemovalButton = true

  let selectedLine = ""
  let selectedStation = ""

  let lineSelector

  onMount(() => {
    lineSelector.focus()
  })

  function addStep() {
    route = [
      ...route,
      {
        line: selectedLine,
        station: selectedStation,
      },
    ]

    selectedLine = ""
    selectedStation = ""

    lineSelector.focus()
  }
</script>

<div class="p-5 rounded-lg mb-5">
  <Route steps={route} {errors} {origin} {showRemovalButton} on:remove={({detail}) => {
    route = route.filter((v, index) => index != detail)
  }} />

  <div class="flex gap-2 items-center">
    <form on:submit|preventDefault={() => addStep()}>
      <select bind:value={selectedLine} bind:this={lineSelector}>
        <option value="">Select a line...</option>

        {#each Object.values(lines) as line (line.route_id)}
          <option value={line.route_id}>{line.route_long_name}</option>
        {/each}
      </select>

      <span>to</span>

      <select bind:value={selectedStation}>
        <option value="">Select a station...</option>

        {#each Object.values(stations) as station (station.stop_id)}
          <option value={station.stop_id}>{station.stop_name}</option>
        {/each}
      </select>

      <button class="text-sm border border-blue-500 text-blue-500 font-bold rounded-lg px-4 py-1 uppercase cursor-pointer transition-colors hover:bg-blue-50" on:click={addStep} class:opacity-50={!selectedLine || !selectedStation} disabled={!selectedLine || !selectedStation}>Add to route</button>
    </form>
  </div>
</div>

<style>
  select {
    @apply border border-blue-500 rounded-md;
  }
</style>

<script>
  import { onMount } from "svelte";
  import MbtaLine from "./MbtaLine.svelte";

  export let route = []

  export let lines
  export let stations
  export let origin

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
  <ul class="w-full mb-4 empty:mb-0">
    <li class="relative font-bold">{origin}</li>

    {#each route as step, index }
      <li class="relative flex items-center">
        <MbtaLine name={step.line} />
        <span>
          to
          <span class="font-bold">{stations[step.station].stop_name}</span>
        </span>
        <button class="ml-auto text-gray-500" on:click={() => {route = route.filter((v,idx) => idx != index)}}>x</button>
      </li>
    {/each}
  </ul>

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
  li {
    @apply pl-5;
  }

  li:before {
    content: "";
    width: 10px;
    height: 10px;
    @apply bg-white rounded-full ring ring-gray-800;
    display: block;
    position: absolute;
    top: calc(50% - 5px);
    left: 0;
    z-index: 5;
  }
  li:after {
    content: "";
    height: 100%;
    width: 4px;
    @apply bg-gray-800;
    position: absolute;
    left: 3px;
  }

  li:first-of-type::after {
    @apply rounded-t-full;
  }
  li:last-of-type::after {
    @apply rounded-b-full;
  }

  select {
    @apply border border-blue-500 rounded-md;
  }
</style>

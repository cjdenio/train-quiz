<script>
  import MbtaLine from "./MbtaLine.svelte";
  import agency from "../agency"
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher()

  export let steps = [];
  export let origin;
  export let showRemovalButton = false;
  export let errors = []
</script>

<ul class="w-full mb-4 empty:mb-0">
  <li class="relative font-bold">{origin}</li>

  {#each steps as step, index}
    <li class="relative flex items-center">
      <MbtaLine name={step.line} />
      <span>
        to
        <span class="font-bold relative">
          {#if errors[index]}
            <div class="absolute bottom-full left-full text-nowrap border border-red-500 text-red-500 bg-white/90 p-3 rounded-lg rounded-bl-none z-40 animate-error origin-bottom-left">
              {errors[index]}
            </div>
          {/if}
          {agency.stations[step.station].stop_name}
        </span>
      </span>
      {#if showRemovalButton}
        <button class="ml-auto text-gray-500" on:click={() => dispatch("remove", index)}>x</button>
      {/if}
    </li>
  {/each}
</ul>

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
</style>
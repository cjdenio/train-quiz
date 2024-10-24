<script>
  import agency from "../agency"

  export let name
  export let compact = false
</script>

<span style:background-color={"#" + agency.routes[name].route_color} style:color={"#" + agency.routes[name].route_text_color || "black"} class="h-5 w-12 inline-flex items-center justify-center text-lg font-bold rounded-full relative {compact && "h-7 w-7"}" class:mr-4={!compact}>
  {#if name == "Red"}
    RL
  {:else if name == "Mattapan"}
    {#if compact}
      M
    {:else}
      RL
      <span class="ring-2 ring-white rounded-full absolute -right-3 top-0 bg-inherit h-5 w-5 flex items-center justify-center">M</span>
    {/if}
  {:else if name == "Blue"}
    BL
  {:else if name == "Orange"}
    OL
  {:else if name.startsWith("Green")}
    {#if compact}
      {name.split("-")[1]}
    {:else}
      GL
      <span class="ring-2 ring-white rounded-full absolute -right-3 top-0 bg-inherit h-5 w-5 flex items-center justify-center">{name.split("-")[1]}</span>
    {/if}
  {:else}
    {name}
  {/if}
</span>

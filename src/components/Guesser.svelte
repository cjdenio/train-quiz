<script>
  import Game from "./Game.svelte";
  import screenshot from "../screenshot.png"

  let page = "welcome"
  let score = 0
</script>

<div class="flex flex-col h-screen justify-center items-center">
  {#if page == "welcome" || page == "done"}
    <div class="grid gap-20" class:grid-cols-2={page == "done"}>
      {#if page == "done" }
        <div class="max-w-96 text-center rounded-lg border py-20">
          <p>You scored</p>
          <h1 class="font-black text-5xl">{score} <span class="font-normal">point{score != 1 && "s"}</span></h1>
          <p class="italic mt-2">
            {#if score == 20}
              "The Obsessed Local"
            {:else if score >= 15}
              "The Over-Achiever"
            {:else if score >= 10}
              "The Regular Rider"
            {:else}
              "The Occasional Tripper"
            {/if}
          </p>
        </div>
      {/if}

      <div class="flex flex-col items-center justify-center">
        <div class="inline-block relative text-left mb-5">
          <h1 class="font-black text-5xl">The Train Quiz</h1>
          <div class="max-w-72">
            {page == "welcome" ? (
              "Google Maps? Bleh. You can navigate the T on your own. Right?"
            ) : "🔗 trains.clb.li"}
          </div>
          <span
            class="bg-blue-500 text-white rounded-full px-2 absolute -right-16 top-9 animate-bump"
            >Boston edition</span
          >
        </div>
        <button
          class="block text-lg border border-blue-500 text-blue-500 font-bold rounded-lg px-10 py-3 uppercase cursor-pointer transition-colors hover:bg-blue-50"
          on:click={() => page == "welcome" ? page = "start" : page = "play"}
          >Play {#if page == "done"}
            again
          {/if}</button
        >
      </div>
    </div>
  {:else if page == "start"}
    <div class="mb-5 max-w-96">
      <h1 class="font-black text-5xl">How It Works</h1>

      <p class="mb-2">You'll see a pair of T stations in Boston: an origin and a destination.</p>

      <img src={screenshot.src} class="w-full border rounded-lg mb-2" />

      <p class="mb-2">Use the tool to create the route you'd take between the stations.</p>

      <p>You can score a maximum of 20 points: 1 for each correct answer, plus a bonus for the <strong class="font-bold">most optimal route</strong> (fewest number of stops possible).</p>
    </div>

    <button
      class="text-lg border border-blue-500 text-blue-500 font-bold rounded-lg px-10 py-3 uppercase cursor-pointer transition-colors hover:bg-blue-50"
      on:click={() => page = "play"}
      >Start</button
    >
  {:else if page == "play"}
    <Game on:done={e => {score = e.detail; page = "done"}} />
  {:else if page == "done"}
  <div class="grid grid-cols-2">

    <div class="max-w-96 text-center">
      <h1 class="font-black text-5xl">The Train Quiz</h1>
    </div>
  </div>
  {/if}
</div>

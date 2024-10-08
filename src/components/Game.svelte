<script>
  import { onMount, createEventDispatcher } from "svelte";
  import agency, { minStops, randomStationPair, stepsValidForStationPair } from "../agency"
  import MbtaLine from "./MbtaLine.svelte";
  import RouteBuilder from "./RouteBuilder.svelte";
  import gsap from "gsap";

  const dispatch = createEventDispatcher()

  const questionCount = 10

  let route = []

  let question = 0

  let from
  let to

  let points = 0

  function setStationPair() {
    const stations = randomStationPair()
    from = stations[0]
    to = stations[1]
  }

  onMount(() => {
    setStationPair()
  })

  let pointFlourish
  let pointCounter

  async function submit() {
    if(route[route.length - 1].station != to) {
      return alert(`Oops, your route doesn't end at ${agency.stations[to].stop_name}!`)
    }
    
    const [valid, err, stops]  = (stepsValidForStationPair(route, from, to))
    if(!valid) {
      gsap.to(pointCounter, {
        keyframes: {
          rotate: [0, -10, 10, -10, 10, -10, 10, -10, 10, 0]
        }
      })
    } else if(stops > minStops(from, to)) {
      await addPoints(1)
    } else {
      await addPoints(2)
    }

    if(question >= 9) {
      dispatch("done", points)
      return
    }

    question++
    route = []
    setStationPair()
  }

  async function addPoints(p) {
    points += p
    pointFlourish.innerText = `+${p}`
    gsap.to(pointFlourish, {x: -40, y: -50, rotate: -30, scale: 2, opacity: 0, duration: 1, startAt: {opacity: 1, y: 0, x: 0, scale: 1, rotate: 0}})
  }
</script>

<div class="border p-5 rounded-lg w-[550px] mb-5">
  <div class="flex justify-between mx-auto">
    <p>Route {question + 1}/{questionCount}</p>
    <p class="relative" bind:this={pointCounter}>{points} pts <span class="opacity-0 absolute left-0 top-0 text-green-600 font-bold" bind:this={pointFlourish}>+1</span></p>
  </div>

  {#if from && to}
    <h3 class="text-3xl">
      <span class="inline-flex items-center justify-center gap-2">
        <span class="font-bold">{agency.stations[from].stop_name}</span>
        {#each agency.stations[from].routes as line}
          <MbtaLine name={line} compact />
        {/each}
        to
      </span>
      <br>
      <span class="inline-flex items-center justify-center gap-2">
        <span class="font-bold">{agency.stations[to].stop_name}</span>
        {#each agency.stations[to].routes as line}
          <MbtaLine name={line} compact />
        {/each}
      </span>
    </h3>
  {:else}
    Loading...
  {/if}
</div>

<RouteBuilder lines={agency.routes} stations={agency.stations} origin={agency.stations[from]?.stop_name} bind:route />

<button class="text-md border border-blue-500 text-blue-500 font-bold rounded-lg px-5 py-1 uppercase cursor-pointer transition-colors hover:bg-blue-50" on:click={submit} class:opacity-50={route.length == 0} disabled={route.length == 0}>
  Submit
</button>

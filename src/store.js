import { writable } from "svelte/store";

export const gameOptions = writable(
  import.meta.env.SSR
    ? {}
    : JSON.parse(
        localStorage.getItem("gameOptions") || '{"showStationLines":true}'
      )
);

if (!import.meta.env.SSR) {
  gameOptions.subscribe((value) => {
    localStorage.setItem("gameOptions", JSON.stringify(value));
  });
}

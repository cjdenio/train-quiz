import { TextWriter } from "jsr:@zip-js/zip-js";
import { ZipReader } from "jsr:@zip-js/zip-js";
import { parse } from "npm:csv-parse/sync";

function indexRecords(records, key) {
  const result = {};

  for (const record of records) {
    result[record[key]] = record;
  }

  return result;
}

const reader = new ZipReader((await Deno.open(Deno.args[0])).readable);

const files = await reader.getEntries();

const wantedFiles = [
  "routes",
  "trips",
  "stops",
  "stop_times",
  "calendar",
] as const;

const entries: Partial<Record<(typeof wantedFiles)[number], any[]>> = {};

console.log("reading files");

await Promise.all(
  files
    .filter((f) => {
      //@ts-ignore
      return wantedFiles.includes(f.filename.replace(".txt", ""));
    })
    .map(async (f) => {
      const writer = new TextWriter();
      entries[f.filename.replace(".txt", "") as (typeof wantedFiles)[number]] =
        parse(await f.getData!(writer), { columns: true });
    })
);

reader.close();

console.log(`Indexing ${entries.stops?.length} stops...`);

function actualStop(stop_id: string): string {
  return indexedStops[stop_id]?.parent_station || stop_id;
}

const indexedStops = indexRecords(entries.stops, "stop_id");

const metroRoutes = entries.routes!.filter(
  (r) => r.route_type == 1 || r.route_type == 0
);

const metroRouteIds = metroRoutes.map((r) => r.route_id);

console.log(`Indexing trips...`);

const trips = entries.trips!.filter(
  (t) => t.service_id == "canonical" && metroRouteIds.includes(t.route_id)
);
const indexedTrips = indexRecords(trips, "trip_id");

console.log("sorting stop times");

const stop_times = entries
  .stop_times!.filter((s) => s.trip_id in indexedTrips)
  .sort((a, b) => {
    if (a.trip_id < b.trip_id) {
      return -1;
    } else if (a.trip_id > b.trip_id) {
      return 1;
    } else {
      return a.stop_sequence - b.stop_sequence;
    }
  });

const edges: Record<string, any> = {};

console.log("calculating edges...");

for (let i = 0; i < stop_times.length - 1; i++) {
  const a = stop_times[i];
  const b = stop_times[i + 1];

  if (a.trip_id == b.trip_id) {
    const trip = indexedTrips[a.trip_id];
    const route_id = trip.route_id;
    const aStop = actualStop(a.stop_id);
    const bStop = actualStop(b.stop_id);
    const key = `${aStop}-${bStop}`;

    if (key in edges) {
      edges[key].route.add(route_id);
    } else {
      edges[key] = {
        a: aStop,
        b: bStop,
        route: new Set([route_id]),
        headsign: trip.trip_headsign,
      };
    }
  }
}

const stations = [
  ...new Set(
    Object.values(edges)
      .flatMap((e) => [e.a, e.b])
      .map((e) => actualStop(e))
  ),
];
const output = {
  stations: indexRecords(
    stations.map((s) => indexedStops[s]),
    "stop_id"
  ),
  edges: Object.values(edges).map((e) => ({ ...e, route: [...e.route] })),
  routes: indexRecords(metroRoutes, "route_id"),
  agency: {
    city: "Boston",
    slug: "boston",
  },
};

console.log(
  entries.calendar?.sort(
    (a, b) => parseInt(b.end_date) - parseInt(a.end_date)
  )[0]
);

await Deno.writeTextFile("cities/boston.json", JSON.stringify(output));

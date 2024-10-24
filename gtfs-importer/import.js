import { TextWriter } from "jsr:@zip-js/zip-js";
import { ZipReader } from "jsr:@zip-js/zip-js";
import { parse } from "npm:csv-parse/sync";
import { parse as parseStream } from "npm:csv-parse";

function indexRecords(records, key, processRecords = (v) => v) {
  const result = {};

  for (const record of records) {
    result[record[key]] = processRecords(record);
  }

  return result;
}

async function streamRecords(entry, filter) {
  const records = [];

  const parser = parseStream({ columns: true });

  parser.on("readable", () => {
    let record;
    while ((record = parser.read()) !== null) {
      if (filter(record)) records.push(record);
    }
  });

  await entry.getData(
    new WritableStream({
      write(chunk) {
        parser.write(chunk);
      },
      close() {
        parser.end();
      },
    })
  );

  return records;
}

export async function importGtfs(
  cityName,
  {
    sourceFeed,
    outputFile,
    allowedRouteTypes,
    processStationNames = (name) => name,
    serviceId,
  }
) {
  const reader = new ZipReader((await Deno.open(sourceFeed)).readable);
  const files = await reader.getEntries();

  const entries = {};

  console.log("reading files");

  await Promise.all(
    files
      .filter((f) =>
        ["routes.txt", "trips.txt", "stops.txt", "calendar.txt"].includes(
          f.filename
        )
      )
      .map(async (f) => {
        const writer = new TextWriter();
        entries[f.filename.replace(".txt", "")] = parse(
          await f.getData(writer),
          {
            columns: true,
          }
        );
      })
  );

  console.log(`Indexing ${entries.stops?.length} stops...`);

  const indexedStops = indexRecords(entries.stops, "stop_id", (stop) => ({
    ...stop,
    stop_name: processStationNames(stop.stop_name),
  }));

  const allowedRoutes = entries.routes.filter((r) =>
    allowedRouteTypes.includes(r.route_type)
  );

  const allowedRouteIds = allowedRoutes.map((r) => r.route_id);

  console.log("Indexing trips...");

  const indexedTrips = indexRecords(
    entries.trips.filter(
      (t) =>
        allowedRouteIds.includes(t.route_id) &&
        (!serviceId || t.service_id == serviceId)
    ),
    "trip_id"
  );

  console.log("fetching stop times...");

  entries.stop_times = await streamRecords(
    files.find((f) => f.filename == "stop_times.txt"),
    (s) => s.trip_id in indexedTrips
  );

  console.log(entries.stop_times.length);

  reader.close();

  const stop_times = entries.stop_times.sort((a, b) => {
    if (a.trip_id < b.trip_id) {
      return -1;
    } else if (a.trip_id > b.trip_id) {
      return 1;
    } else {
      return a.stop_sequence - b.stop_sequence;
    }
  });

  const edges = {};

  console.log("calculating edges...");

  function actualStop(stop_id) {
    return indexedStops[stop_id]?.parent_station || stop_id;
  }

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

  function routesForStation(station_id) {
    return [
      ...new Set(
        Object.values(edges)
          .filter((e) => e.a == station_id || e.b == station_id)
          .flatMap((e) => [...e.route])
      ),
    ];
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
      stations.map((s) => ({
        ...indexedStops[s],
        routes: routesForStation(s),
      })),
      "stop_id"
    ),
    edges: Object.values(edges).map((e) => ({ ...e, route: [...e.route] })),
    routes: indexRecords(allowedRoutes, "route_id"),
    agency: {
      city: cityName,
      slug: cityName.toLowerCase().replace(/\s+/g, "-"),
    },
  };

  await Deno.writeTextFile(outputFile, JSON.stringify(output));

  console.log("done");
}

export const STREETCAR = "0";
export const SUBWAY = "1";
export const RAIL = "2";

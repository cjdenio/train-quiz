import _agency from "../cities/boston.json";

const agency = {
  ..._agency,
  // Convert `route` arrays to `Set`s
  edges: _agency.edges.map((e) => ({ ...e, route: new Set(e.route) })),
  stations: Object.fromEntries(
    Object.entries(_agency.stations).map(([k, s]) => [
      k,
      {
        ...s,
        routes: new Set(s.routes),
      },
    ])
  ),
};

export function randomStationPair() {
  const keys = Object.keys(agency.stations);
  // select a random source station
  const a = keys[Math.floor(Math.random() * keys.length)];

  const aLines = agency.stations[a].routes;

  const stationsOnSameLine = agency.edges
    .filter((e) => !aLines.isDisjointFrom(e.route))
    .flatMap((e) => [e.a.toString(), e.b.toString()]);

  // make a set of all stations that aren't on the same line as `a`
  const possibleStations = keys.filter((s) => !stationsOnSameLine.includes(s));

  const b =
    possibleStations[Math.floor(Math.random() * possibleStations.length)];

  return [a, b];
}

function stationNeighbors(station) {
  return agency.edges
    .filter((e) => e.a == station)
    .map((e) => ({
      station: e.b,
      via: e.route,
    }));
}

// caleb's patented graph traversal algorithm (tm)
function routeGoesBetweenStations(route, stationA, stationB) {
  const currentNodes = [stationA];
  const visited = [];
  let stops = 0;

  let possible = false;
  let errorStation;

  i: while (currentNodes.length > 0) {
    stops++;

    for (const node of [...currentNodes]) {
      const neighbors = stationNeighbors(node)
        .filter((n) => n.via.has(route) && !visited.includes(n.station))
        .map((n) => n.station);

      for (const n of neighbors) {
        if (n == stationB) {
          possible = true;
          break i;
        }
        currentNodes.push(n);
      }
      currentNodes.splice(currentNodes.indexOf(node), 1);
      visited.push(node);
    }
  }

  if (!possible) {
    errorStation = visited.length == 1 ? stationA : stationB;
  }

  return [possible, errorStation, stops];
}

export function stepsValidForStationPair(steps, stationA, stationB) {
  if (steps[steps.length - 1].station != stationB)
    return [
      false,
      [`Route doesn't end at ${agency.stations[stationB].stop_name}.`],
    ];

  let stops = 0;

  for (let i = 0; i < steps.length; i++) {
    // cosplaying as a golang developer
    const [possible, err, _stops] = routeGoesBetweenStations(
      steps[i].line,
      steps[i - 1]?.station ?? stationA,
      steps[i].station
    );
    if (!possible) {
      return [
        false,
        new Array(steps.length).fill(
          `${agency.routes[steps[i].line].route_long_name} doesn't serve ${
            agency.stations[err].stop_name
          }`,
          i,
          i + 1
        ),
      ];
    }
    stops += _stops;
  }

  return [true, null, stops];
}

export function minStops(stationA, stationB) {
  return Dijkstra(agency, stationA)[0][stationB];
}

function Dijkstra(graph, source) {
  let dist = {};
  let prev = {};
  let unvisited = [];

  for (const v of Object.keys(graph.stations)) {
    dist[v] = Infinity;
    prev[v] = undefined;
    unvisited.push(v);
  }

  dist[source] = 0;

  while (unvisited.length != 0) {
    const u = unvisited.sort((a, b) => dist[a] - dist[b])[0];
    unvisited.splice(unvisited.indexOf(u), 1);

    for (const n of stationNeighbors(u)) {
      const v = n.station;
      const alt = dist[u] + 1;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = [u];
      }
    }
  }

  return [dist, prev];
}

export default agency;

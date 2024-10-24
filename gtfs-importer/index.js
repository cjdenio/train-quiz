import { importGtfs, STREETCAR, SUBWAY } from "./import.js";

await importGtfs("Boston", {
  allowedRouteTypes: [STREETCAR, SUBWAY],
  sourceFeed: "gtfs/mbta.zip",
  outputFile: "cities/boston.json",
  serviceId: "canonical",
});

// await importGtfs("Chicago", {
//   allowedRouteTypes: ["0", "1"],
//   sourceFeed: "gtfs/cta.zip",
//   outputFile: "cities/chicago.json",
//   processStationNames: (name) =>
//     name.replace(
//       /\s*\((Red|Purple|Yellow|Blue|Pink|Green|Orange|Brown)\)$/,
//       ""
//     ),
// });

mkdir -p gtfs/

function download {
  wget $2 --accept="*.zip" -O gtfs/$1.zip
}

download mbta "https://cdn.mbta.com/MBTA_GTFS.zip"
# download cta  "https://www.transitchicago.com/downloads/sch_data/google_transit.zip"
# download bart "https://www.bart.gov/dev/schedules/google_transit.zip"

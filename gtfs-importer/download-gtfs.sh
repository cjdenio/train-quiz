mkdir -p gtfs/

wget https://cdn.mbta.com/MBTA_GTFS.zip                                   --max-redirect=0 -O gtfs/mbta.zip
wget https://www.transitchicago.com/downloads/sch_data/google_transit.zip --max-redirect=0 -O gtfs/cta.zip
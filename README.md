# Map of Norway in a React App

## Making maps:

### Download maps

* 2019 [kommuner][1] [fylker][2] [valgkretser][3]

### Compact geojson files

~~~bash
cat Basisdata_0000_Norge_25833_Fylker2019_GEOJSON.geojson | jq -c '.[]' > compact_jq.geojson
~~~

cat Basisdata_0000_Norge_4258_Valgkretser_GeoJSON.geojson | jq -c '.[]' > compact_jq.geojson

### Split into its features

~~~bash
csplit compact_jq.geojson /"$(printf "{\"type\":\"FeatureCollection\"")"/ {6} -f feature
~~~

Rename the files
~~~bash
mv feature01 feature01.geojson
mv feature02 feature02.geojson
mv feature03 feature03.geojson
mv feature04 feature04.geojson
mv feature05 feature05.geojson
mv feature06 feature06.geojson
mv feature07 feature07.geojson
~~~

feature00 seems to be empty
~~~bash
rm feature00
~~~

### Simplify

1. Look at the geojson feature files. Figure out which has your map.
1. Go to [mapshaper.org][4]
1. Upload the right feature file.
1. Uncheck all fixing - it's too late for you now
1. Click on simplify
1. Keep the defaults, because who knows what is right anyway?
1. Adjust the slider to something - 19% might be too high - 2.7 might be too low
1. Click on export and choose topojson
1. Click on export
1. Store topojson map somewhere

### Make topology simpler (reduce filesize) - didn't try this last time

toposimplify -o output_file.json -P 0.07 norway-polling-districts.json

### Prettify big files - didn't try this last time
cat norway-polling-districts.json | jq . > pretty.json

[1]: https://kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner-historiske-data-2019/83e441aa-90ee-455e-8890-8df98881b8c8
[2]: https://kartkatalog.geonorge.no/metadata/administrative-enheter-fylker-historiske-data-2019/c40ddb2f-2a23-4c4b-9750-7b50458110eb
[3]: https://kartkatalog.geonorge.no/metadata/valgkretser-stemmekretser-historiske-data-2019/abb349dc-3625-41f9-b1a2-8f716bf53d77
[4]: https://mapshaper.org/
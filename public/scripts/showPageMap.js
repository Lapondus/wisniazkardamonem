mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: lokalizacja.geometry.coordinates, // starting position [lng, lat]
    zoom: 14 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
    .setLngLat(lokalizacja.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
                `<h6>${lokalizacja.miejscowość}</h6><p>${lokalizacja.miejsce}</p>`
            )
    )
    .addTo(map)

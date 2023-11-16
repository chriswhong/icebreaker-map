const FLYTO_DURATION = 2800
const RESUME_SPINNING_DURATION = 6000

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN3aG9uZ21hcGJveCIsImEiOiJjbDl6bzJ6N3EwMGczM3BudjZmbm5yOXFnIn0.lPhc5Z5H3byF_gf_Jz48Ug';

// instantiate map
const map = new mapboxgl.Map({
    container: 'map',
    projection: 'globe',
    zoom: 2.5,
    center: [-90, 40]
});

// add mapbox-gl-geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    flyTo: {
        zoom: map.getZoom(),
        duration: FLYTO_DURATION
    },
    marker: false
})

// an empty array to hold marker instances
let markers = []

const addMarker = ({ text, center }) => {
    // container element
    const el = document.createElement('div');
    el.className = 'marker';

    // child element, so we can animate the marker when it appears
    const childEl = document.createElement('div')
    childEl.className = 'marker-inner';
    childEl.textContent = text

    // append child to parent
    el.appendChild(childEl)

    // instantiate marker
    const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom-right',
        offset: [0, -10]
    })
        .setLngLat(center)
        .addTo(map);

    // push marker to marker array
    markers.push(marker)
}

// read localstorage
const getFlags = () => {
    return JSON.parse(localStorage.getItem("flags") || "[]")
}

// write localstorage
const setFlags = (flags) => {
    localStorage.setItem("flags", JSON.stringify(flags));
}

// remove last marker data from localstorage, and remove the corresponding marker from the map
const undoLastFlag = () => {
    const flags = getFlags()
    const newFlags = flags.slice(0, -1)
    setFlags(newFlags)

    markers.pop().remove()
}

// handle selecting a geocoder result
geocoder.on('result', (d) => {
    // wait until the flyTo() is complete
    setTimeout(() => {
        const { result } = d

        userInteracting = true

        // add a new marker to the map
        addMarker({
            text: result.text,
            center: result.center
        })

        // update localstorage data
        const flags = getFlags()
        flags.push({
            text: result.text,
            center: result.center
        })
        setFlags(flags)

        // resume spinning the globe
        setTimeout(() => {
            userInteracting = false;
            spinGlobe();
        }, RESUME_SPINNING_DURATION)
    }, FLYTO_DURATION)

})

// Add the control to the map.
map.addControl(geocoder);

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
    const flags = getFlags()
    if (flags.length) {
        flags.forEach(addMarker)
    }

});

// The following values can be changed to control rotation speed:

// At low zooms, complete a revolution every two minutes.
const secondsPerRevolution = 120;
// Above zoom level 5, do not rotate.
const maxSpinZoom = 5;
// Rotate at intermediate speeds between zoom levels 3 and 5.
const slowSpinZoom = 3;

let userInteracting = false;
let spinEnabled = true;

function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            // Slow spinning at higher zooms
            const zoomDif =
                (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        // Smoothly animate the map over one second.
        // When this animation is complete, it calls a 'moveend' event.
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
}

// Pause spinning on interaction
map.on('mousedown', () => {
    userInteracting = true;
});

// Restart spinning the globe when interaction is complete
map.on('mouseup', () => {
    userInteracting = false;
    spinGlobe();
});

// These events account for cases where the mouse has moved
// off the map, so 'mouseup' will not be fired.
map.on('dragend', () => {
    userInteracting = false;
    spinGlobe();
});
map.on('pitchend', () => {
    userInteracting = false;
    spinGlobe();
});
map.on('rotateend', () => {
    userInteracting = false;
    spinGlobe();
});

// When animation is complete, start spinning if there is no ongoing interaction
map.on('moveend', () => {
    spinGlobe();
});

// kick off spinning the globe after everything loads
spinGlobe();

// handle cmd-z to remove the last marker
window.addEventListener('keydown', function (evt) {
    evt.stopImmediatePropagation();
    if (evt.key === 'z' && (evt.ctrlKey || evt.metaKey)) {
        undoLastFlag()
    }
});
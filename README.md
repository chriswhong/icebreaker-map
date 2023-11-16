# icebreaker-map
A Mapbox-powered app for quickly searching for locations and adding markers for a selected location on a rotating globe. 

Can be used as an interactive "icebreaker" during a virtual event. Guests tell the host which city they are tuning in from, and the host searches and adds a flag to the map.
<img width="1037" alt="Create_a_rotating_globe" src="https://github.com/chriswhong/icebreaker-map/assets/1833820/9a3709f2-e818-458f-b34f-3a1ca7f7b49c">

Use the search input to search for a place. When a search result is selected, the globe will `flyTo()` that location and create a "flag" marker with that place's name.

The user can also freely control the camera, which will resume spinning after a few seconds of inactivity.

## Features

- Undo - `Cmd-Z` to undo the most recently added marker.
- Persistence - markers are stored in localstorage and will persist when refreshing the browser


export function addMarkers(map: google.maps.Map, places: any[]) {
    places.forEach(place => {
        if (place.geometry && place.geometry.location) {
            const marker = new google.maps.Marker({
                map,
                position: place.geometry.location,
                title: place.name,
            });

            marker.addListener('click', () => {
                // Affichez des informations supplémentaires ou effectuez une action
                alert(`Lieu : ${place.name}\nTéléphone : ${place.phone}`);
            });
        }
    });
}
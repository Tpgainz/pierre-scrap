/**
 * Initializes the map with the center position and sets up event handlers.
 */
export async function initMap(
  center: google.maps.LatLngLiteral
): Promise<google.maps.Map> {
  console.log("Initialisation de la carte avec le centre:", center);

  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center,
      zoom: 17,
      mapId: "8d193001f940fde3",
    }
  );

  // Dynamically import the 'marker' library to access AdvancedMarkerElement
  const { AdvancedMarkerElement } = (await google.maps.importLibrary(
    "marker"
  )) as {
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
  };

  const positionMarker = new AdvancedMarkerElement({
    map,
    position: center,
    gmpDraggable: true,
    gmpClickable: true,
    // Customize the marker as needed
    // Example:
    // content: '<div class="custom-marker"></div>',
  });

  console.log("Vérification de la géolocalisation...");
  handleLocation(map, positionMarker);

  handleClickPosition(map, positionMarker);

  return map;
}

/**
 * Adds places to the map using AdvancedMarkerElement.
 */
function addPlaces(
  places: google.maps.places.PlaceResult[],
  map: google.maps.Map
): void {
  const placesList = document.getElementById("places") as HTMLElement;
  placesList.innerHTML = ""; // Réinitialiser la liste

  for (const place of places) {
    if (place.geometry && place.geometry.location) {
      const { AdvancedMarkerElement } = google.maps.marker; // Accessing from the marker library

      const advancedMarker = new AdvancedMarkerElement({
        map,
        position: place.geometry.location,
        title: place.name!,
        // Customize the marker as needed
        // Example:
        // content: `<div class="custom-marker">${place.name}</div>`,
      });

      const li = document.createElement("li");
      li.textContent = `${place.name} - ${place.formatted_phone_number}`;
      placesList.appendChild(li);

      li.addEventListener("click", () => {
        map.setCenter(place.geometry!.location!);
      });
    }
  }
}

/**
 * Handles the user's current location and updates the map accordingly.
 */
function handleLocation(
  map: google.maps.Map,
  positionMarker: google.maps.marker.AdvancedMarkerElement
) {
  if (navigator.geolocation) {
    console.log("Géolocalisation disponible, démarrage du suivi");
    navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log("Nouvelle position détectée:", newPos);
        console.log("Précision:", position.coords.accuracy, "mètres");

        positionMarker.position = newPos;
        map.setCenter(newPos);

        if (google.maps.places) {
          console.log("API Places disponible, recherche des lieux proches");
          const service = new google.maps.places.PlacesService(map);
          fetchAllPlaces(
            service,
            newPos,
            500,
            "store",
            map,
            50
          ).catch((error) => console.error("Erreur fetchAllPlaces:", error));
        } else {
          console.warn("API Places non disponible");
        }
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        console.error("Code d'erreur:", error.code);
        console.error("Message d'erreur:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    console.error("La géolocalisation n'est pas supportée par ce navigateur");
  }
}

/**
 * Handles user clicks on the map to update the marker position.
 */
function handleClickPosition(
  map: google.maps.Map,
  positionMarker: google.maps.marker.AdvancedMarkerElement
) {
  map.addListener("click", (event: google.maps.MapMouseEvent) => {
    console.log("Clic sur la carte:", event.latLng);
    const newPos = event.latLng!.toJSON();

    positionMarker.position = newPos;
    map.setCenter(event.latLng!);

    console.log("Nouvelle position détectée (click):", newPos);

    if (google.maps.places) {
      console.log("API Places disponible, recherche des lieux proches");
      const service = new google.maps.places.PlacesService(map);
      fetchAllPlaces(service, newPos, 500, "store", map, 50).catch((error) =>
        console.error("Erreur fetchAllPlaces:", error)
      );
    } else {
      console.warn("API Places non disponible");
    }
  });
}

export async function fetchAllPlaces(
  service: google.maps.places.PlacesService,
  location: google.maps.LatLngLiteral,
  radius: number,
  type: string,
  map: google.maps.Map,
  maxResults: number
): Promise<void> {
  console.log("Début de fetchAllPlaces avec paramètres:", {
    location,
    radius,
    type,
    maxResults,
  });

  const mobileRegex = /^(?:\+0)[67]\d{8}$/;

  try {
    const response = await nearbySearchAsync(service, {
      location,
      radius,
      type,
    });

    console.log(
      "Résultats de la recherche:",
      response.results?.length ?? 0,
      "lieux trouvés"
    );

    if (
      response.status !== google.maps.places.PlacesServiceStatus.OK ||
      !response.results
    ) {
      console.error("Erreur lors de la recherche des lieux:", response.status);
      return;
    }

    const detailedPlaces = await getDetailedMobilePlaces(
      service,
      response.results,
      mobileRegex
    );
    console.log("Lieux avec numéros mobiles:", detailedPlaces.length);

    addPlaces(detailedPlaces, map);
  } catch (error) {
    console.error("Erreur dans fetchAllPlaces:", error);
  }
}

function nearbySearchAsync(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): Promise<{
  results: google.maps.places.PlaceResult[];
  status: google.maps.places.PlacesServiceStatus;
  pagination: google.maps.places.PlaceSearchPagination;
}> {
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status, pagination) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK ||
        status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
      ) {
        resolve({ results: results!, status, pagination: pagination! });
      } else {
        reject(status);
      }
    });
  });
}

async function getDetailedMobilePlaces(
  service: google.maps.places.PlacesService,
  places: google.maps.places.PlaceResult[],
  mobileRegex: RegExp
): Promise<google.maps.places.PlaceResult[]> {
  const detailedPromises = places.map((place) =>
    getPlaceDetailsAsync(service, place.place_id!)
  );

  const detailedResults = await Promise.all(detailedPromises);

  // Filtrer les lieux avec des numéros de téléphone mobiles
  return detailedResults.filter((place) => {
    const phoneNumber = place.formatted_phone_number?.replace(/\s+/g, "");
    return phoneNumber && mobileRegex.test(phoneNumber);
  });
}

function getPlaceDetailsAsync(
  service: google.maps.places.PlacesService,
  placeId: string
): Promise<google.maps.places.PlaceResult> {
  const request: google.maps.places.PlaceDetailsRequest = {
    placeId,
    fields: ["formatted_phone_number"],
  };

  return new Promise((resolve, reject) => {
    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        resolve(place);
      } else {
        reject(status);
      }
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

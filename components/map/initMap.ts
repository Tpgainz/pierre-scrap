export async function initMap(center: google.maps.LatLngLiteral): Promise<google.maps.Map> {
    console.log("Initialisation de la carte avec le centre:", center);
    
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center,
        zoom: 17,
        mapId: "8d193001f940fde3",
    });

    const positionMarker = new google.maps.Marker({
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#42854",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
        },
    });

    console.log("Vérification de la géolocalisation...");
    handleLocation(map, positionMarker);

    handleClickPosition(map, positionMarker);



    return map;
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
        maxResults
    });


    const mobileRegex = /^(?:\+0)[67]\d{8}$/;

    try {
        const response = await nearbySearchAsync(service, {
            location,
            radius,
            type,
        });

        console.log("Résultats de la recherche:", response.results?.length ?? 0, "lieux trouvés");

        if (response.status !== google.maps.places.PlacesServiceStatus.OK || !response.results) {
            console.error("Erreur lors de la recherche des lieux:", response.status);
            return;
        }

        const detailedPlaces = await getDetailedMobilePlaces(service, response.results, mobileRegex);
        console.log("Lieux avec numéros mobiles:", detailedPlaces.length);

        addPlaces(detailedPlaces, map);
    } catch (error) {
        console.error("Erreur dans fetchAllPlaces:", error);
    }
}
  
  function nearbySearchAsync(
    service: google.maps.places.PlacesService,
    request: google.maps.places.PlaceSearchRequest
  ): Promise<{ results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus, pagination: google.maps.places.PlaceSearchPagination }> {
    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK || status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve({ results: results!, status, pagination: pagination! })
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
    const detailedPromises = places.map(place => getPlaceDetailsAsync(service, place.place_id!));
  
    const detailedResults = await Promise.all(detailedPromises);
  
    // Filtrer les lieux avec des numéros de téléphone mobiles
    return detailedResults.filter(place => {
      const phoneNumber = place.formatted_phone_number?.replace(/\s+/g, '');
      return phoneNumber && mobileRegex.test(phoneNumber);
    }); 
  } 
  
  function getPlaceDetailsAsync(
    service: google.maps.places.PlacesService,
    placeId: string
  ): Promise<google.maps.places.PlaceResult> {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: ['formatted_phone_number'],
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function addPlaces(
    places: google.maps.places.PlaceResult[],
    map: google.maps.Map
  ): void {
    const placesList = document.getElementById("places") as HTMLElement;
    placesList.innerHTML = ''; // Réinitialiser la liste
  
    for (const place of places) {
      if (place.geometry && place.geometry.location) {
        const image = {
          url: place.icon!,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };
  
        new google.maps.Marker({
          map,
          icon: image,
          title: place.name!,
          position: place.geometry.location,
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
  
  
  function handleLocation(map: google.maps.Map, positionMarker: google.maps.Marker) {
    if (navigator.geolocation) {
        console.log("Géolocalisation disponible, démarrage du suivi");
    navigator.geolocation.watchPosition(
        (position) => {
            const newPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log("Nouvelle position détectée:", newPos);
            console.log("Précision:", position.coords.accuracy, "mètres");
            
            positionMarker.setPosition(newPos);
            map.setCenter(newPos);

            if (google.maps.places) {
                console.log("API Places disponible, recherche des lieux proches");
                const service = new google.maps.places.PlacesService(map);
                fetchAllPlaces(service, newPos, 500, "store", map, 50)
                    .catch(error => console.error("Erreur fetchAllPlaces:", error));
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
            maximumAge: 0
        }
    );
    } else {
        console.error("La géolocalisation n'est pas supportée par ce navigateur");
    }
}

function handleClickPosition(map: google.maps.Map, positionMarker: google.maps.Marker) {
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
        console.log("Clic sur la carte:", event.latLng);
        const newPos = event.latLng!.toJSON();
        
        positionMarker.setPosition(event.latLng!);
        map.setCenter(event.latLng!);

        console.log("Nouvelle position détectée (click):", newPos);

        if (google.maps.places) {
            console.log("API Places disponible, recherche des lieux proches");
            const service = new google.maps.places.PlacesService(map);
            fetchAllPlaces(service, newPos, 500, "store", map, 50)
                .catch(error => console.error("Erreur fetchAllPlaces:", error));
        } else {
            console.warn("API Places non disponible");
        }
    });
}


"use client"
import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { useSearchParams } from 'next/navigation'
import { mock } from '@/public/mock';
import { fetchAllPlaces } from './initMap';

// Dev in progress

const loader = new Loader({
    apiKey: process.env.GOOGLE_API_KEY ?? "",
    version: "weekly",
    libraries: ["places"],
});

export default function MapContainer() {
    const mapElement = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
    const searchParams = useSearchParams()

    const lat = parseFloat(searchParams.get('lat') || Object.values(mock.location)[0].toString())
    const lng = parseFloat(searchParams.get('lng') || Object.values(mock.location)[1].toString())

    useEffect(() => {
        const initMap = async () => {
            if (mapElement.current && !mapInstance.current) {
                try {
                    await loader.load();
                    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
                    
                    const map = new google.maps.Map(mapElement.current, {
                        center: { lat, lng },
                        zoom: 15,
                        mapId: 'YOUR_MAP_ID'
                    });
                    
                    mapInstance.current = map;
                    
                    markerRef.current = new AdvancedMarkerElement({
                        map,
                        position: { lat, lng }
                    });

                } catch (e) {
                    console.error("Erreur lors de l'initialisation de la carte :", e);
                }
            }
        }
        initMap();
    }, [lat, lng]);

    useEffect(() => {
        const watchPosition = async () => {
            if (mapInstance.current && markerRef.current && navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    
                    if (markerRef.current) {
                        markerRef.current.position = newPos;
                    }
                    mapInstance.current?.setCenter(newPos);

                    if (google.maps.places) {
                        const service = new google.maps.places.PlacesService(mapInstance.current!);
                        await fetchAllPlaces(service, newPos, 500, "store", mapInstance.current!, 50)
                    }
                },
                (error) => {
                        console.error("Erreur de géolocalisation :", error);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        }
        watchPosition();
    }, []);

    return (
        <div ref={mapElement} id="map" className="w-full h-full max-h-screen min-h-[500px]" />
    )
}


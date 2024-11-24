import { Client } from "@googlemaps/google-maps-services-js";
import axios from "axios";
 
const axiosInstance = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  params: {
    key: process.env.GOOGLE_API_KEY ?? "",
  
  },
});

export const client = new Client({
  axiosInstance,
});

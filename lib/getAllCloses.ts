"use server";
import {
  PlacesNearbyRequest,
  PlacesNearbyResponse,
} from "@googlemaps/google-maps-services-js";
import { client } from "@/lib/client";
import { mock } from "@/public/mock";
import { decodeProps } from "./decode";

export type ReqParams = Omit<PlacesNearbyRequest["params"], "key">;

export async function getAllCloses(
  props: ReqParams = mock,
  pagetoken?: string
): Promise<PlacesNearbyResponse> {
  const decodedProps = decodeProps(props);
  const res = await client.placesNearby({
    params: {
      ...decodedProps,
      pagetoken: pagetoken,
      key: process.env.GOOGLE_API_KEY ?? "",
    },
  });
  return res;
}

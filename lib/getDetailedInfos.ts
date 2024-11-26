"use server";

import { client } from "./client";

export async function getDetailedInfos(ids: string | string[]) {
  if (ids === "") return [];
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  const promises = ids.map(async (id) => {
    const res = await client.placeDetails({
      params: {
        place_id: id,
        key: process.env.GOOGLE_API_KEY ?? "",
      },
    });
    const phoneNumber = res.data.result.formatted_phone_number;

    if (!phoneNumber) {
      return null;
    }

    return res.data;
  });

  const results = await Promise.all(promises);
  // Filtrer les résultats nuls
  return results.filter((result) => result !== null);
}

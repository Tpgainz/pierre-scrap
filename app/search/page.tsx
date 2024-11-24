import CustomSearchParams from "@/components/CustomSearchParams";
import { getAllCloses, ReqParams } from "@/lib/getters/getAllCloses";
import { getDetailedInfos } from "@/lib/getters/getDetailedInfos";
import { PlaceData, Status } from "@googlemaps/google-maps-services-js";
import { Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AsyncPageResults from "./pageGenerator";

type SearchParams = Promise<ReqParams>;

export type DetailedLocation = Awaited<
  ReturnType<typeof getDetailedInfos>
>[number];

// Type pour la valeur retournée par le générateur
export interface PageResult {
  status: number;
  statusText: string;
  resStatus: Status;
  next_page_token?: string;
  error_message?: string;
  results: Partial<PlaceData>[];
  singleLocation: DetailedLocation[];
  pageNumber: number;
}

interface GeneratorOptions {
  searchParams: SearchParams;
  maxDepth?: number;
  currentDepth?: number;
}

// Ajout du type de retour du générateur
async function* pageGenerator({
  searchParams,
  maxDepth = 3,
  currentDepth = 0,
}: GeneratorOptions): AsyncGenerator<PageResult> {
  const params = await searchParams;

  if (currentDepth >= maxDepth) {
    console.log(`Profondeur maximale atteinte (${maxDepth} pages)`);
    return;
  }

  const response = await getAllCloses(params);
  const {
    status,
    data: { results, next_page_token, error_message, status: resStatus },
    statusText,
  } = response;

  const singleLocation = await getDetailedInfos(
    results.map((result: Partial<PlaceData>) => result.place_id ?? "")
  );

  yield {
    status,
    statusText,
    resStatus,
    next_page_token,
    error_message,
    results,
    singleLocation,
    pageNumber: currentDepth + 1,
  };
  console.log("yielded value number", currentDepth + 1);

  if (next_page_token) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const nextParams = { ...params, pagetoken: next_page_token };

    // Le type est maintenant correctement inféré
    const nextGenerator = pageGenerator({
      searchParams: Promise.resolve(nextParams),
      maxDepth,
      currentDepth: currentDepth + 1,
    });

    for await (const nextPage of nextGenerator) {
      yield nextPage;
    }
  }
}
export default async function Page(props: { searchParams: SearchParams }) {
  const generator = pageGenerator({
    searchParams: props.searchParams,

    maxDepth: 3,
  });

  return (
    <ScrollArea className="h-[calc(100vh-1rem)] px-4">
      <div className="flex flex-col gap-4 justify-center w-full">
        <CustomSearchParams />
        <Suspense fallback={<div>Loading...</div>}>
          <AsyncPageResults generator={generator} />
        </Suspense>
      </div>
    </ScrollArea>
  );
}

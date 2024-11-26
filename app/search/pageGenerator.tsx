"use client";
import { useEffect, useState } from "react";
import { PageResult } from "./page"; // Assurez-vous d'importer les types nécessaires
import { RenderPage } from "./RenderPage";
import { RequestInfos } from "./RequestInfos";
import { Status } from "@googlemaps/google-maps-services-js";

interface AsyncPageResultsProps {
  generator: AsyncGenerator<PageResult>;
}

export default function AsyncPageResults({ generator }: AsyncPageResultsProps) {
  const [pages, setPages] = useState<PageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPages = async () => {
      try {
        for await (const page of generator) {
          if (!isMounted) break;

          setPages((prevPages) => {
            if (prevPages.some((p) => p.pageNumber === page.pageNumber)) {
              return prevPages;
            }
            return [...prevPages, page];
          });

          // Side effect <3
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } catch (err) {
        if (isMounted) {
          setError("Une erreur s'est produite lors du chargement des pages.");
          console.error(err);
        }
      }
    };

    fetchPages();

    return () => {
      isMounted = false;
    };
  }, [generator]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return pages.map((page, index) => (
    <div key={`page-${index}`}>
      <RenderPage
        results={page.singleLocation}
        title={`Page ${page.pageNumber} (${page.singleLocation.length} résultats)`}
      >
        <RequestInfos
          status={page.status}
          statusText={page.statusText}
          resStatus={page.resStatus || Status.INVALID_REQUEST}
          hasNextPage={!!page.next_page_token}
          errorMessage={page.error_message}
        />
      </RenderPage>
    </div>
  ));
}

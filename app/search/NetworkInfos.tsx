import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Status } from "@googlemaps/google-maps-services-js";
import { InfoIcon } from "lucide-react";

export function NetworkInfos(props: {
    status: number;
    statusText: string;
    resStatus: Status;
    next_page_token: string | undefined;
    error_message: string | undefined;
  }) {
    return (
      <div className="fixed top-0 m-2 left-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent>
              {Object.entries(props).map(([key, value]) => (
                <p key={key + value}>
                  {key}: {typeof value === "object" ? null : value}
                </p>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
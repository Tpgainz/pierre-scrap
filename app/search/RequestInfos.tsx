import React from "react";
import { Status } from "@googlemaps/google-maps-services-js";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";

interface RequestInfosProps {
  status: number;
  statusText: string;
  resStatus: Status;
  hasNextPage: boolean;
  errorMessage?: string;
}

const statusVariants = {
  [Status.OK]: { variant: "greenOutline", color: "green", code: "200" },
  [Status.ZERO_RESULTS]: { variant: "yellowOutline", color: "yellow" },
  [Status.OVER_QUERY_LIMIT]: { variant: "redOutline", color: "red" },
  [Status.REQUEST_DENIED]: { variant: "redOutline", color: "red" },
  [Status.INVALID_REQUEST]: { variant: "redOutline", color: "red" },
  [Status.UNKNOWN_ERROR]: { variant: "redOutline", color: "red" },
  [Status.MAX_WAYPOINTS_EXCEEDED]: { variant: "redOutline", color: "red" },
  [Status.MAX_ROUTE_LENGTH_EXCEEDED]: { variant: "redOutline", color: "red" },
  [Status.OVER_DAILY_LIMIT]: { variant: "redOutline", color: "red" },
  [Status.NOT_FOUND]: { variant: "redOutline", color: "red" },
} as const;

const RequestInfos: React.FC<RequestInfosProps> = React.memo((props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon style={{ color: statusVariants[props.resStatus].color }} />
        </TooltipTrigger>
        <TooltipContent className="w-full" asChild>
          <Card variant={statusVariants[props.resStatus].variant}>
            <CardHeader>
              <CardTitle
                style={{ color: statusVariants[props.resStatus].color }}
              >
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(props).map(([key, value]) => (
                <p
                  key={key + value}
                  style={{ color: statusVariants[props.resStatus].color }}
                >
                  {key} : {value ?? "N/A"}
                </p>
              ))}
              <p
                style={{ color: statusVariants[props.resStatus].color }}
                className="flex items-center gap-2"
              >
                Next Page{" "}
                {props.hasNextPage ? (
                  <CheckIcon size={16} color="green" />
                ) : (
                  <XIcon size={16} color="red" />
                )}
              </p>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

RequestInfos.displayName = "RequestInfos";

export { RequestInfos };

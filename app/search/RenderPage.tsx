"use client";

import RecursiveCardRender from "@/components/RecursiveCard";
import { DetailedLocation } from "./page";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { mobileRegex } from "@/lib/mobileRegex";

export function RenderPage({ 
  results,
  title 
}: { 
  results: DetailedLocation[],
  title?: string 
}) {
    const [enableNonMobile, setEnableNonMobile] = useState(false);

    const filteredResults = enableNonMobile 
        ? results 
        : results.filter(result => {
            const phoneNumber = result.result.formatted_phone_number;
            return phoneNumber && mobileRegex.test(phoneNumber.replace(/\s+/g, ''));
        });

    return (
        <div>       
            <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                    checked={enableNonMobile}
                    onCheckedChange={(checked) => setEnableNonMobile(checked as boolean)}
                />
                <span>Afficher tous les numéros</span>
            </div>
            <RecursiveCardRender
                title={title || `${filteredResults.length} résultats ${enableNonMobile ? "(tous)" : "(mobiles)"}`}
                data={filteredResults.map((result: DetailedLocation) => ({
                    phone: result.result.formatted_phone_number,
                    name: result.result.name,
                    address: result.result.formatted_address,
                }))}
            />
        </div>
    );
}

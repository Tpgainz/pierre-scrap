"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReqParams } from "../lib/getters/getAllCloses";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Language,
  PlacesNearbyRanking,
} from "@googlemaps/google-maps-services-js";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "./ui/select";
import { mock } from "@/public/mock";
import { Button } from "./ui/button";

const defaultParams = {
  ...mock,
  type: undefined,
  keyword: undefined,
  name: undefined,
  opennow: undefined,
  rankby: undefined,
  pagetoken: undefined,
  language: undefined,
  minprice: undefined,
  maxprice: undefined,
};

export default function CustomSearchParams() {
  const router = useRouter();
  const [queryParams, setQueryParams] = useState<ReqParams>(defaultParams);

  const [formParams, setFormParams] = useState<ReqParams>(queryParams);

  const updateFormParams = (
    path: string[],
    value: ReqParams[keyof ReqParams]
  ) => {
    setFormParams((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        current[key] = { ...current[key] };
        current = current[key];
      }
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = () => {
    setQueryParams(formParams);
  };

  const handleReset = () => {
    setFormParams(defaultParams);
  };

  // Synchronize queryParams with the router
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        if (typeof value === "object") {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      }
    });

    router.push(`${window.location.origin}/search?${params.toString()}`);
  }, [queryParams, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critères de recherche</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {Object.entries(formParams).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={key}>{key}</Label>
            <RecursiveInput
              key={key}
              value={value}
              path={[key]}
              updateQueryParams={updateFormParams}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </CardFooter>
    </Card>
  );
}

function isObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function RecursiveInput({
  value,
  path,
  updateQueryParams,
}: {
  value: ReqParams[keyof ReqParams];
  path: string[];
  updateQueryParams: (
    path: string[],
    value: ReqParams[keyof ReqParams]
  ) => void;
}) {
  if (isObject(value)) {
    return (
      <Card className="bg-secondary p-2 rounded-md">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="ml-2">
            <Label>{key}</Label>
            <RecursiveInput
              value={val}
              path={[...path, key]}
              updateQueryParams={updateQueryParams}
            />
          </div>
        ))}
      </Card>
    );
  }
  return typeof value === "boolean" ? (
    <Checkbox
      checked={value}
      onCheckedChange={(checked) => updateQueryParams(path, checked)}
    />
  ) : typeof value === "number" ? (
    <Input
      type="number"
      value={value ?? ""}
      onChange={(e) => updateQueryParams(path, Number(e.target.value))}
    />
  ) : path[path.length - 1] === "language" ? (
    <Select
      value={value ?? ""}
      onValueChange={(value) => updateQueryParams(path, value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner une valeur" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Language).map((language) => (
          <SelectItem key={language} value={language}>
            {language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : path[path.length - 1] === "rankby" ? (
    <Select
      value={value ?? ""}
      onValueChange={(value) => updateQueryParams(path, value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner une valeur" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(PlacesNearbyRanking).map((ranking) => (
          <SelectItem key={ranking} value={ranking}>
            {ranking}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <Input
      type="text"
      value={value ?? ""}
      onChange={(e) => updateQueryParams(path, e.target.value)}
    />
  );
}

import { ReqParams } from "./getAllCloses";

export function decodeProps(props: ReqParams) {
  let decodedProps = props;
  // Si une des valeurs n'est pas une chaîne ou un nombre, nous devons la décoder
  if (
    Object.values(props).some(
      (value) => typeof value !== "string" && typeof value !== "number"
    )
  ) {
    decodedProps = JSON.parse(decodeURIComponent(JSON.stringify(props)));
  }

  decodedProps = {
    ...decodedProps,
    location:
      typeof decodedProps.location === "string"
        ? JSON.parse(decodedProps.location)
        : decodedProps.location,
  };

  return decodedProps;
}

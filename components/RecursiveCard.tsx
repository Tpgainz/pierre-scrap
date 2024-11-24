import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecursiveCardProps {
  data: any;
  title?: string;
}

const RecursiveCardRender: React.FC<RecursiveCardProps> = ({ data, title }) => {
  const isObject = (val: any) =>
    val && typeof val === "object" && !Array.isArray(val);

  const renderContent = (data: any) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-inside flex flex-col w-full space-y-2 p-2 rounded-md">
          {data.map((item, index) => (
            <li key={index}>
              {isObject(item) ? (
                <RecursiveCardRender data={item} />
              ) : (
                String(item)
              )}
            </li>
          ))}
        </ul>
      );
    } else if (isObject(data)) {
      return (
        <div className=" p-2 flex flex-grow flex-col rounded-md">
          {Object.entries(data).map(([key, value], index) => (
            <div key={index} className="mb-2">
              <strong>{key}:</strong>{" "}
              {isObject(value) || Array.isArray(value) ? (
                <RecursiveCardRender data={value} />
              ) : (
                String(value)
              )}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <span className="text-sm  w-full flex whitespace-break-spaces break-all">
          {String(data)}
        </span>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? "Informations"}</CardTitle>
      </CardHeader>
      <CardContent className="w-full flex whitespace-break-spaces break-all">
        {renderContent(data)}
      </CardContent>
    </Card>
  );
};

export default RecursiveCardRender;

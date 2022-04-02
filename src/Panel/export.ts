import { TPoint } from "../Map/types";

export function pointsToGpx(points: TPoint[]) {
  const baseTime = new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.1"
  creator="Komoot Challenge"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://www.topografix.com/GPX/1/1"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
${points
  .map(([lat, lng]) => {
    const time = new Date(baseTime.getTime() + 1).toISOString();
    return `<wpt lat="${lat}" lon="${lng}"><ele>0</ele><time>${time}</time><extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>171</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions></wpt>`;
  })
  .join("\n")}
</gpx>`;
}

export function downloadFile(name: string, content: string) {
  const a = document.createElement("a");
  const blob = new Blob([content], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  a.setAttribute("href", url);
  a.setAttribute("download", name);
  a.click();
}

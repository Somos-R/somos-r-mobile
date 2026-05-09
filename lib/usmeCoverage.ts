// Simplified polygon for ASOBEUM coverage zone (Usme, Bogotá)
// Source: approximate administrative boundary of Usme locality
const USME_POLYGON: [number, number][] = [
  [4.4789, -74.1386],
  [4.5018, -74.1142],
  [4.4958, -74.0823],
  [4.4642, -74.0679],
  [4.4285, -74.0847],
  [4.3979, -74.1103],
  [4.3873, -74.1452],
  [4.4060, -74.1751],
  [4.4378, -74.1849],
  [4.4789, -74.1386],
];

// Ray-casting algorithm for point-in-polygon
function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function isInsideCoverage(lat: number, lng: number): boolean {
  return isPointInPolygon(lat, lng, USME_POLYGON);
}

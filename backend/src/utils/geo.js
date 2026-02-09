const toRadians = (value) => (value * Math.PI) / 180;

// Retorna distância em metros usando fórmula de Haversine
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371000; // metros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
};

module.exports = {
  calculateDistanceMeters,
};

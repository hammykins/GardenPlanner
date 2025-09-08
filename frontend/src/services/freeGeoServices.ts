import axios from 'axios';

// Free USGS Elevation API - No API key required
export const getElevation = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(
      `https://nationalmap.gov/epqs/pqs.php?x=${lng}&y=${lat}&units=Feet&output=json`
    );
    return response.data.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation;
  } catch (error) {
    console.error('Failed to get elevation:', error);
    return null;
  }
};

// Free Nominatim Geocoding (OpenStreetMap) - No API key required
export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'GardenPlanner/1.0' // Required by Nominatim
        }
      }
    );
    
    if (response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to geocode address:', error);
    return null;
  }
};

// Free Weather API from Open-Meteo - No API key required
export const getWeatherData = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get weather data:', error);
    return null;
  }
};

// Free USDA Plant Hardiness Zone API - No API key required
export const getHardinessZone = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(
      `https://phzmapi.org/${lat},${lng}.json`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get hardiness zone:', error);
    return null;
  }
};

// Free Soil Data from USDA Web Soil Survey - No API key required
export const getSoilData = async (lat: number, lng: number) => {
  try {
    // This is a simplified example - the actual USDA API is more complex
    const response = await axios.get(
      `https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          query: `SELECT * FROM mapunit WHERE mukey IN (SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lng} ${lat})'))`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get soil data:', error);
    return null;
  }
};

// Example usage in your garden planner
export const getGardenAnalysis = async (lat: number, lng: number) => {
  const [elevation, weather, hardinessZone] = await Promise.all([
    getElevation(lat, lng),
    getWeatherData(lat, lng),
    getHardinessZone(lat, lng)
  ]);

  return {
    elevation,
    weather,
    hardinessZone,
    analysis: {
      suitableForGardening: elevation < 8000, // Example logic
      frostDates: hardinessZone?.frost_dates,
      drainageTips: elevation > 500 ? 'Good drainage likely' : 'May need drainage improvements'
    }
  };
};

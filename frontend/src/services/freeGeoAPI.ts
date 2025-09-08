// Free geospatial APIs that work perfectly with Mapbox
import axios from 'axios';

export class FreeGeoServices {
  // 1. FREE ADDRESS GEOCODING (Nominatim - OpenStreetMap)
  static async geocodeAddress(address: string) {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'GardenPlanner/1.0' // Required by Nominatim
        }
      });
      
      if (response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          display_name: result.display_name,
          address: result.address
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  // 2. FREE ELEVATION DATA (Open-Elevation API)
  static async getElevation(lat: number, lng: number) {
    try {
      const response = await axios.get(`https://api.open-elevation.com/api/v1/lookup`, {
        params: {
          locations: `${lat},${lng}`
        }
      });
      
      return response.data.results[0]?.elevation || null;
    } catch (error) {
      console.error('Elevation lookup failed:', error);
      return null;
    }
  }

  // 3. FREE WEATHER DATA (OpenWeatherMap - has free tier)
  static async getWeatherData(lat: number, lng: number, apiKey?: string) {
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not provided');
      return null;
    }
    
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat,
          lon: lng,
          appid: apiKey,
          units: 'metric'
        }
      });
      
      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        windSpeed: response.data.wind.speed
      };
    } catch (error) {
      console.error('Weather lookup failed:', error);
      return null;
    }
  }

  // 4. FREE PLANT DATABASE (Mock data - no API key required)
  static async searchPlants(query: string) {
    // Return mock data for development
    const mockPlants = [
      { id: 1, name: 'Tomato', scientific_name: 'Solanum lycopersicum', family: 'Nightshade', spacing: 60 },
      { id: 2, name: 'Basil', scientific_name: 'Ocimum basilicum', family: 'Mint', spacing: 20 },
      { id: 3, name: 'Lettuce', scientific_name: 'Lactuca sativa', family: 'Daisy', spacing: 25 },
      { id: 4, name: 'Carrot', scientific_name: 'Daucus carota', family: 'Carrot', spacing: 5 },
      { id: 5, name: 'Pepper', scientific_name: 'Capsicum annuum', family: 'Nightshade', spacing: 45 }
    ];
    
    return mockPlants.filter(plant => 
      plant.name.toLowerCase().includes(query.toLowerCase()) ||
      plant.scientific_name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 5. FREE USDA HARDINESS ZONE (No API key required)
  static async getHardinessZone(lat: number, lng: number) {
    try {
      // Simplified approximation based on latitude
      const zones = [
        { minLat: 25, maxLat: 30, zone: '9a-10b' },
        { minLat: 30, maxLat: 35, zone: '8a-9b' },
        { minLat: 35, maxLat: 40, zone: '6b-8a' },
        { minLat: 40, maxLat: 45, zone: '5a-7a' },
        { minLat: 45, maxLat: 50, zone: '3a-5b' }
      ];
      
      const zone = zones.find(z => lat >= z.minLat && lat < z.maxLat);
      return zone?.zone || 'Unknown';
    } catch (error) {
      console.error('Hardiness zone lookup failed:', error);
      return 'Unknown';
    }
  }
}

// Usage hook for integration with Mapbox
export const useGeoServices = () => {
  const geocodeAndAddToMap = async (address: string, map: any) => {
    const result = await FreeGeoServices.geocodeAddress(address);
    if (result) {
      // Add marker to map and fly to location
      map.flyTo({
        center: [result.lng, result.lat],
        zoom: 18
      });
      
      // Get additional data for this location
      const elevation = await FreeGeoServices.getElevation(result.lat, result.lng);
      const zone = await FreeGeoServices.getHardinessZone(result.lat, result.lng);
      
      console.log(`Location: ${result.display_name}`);
      console.log(`Elevation: ${elevation}m`);
      console.log(`Hardiness Zone: ${zone}`);
      
      return { ...result, elevation, zone };
    }
    return null;
  };

  return { 
    geocodeAndAddToMap,
    geocodeAddress: FreeGeoServices.geocodeAddress,
    getElevation: FreeGeoServices.getElevation,
    getWeather: FreeGeoServices.getWeatherData,
    searchPlants: FreeGeoServices.searchPlants,
    getHardinessZone: FreeGeoServices.getHardinessZone
  };
};

import React, { useState, useCallback, useRef, useEffect } from 'react';
import './AddressSearch.css';

interface AddressSearchProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
}

interface SearchResult {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Using Mapbox Geocoding API for consistency
      const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!accessToken) {
        console.log('Mapbox token not found - using OpenStreetMap fallback');
        // Fallback to OpenStreetMap if no Mapbox token
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();
        const mappedResults = data.map((item: any) => ({
          place_name: item.display_name,
          center: [parseFloat(item.lon), parseFloat(item.lat)]
        }));
        setResults(mappedResults);
        setShowResults(true);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${accessToken}&limit=5&types=address,place,poi`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.features || []);
        setShowResults(true);
      } else {
        console.error('Geocoding request failed:', response.status);
        setResults([]);
      }
    } catch (error) {
      console.error('Error searching for places:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide results immediately if query is too short
    if (newQuery.length <= 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search - only search after user stops typing
    timeoutRef.current = setTimeout(() => {
      searchPlaces(newQuery);
    }, 500); // Increased debounce time
  };

  const handleResultClick = (result: SearchResult) => {
    const [lng, lat] = result.center;
    setQuery(result.place_name);
    setShowResults(false);
    onAddressSelect(result.place_name, lat, lng);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0]); // Select first result
    } else if (query.length > 2) {
      searchPlaces(query); // Search if no results yet
    }
  };

  return (
    <div className="address-search">
      <form onSubmit={handleFormSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search for an address..."
            className="address-input"
          />
          <button 
            type="submit" 
            disabled={query.length < 2} 
            className="search-button"
          >
            {isLoading ? '🔍' : '📍'}
          </button>
        </div>
        
        {showResults && results.length > 0 && (
          <div className="search-results">
            {results.map((result, index) => (
              <div
                key={index}
                className="search-result"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-name">{result.place_name}</div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

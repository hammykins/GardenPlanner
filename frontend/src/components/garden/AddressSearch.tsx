import React, { useState } from 'react';
import './AddressSearch.css';

interface AddressSearchProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Using Nominatim for geocoding (free and open source)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data[0]) {
        onAddressSelect(address, parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="address-search">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter your address"
        className="address-input"
      />
      <button type="submit" disabled={loading} className="search-button">
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

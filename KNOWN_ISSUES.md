# Known Issues

## Current Status
The application has been successfully migrated from Leaflet to Mapbox GL JS. Previous Leaflet-related issues have been resolved.

## Dependencies

### Mapbox GL JS
- **Status**: Production ready
- **Version**: 3.14.0+
- **Known Issues**: None currently

### Database
- **PostgreSQL**: Requires proper setup for spatial features
- **Connection**: Ensure PostgreSQL is running on port 5432

## Environment Variables
- **Mapbox Token**: Optional but recommended for enhanced geocoding
- **Fallback**: OpenStreetMap used when Mapbox token not available

Last updated: September 20, 2025

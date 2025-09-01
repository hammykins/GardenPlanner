import aiohttp
import json
import os
from typing import List, Dict, Optional
import asyncio
from pathlib import Path
import logging
from app.models.plant_image import PlantImage
from app.models.plant import PlantSpecies

logger = logging.getLogger(__name__)

class PlantNetService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://my-api.plantnet.org/v2"
        self.image_cache_dir = Path("data/plant_images")
        self.image_cache_dir.mkdir(parents=True, exist_ok=True)

    async def search_species(self, scientific_name: str) -> Optional[Dict]:
        """Search for a plant species and get its images"""
        async with aiohttp.ClientSession() as session:
            params = {
                'api-key': self.api_key,
                'scientific-name': scientific_name
            }
            
            try:
                async with session.get(
                    f"{self.base_url}/species/search",
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._extract_species_data(data)
                    else:
                        logger.error(f"Error searching species: {await response.text()}")
                        return None
            except Exception as e:
                logger.error(f"Error in PlantNet API call: {e}")
                return None

    async def fetch_plant_images(
        self,
        scientific_name: str,
        common_name: str,
        limit: int = 3
    ) -> List[Dict]:
        """Fetch images for a plant species"""
        species_data = await self.search_species(scientific_name)
        if not species_data:
            return []

        images = []
        for image_url in species_data.get('images', [])[:limit]:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(image_url) as response:
                        if response.status == 200:
                            image_data = await response.read()
                            image_info = {
                                'image_data': image_data,
                                'content_type': response.headers.get('content-type', 'image/jpeg'),
                                'source': 'plantnet',
                                'copyright_info': f'Image provided by PlantNet - {scientific_name}'
                            }
                            images.append(image_info)
            except Exception as e:
                logger.error(f"Error fetching image {image_url}: {e}")

        return images

    def _extract_species_data(self, api_response: Dict) -> Dict:
        """Extract relevant species data from API response"""
        if not api_response.get('results'):
            return {}
            
        result = api_response['results'][0]
        return {
            'scientific_name': result.get('scientificName'),
            'family': result.get('family'),
            'images': [img['url'] for img in result.get('images', [])]
        }

async def seed_plant_images(db_session, plant_list_path: str):
    """Seed the database with plant images"""
    with open(plant_list_path, 'r') as f:
        plant_data = json.load(f)
    
    plant_net = PlantNetService(os.getenv('PLANTNET_API_KEY'))
    
    for category, plants in plant_data.items():
        for plant in plants:
            images = await plant_net.fetch_plant_images(
                plant['scientific_name'],
                plant['common_name']
            )
            
            # Create PlantSpecies if it doesn't exist
            plant_species = await db_session.query(PlantSpecies).filter_by(
                scientific_name=plant['scientific_name']
            ).first()
            
            if not plant_species:
                plant_species = PlantSpecies(
                    scientific_name=plant['scientific_name'],
                    common_name=plant['common_name'],
                    categories=plant['categories']
                )
                db_session.add(plant_species)
                await db_session.flush()
            
            # Add images
            for idx, image in enumerate(images):
                plant_image = PlantImage(
                    plant_species_id=plant_species.id,
                    image_data=image['image_data'],
                    content_type=image['content_type'],
                    is_primary=(idx == 0),  # First image is primary
                    source=image['source'],
                    copyright_info=image['copyright_info']
                )
                db_session.add(plant_image)
            
            await db_session.commit()
            
            # Rate limiting to be nice to the API
            await asyncio.sleep(1)

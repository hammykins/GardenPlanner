import os
import json
from pathlib import Path
import pandas as pd
from typing import Dict, List
import asyncio
import aiohttp
import aiofiles
from datetime import datetime

class StorageAnalyzer:
    def __init__(self):
        self.base_dir = Path(__file__).parent / 'app' / 'data'
        self.images_dir = self.base_dir / 'plant_images'
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.storage_report_path = self.base_dir / 'storage_analysis.json'
        
    async def download_and_analyze_image(
        self,
        image_url: str,
        plant_name: str,
        session: aiohttp.ClientSession
    ) -> Dict:
        """Download image and return its metadata"""
        try:
            async with session.get(image_url) as response:
                if response.status == 200:
                    # Create a unique filename
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    safe_name = "".join(c if c.isalnum() else "_" for c in plant_name)
                    filename = f"{safe_name}_{timestamp}.jpg"
                    filepath = self.images_dir / filename
                    
                    # Save the image
                    image_data = await response.read()
                    async with aiofiles.open(filepath, 'wb') as f:
                        await f.write(image_data)
                    
                    return {
                        'file_path': str(filepath),
                        'file_size': len(image_data),
                        'content_type': response.headers.get('content-type', 'image/jpeg')
                    }
        except Exception as e:
            print(f"Error downloading image for {plant_name}: {e}")
            return None
        
    async def analyze_storage_requirements(self):
        """Analyze storage requirements for plant images"""
        # Load plant list
        with open(self.base_dir / 'common_plants.json', 'r') as f:
            plant_data = json.load(f)
        
        storage_data = {
            'total_size_bytes': 0,
            'total_images': 0,
            'images_per_category': {},
            'size_per_category': {},
            'plant_details': []
        }
        
        async with aiohttp.ClientSession() as session:
            for category, plants in plant_data.items():
                storage_data['images_per_category'][category] = 0
                storage_data['size_per_category'][category] = 0
                
                for plant in plants:
                    plant_name = plant['common_name']
                    scientific_name = plant['scientific_name']
                    
                    # Simulate getting 3 images per plant
                    # In production, this would use PlantNet API
                    sample_image_sizes = [
                        500_000,  # 500KB
                        750_000,  # 750KB
                        1_000_000 # 1MB
                    ]
                    
                    plant_total_size = sum(sample_image_sizes)
                    storage_data['total_size_bytes'] += plant_total_size
                    storage_data['total_images'] += len(sample_image_sizes)
                    storage_data['images_per_category'][category] += len(sample_image_sizes)
                    storage_data['size_per_category'][category] += plant_total_size
                    
                    storage_data['plant_details'].append({
                        'name': plant_name,
                        'scientific_name': scientific_name,
                        'category': category,
                        'estimated_size_bytes': plant_total_size,
                        'num_images': len(sample_image_sizes)
                    })
        
        # Convert to more readable format
        analysis = {
            'summary': {
                'total_storage_mb': round(storage_data['total_size_bytes'] / (1024 * 1024), 2),
                'total_images': storage_data['total_images'],
                'average_image_size_kb': round(storage_data['total_size_bytes'] / storage_data['total_images'] / 1024, 2)
            },
            'categories': {
                category: {
                    'total_mb': round(size / (1024 * 1024), 2),
                    'num_images': count
                }
                for category, (size, count) in zip(
                    storage_data['size_per_category'].keys(),
                    zip(storage_data['size_per_category'].values(), storage_data['images_per_category'].values())
                )
            },
            'plants': storage_data['plant_details']
        }
        
        # Save analysis
        with open(self.storage_report_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        # Create a pandas DataFrame for better visualization
        df = pd.DataFrame(storage_data['plant_details'])
        print("\nStorage Analysis Summary:")
        print("========================")
        print(f"Total Storage Required: {analysis['summary']['total_storage_mb']:.2f} MB")
        print(f"Total Number of Images: {analysis['summary']['total_images']}")
        print(f"Average Image Size: {analysis['summary']['average_image_size_kb']:.2f} KB")
        print("\nStorage by Category:")
        for category, details in analysis['categories'].items():
            print(f"{category}: {details['total_mb']:.2f} MB ({details['num_images']} images)")
        
        return analysis

if __name__ == "__main__":
    analyzer = StorageAnalyzer()
    asyncio.run(analyzer.analyze_storage_requirements())

// Philippine Administrative Divisions Data
// This is a simplified version with major provinces and cities
// For a complete implementation, you would need the full dataset from PSA

import philippineData from './philippine_provinces_cities_municipalities_and_barangays_2019v2.json';

// Process the data to create a more usable structure
const processPhilippineData = () => {
  const processedData = {};
  
  Object.values(philippineData).forEach(region => {
    Object.entries(region.province_list).forEach(([provinceName, provinceData]) => {
      processedData[provinceName] = {
        cities: {}
      };
      
      Object.entries(provinceData.municipality_list).forEach(([cityName, cityData]) => {
        processedData[provinceName].cities[cityName] = cityData.barangay_list;
      });
    });
  });
  
  return processedData;
};

export const philippineLocations = processPhilippineData();

// Helper functions
export const getProvinces = () => {
  return Object.keys(philippineLocations).sort();
};

export const getCities = (province) => {
  if (!province || !philippineLocations[province]) {
    return [];
  }
  return Object.keys(philippineLocations[province].cities).sort();
};

export const getBarangays = (province, city) => {
  if (!province || !city || !philippineLocations[province] || !philippineLocations[province].cities[city]) {
    return [];
  }
  return philippineLocations[province].cities[city].sort();
}; 
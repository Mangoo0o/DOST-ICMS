// Sample pricing utility functions - Updated version
export const samplePricingService = {
    // Cache for pricing data
    pricingCache: null,
    cacheTimestamp: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Get all pricing data
    async getAllPricing() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/settings/get_sample_pricing.php', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.pricingCache = data.data;
                this.cacheTimestamp = Date.now();
                return data.data;
            } else {
                console.error('Failed to load sample pricing:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error loading sample pricing:', error);
            return null;
        }
    },

    // Get pricing for specific section and type (synchronous)
    getPricingForSample(section, type) {
        // Check cache first
        if (this.pricingCache && this.cacheTimestamp && 
            (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.findPricingInCache(section, type);
        }

        // Return null if no cache - will fall back to hardcoded pricing
        return null;
    },

    // Find pricing in cache
    findPricingInCache(section, type) {
        if (!this.pricingCache) return null;

        // Handle grouped data structure
        if (this.pricingCache[section]) {
            const sectionPricing = this.pricingCache[section];
            return sectionPricing.find(item => item.type === type);
        }

        // Handle flat array structure
        if (Array.isArray(this.pricingCache)) {
            return this.pricingCache.find(item => 
                item.section === section && item.type === type && item.is_active
            );
        }

        return null;
    },

    // Get all pricing for a section
    getPricingForSection(section) {
        // Check cache first
        if (this.pricingCache && this.cacheTimestamp && 
            (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.findSectionPricingInCache(section);
        }

        return null;
    },

    // Find section pricing in cache
    findSectionPricingInCache(section) {
        if (!this.pricingCache) return null;

        // Handle grouped data structure
        if (this.pricingCache[section]) {
            return this.pricingCache[section];
        }

        // Handle flat array structure
        if (Array.isArray(this.pricingCache)) {
            return this.pricingCache.filter(item => 
                item.section === section && item.is_active
            );
        }

        return null;
    },

    // Clear cache
    clearCache() {
        this.pricingCache = null;
        this.cacheTimestamp = null;
    },

    // Get pricing with fallback to hardcoded values (synchronous)
    getPricingWithFallback(section, type) {
        const pricing = this.getPricingForSample(section, type);
        
        if (pricing) {
            return {
                price: parseFloat(pricing.price),
                basePrice: parseFloat(pricing.price),
                isActive: pricing.is_active
            };
        }

        // Fallback to hardcoded pricing
        return this.getHardcodedPricing(section, type);
    },

    // Hardcoded pricing fallback (original pricing logic)
    getHardcodedPricing(section, type) {
        const pricingMap = {
            'Weighing Scale': {
                'Special Accuracy I (Nawi)': 1200,
                'High Accuracy II (Nawi)': 1000,
                'Medium Accuracy III (Nawi)': 900,
                'Ordinary III (Nawi)': 280,
                'Weighing Scale Ordinary III (platform balance)': 540
            },
            'Test-Weights': {
                '1 kg to 10 kg (OIML Class F2)': 600,
                '10 kg to 20 kg (OIML Class F2)': 800,
                '20 kg to 50 kg (OIML Class F2)': 1000,
                'up to 5 kg (OIML Class M1/M2/M3)': 450,
                '10 kg to 20 kg (OIML Class M1/M2/M3)': 600,
                '25 kg to 50 kg (OIML Class M1/M2/M3)': 700
            },
            'Thermometer': {
                '-20°C to +80°C (Digital Thermometer)': 1700,
                '-30°C to +100°C (Wall / Refrigerator / Bimetallic Thermometer)': 1020,
                '0°C to 45°C (Room, Max & Min Liquid, Thermograph Dial Type & Electronics)': 425
            },
            'Sphygmomanometer': {
                '0 bar to 1 bar mmHg to 750 mmHg': 1300
            },
            'Thermohygrometer': {
                '0-100% Rh, 0-100°C (Electronic and Dial Thermohygrometer)': 1550
            }
        };

        const price = pricingMap[section]?.[type] || 0;
        
        return {
            price: price,
            basePrice: price,
            isActive: true
        };
    }
};
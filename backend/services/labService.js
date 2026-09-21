/**
 * labService.js
 * 
 * Simulated abstraction service for finding nearby soil testing laboratories.
 * In a real application, this would integrate with Google Places API,
 * a local agricultural database, or a map service using the provided coordinates.
 */

const findNearbyLabs = async (lat, lon) => {
    console.log(`Mocking Lab Search for coordinates: ${lat}, ${lon}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a list of mock laboratories based on the abstraction requirement.
    return {
        success: true,
        labs: [
            {
                id: "lab_1",
                name: "Regional Soil Testing Laboratory",
                distance: "5.2 km",
                address: "Agricultural Department Complex, Main Road",
                contact: "+91 98765 43210",
                directions: `https://www.google.com/maps/search/?api=1&query=Soil+Testing+Laboratory+${lat},${lon}`
            },
            {
                id: "lab_2",
                name: "Kisan Suvidha Kendra",
                distance: "12.8 km",
                address: "Market Yard Area, Rural Block",
                contact: "+91 99887 76655",
                directions: `https://www.google.com/maps/search/?api=1&query=Kisan+Suvidha+Kendra+${lat},${lon}`
            },
            {
                id: "lab_3",
                name: "Agri-Science Research Facility",
                distance: "21.5 km",
                address: "University Campus Road",
                contact: "+91 91234 56789",
                directions: `https://www.google.com/maps/search/?api=1&query=Agri-Science+Research+Facility+${lat},${lon}`
            }
        ]
    };
};

module.exports = {
    findNearbyLabs
};

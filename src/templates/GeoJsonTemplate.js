const geoJsonTemplate = (route) => {
    return {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
};

export default geoJsonTemplate;
export const lightStyle = {
  version: 8,
  name: 'Light',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#ffffff'
      }
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      paint: {
        'line-color': '#e2e8f0',
        'line-width': 1
      },
      filter: ['==', 'class', 'primary']
    }
  ]
};

export const darkStyle = {
  version: 8,
  name: 'Dark',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1a1b1e'
      }
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      paint: {
        'line-color': '#2d3748',
        'line-width': 1
      },
      filter: ['==', 'class', 'primary']
    }
  ]
};

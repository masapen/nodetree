const routes = {
  'localhost': {
    server: 'wss://nodetest.backend.pendergrass.io:3000/live/connect'
  },
  'd3mw298potvk6s.cloudfront.net': {
    server: 'wss://nodetest.backend.pendergrass.io:3000/live/connect'
  }
}

export default routes[window.location.hostname];
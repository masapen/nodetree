
const routes = {
	'localhost': {
		server: 'ws://localhost:3000/live/connect'
	},
	'd3mw298potvk6s.cloudfront.net': {
		server: 'ws://localhost:3000/live/connect' //Will change once ELB backend is up and running
	}
}

export default routes[window.location.hostname];
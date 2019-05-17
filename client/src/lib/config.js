
const routes = {
	'localhost': {
		server: 'ws://localhost:3000/live/connect'
		//server: 'ws://nodetestbackend-env.iup8fbxbxc.us-east-1.elasticbeanstalk.com:3000/live/connect'
	},
	'd3mw298potvk6s.cloudfront.net': {
		server: 'ws://nodetestbackend-env.iup8fbxbxc.us-east-1.elasticbeanstalk.com:3000/live/connect'
	}
}

export default routes[window.location.hostname];
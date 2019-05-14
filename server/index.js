require('dotenv').config();
const app = require('./app');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const factoryRoutes = require('./routes/factory');
const {router:websocketRoutes} = require('./routes/websocket');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

app.get('/', (req, res) => res.status(200).json({msg: 'Hello World!'}));
app.post('/', (req, res) => {
	console.log(req.body);
	return res.status(200).send('OK');
});

app.use('/factories', factoryRoutes);
app.use('/live', websocketRoutes);

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.listen(3000, () => console.log('Listening'));
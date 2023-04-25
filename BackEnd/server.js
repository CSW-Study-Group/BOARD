'use strict';

const { app, express, bodyParser } = require('./loaders/express');
const { sequelize, morgan, logger, config, methodOverride } = require('./loaders/module');

// 웹 세팅
app.use(express.static('../FrontEnd/public'));
app.set('views', '../FrontEnd/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// 라우팅
const api_router = require('./src/routes');
const blocked_ips = [];

app.use((req, res, next) => {
  const ip = req.ip;

  if (blocked_ips.includes(ip)) {
    res.status(403).send('Access denied.');
  } else {
    morgan(`:method ":url HTTP/:http-version" :status :response-time ms ${ip}`, { stream: logger.stream })(req, res, next);
  }
});

app.use('/', api_router);

// 연결
app.listen(config.get('server.port'), () => {
  console.log(`Server Running On ${config.get('server.port')} Port!`);
});

sequelize
  .sync({ force: false })
  .then(() => { console.log('Success Connecting DB!'); })
  .catch((err) => { console.error(err); });

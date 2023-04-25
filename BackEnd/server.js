'use strict';

const { app, express, bodyParser } = require('./loaders/express');
const { sequelize, morgan, logger, config, methodOverride } = require('./loaders/module');

// 웹 세팅
app.use(express.static('../FrontEnd/public'));
app.set('views', '../FrontEnd/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan(':method ":url HTTP/:http-version" :status :response-time ms', { stream: logger.stream }));

app.use(methodOverride('_method'));

// 라우팅
const apiRouter = require('./src/routes');
const blockedIps = [];

app.use((req, res, next) => {
  const ip = req.ip;

  if (blockedIps.includes(ip)) {
    res.status(403).send('Access denied.');
  } else {
    next();
  }
});

app.use('/', apiRouter);

// 연결
app.listen(config.get('server.port'), () => {
  console.log(`Server Running On ${config.get('server.port')} Port!`);
});

sequelize
  .sync({ force: false })
  .then(() => { console.log('Success Connecting DB!'); })
  .catch((err) => { console.error(err); });

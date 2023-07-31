'use strict';

const { app, express, bodyParser } = require('./loaders/express');
const { sequelize, morgan, logger, config, methodOverride, sentry, helmet, chalk } = require('./loaders/module');
const { blockedIpGet, ipCheck, ipBlock } = require('./loaders/blockedIp')

// *웹 세팅
app.use(express.static('../FrontEnd/public'));
app.set('views', '../FrontEnd/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// *모니터링 세팅
sentry.init({
  // 모든 요청 트래킹
  dsn: config.get('server.dsn'),
  integrations: [new sentry.Integrations.Http({ tracing: true }), new sentry.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
  enabled: config.get('server.status') === 'production' ? true : false,
});

app.use(sentry.Handlers.requestHandler()); // 요청정보 캡처
app.use(sentry.Handlers.tracingHandler()); // 성능정보 캡처
app.use(sentry.Handlers.errorHandler()); // 에러정보 캡처

// *보안 세팅
if (config.get('server.status') === 'production') {
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(ipBlock); // 서버 공격 감지 후 ip 차단 목록에 추가
  app.use(ipCheck); // 차단 목록에 있는 ip 차단
}

app.use((req, res, next) => {
  morgan(`:method ":url HTTP/:http-version" :status :response-time ms ${req.headers['x-forwarded-for']}`, { stream: logger.stream })(req, res, next);
});

// *라우팅
const api_router = require('./src/routes');

app.use('/', api_router);

// *서버 실행 & DB 연결
if (config.get('server.status') !== 'test') {
  blockedIpGet().then(() => {
    app.listen(config.get('server.port'), () => {
      console.log(chalk.blue(`Server Running On ${config.get('server.port')} Port.`));
    });
  });
}

sequelize
  .sync({ force: false })
  .then(() => {
    config.get('server.status') !== 'test' ? console.log(chalk.blue('Success Connecting DB.')) : null;
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = { app };

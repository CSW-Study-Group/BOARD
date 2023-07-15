'use strict';

const { app, express, bodyParser } = require('./loaders/express');
const { sequelize, morgan, logger, config, methodOverride, sentry, chalk } = require('./loaders/module');
const { success, fail } = require('./src/functions/responseStatus');
const blockedIP = require('./src/services/blockedIp');

// 웹 세팅
app.use(express.static('../FrontEnd/public'));
app.set('views', '../FrontEnd/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

sentry.init({ // 모든 요청 트래킹
  dsn: config.get('server.dsn'),
  integrations: [
    new sentry.Integrations.Http({ tracing: true }),
    new sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
  enabled: config.get('server.status') === 'production' ? true : false,
});

app.use(sentry.Handlers.requestHandler()); // 요청정보 캡처
app.use(sentry.Handlers.tracingHandler()); // 성능정보 캡처
app.use(sentry.Handlers.errorHandler()); // 에러정보 캡처

const detectAttack = (searchText) => {  // 서버 공격 패턴
  const xss_patterns = [
    /<script>/i,
    /<img src=/i,
    /onmouseover=/i,
    /javascript:/i
  ];

  const injection_patterns = [
    /SELECT\s*.*\s*FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*\s+SET/i,
    /DELETE\s+FROM/i
  ];

  const patterns = [...xss_patterns, ...injection_patterns];
  return patterns.some((pattern) => pattern.test(searchText));
};

const blocked_ip = [];

// Blocked_ip 모델에 저장된 차단된 IP 주소를 불러옵니다
const blockedIpGet = async () => {
  try {
    blocked_ips = await blockedIP.getBlockedIp();
    blocked_ip.push(...blocked_ips.map((ip) => ip.blocked_ip));
    console.log('Blocked IP addresses get successfully.');
  } catch (error) {
    console.error('Failed to get blocked IP addresses:', error);
  }
};

const ipCheck = (req, res, next) => {
  if (blocked_ip.includes(req.ip)) {
    return res.status(403).send('Your IP address is blocked.');
  }
  next();
};

const ipBlock = (req, res, next) => {
  try {
    if (detectAttack(req.query.searchText) || detectAttack(req.body.content) || detectAttack(req.body.title)) {
      blocked_ip.push(req.ip);
      // 차단된 IP 주소를 Blocked_ip 모델에 저장합니다
      blockedIP.postBlockedIp(req.ip);

      console.log(`IP address ${req.ip} blocked and saved in the database.`);
  
      return res.status(403).send('Your IP address is blocked');
    }
  }
  catch {
    return fail(res, 500, `Failed to save blocked IP address ${req.ip} in the database:`);
  }
  next();
};

app.use(ipCheck);
app.use(ipBlock);

// 라우팅
const api_router = require('./src/routes');
const blocked_ips = [];

app.use((req, res, next) => {
  const ip = req.ip.replace(/^.*:/, "");

  if (blocked_ips.includes(ip)) {
    res.status(403).send('Access denied.');
  } else {
    morgan(`:method ":url HTTP/:http-version" :status :response-time ms ${ip}`, { stream: logger.stream })(req, res, next);
  }
});

app.use('/', api_router);

if (config.get('server.status') !== 'test') {
  blockedIpGet().then(() => {
    app.listen(config.get('server.port'), () => {
      console.log(chalk.blue(`Server Running On ${config.get('server.port')} Port.`));
    });
  });
}

sequelize
  .sync({ force: false })
  .then(() => { config.get('server.status') !== 'test' ? console.log(chalk.blue('Success Connecting DB.')) : null })
  .catch((err) => { console.error(err); });

module.exports = { app };
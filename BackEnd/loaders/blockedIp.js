'use strict';

const { success, fail } = require('../src/functions/responseStatus');
const blockedIP = require('../src/services/blockedIp');

const blocked_ip = [];

const detectAttack = (input) => {
  // 서버 공격 패턴
  const xss_patterns = [/<script>/i, /<img src=/i, /onmouseover=/i, /javascript:/i];
  const injection_patterns = [/SELECT\s*.*\s*FROM/i, /INSERT\s+INTO/i, /UPDATE\s+.*\s+SET/i, /DELETE\s+FROM/i];

  for (const key in input) {
    if (typeof input[key] === 'string') {
      for (const pattern of xss_patterns) {
        if (pattern.test(input[key])) {
          return true; // XSS attack detected.
        }
      }

      for (const pattern of injection_patterns) {
        if (pattern.test(input[key])) {
          return true; // SQL injection attack detected.
        }
      }
    }
  }

  return false;
};

/**
 * Blocked_ip 모델에 저장된 차단된 IP 주소를 불러옵니다
 */
const blockedIpGet = async () => {
  try {
    const blocked_ips = await blockedIP.getBlockedIp();
    blocked_ip.push(...blocked_ips.map((ip) => ip.blocked_ip));
    console.log('Blocked IP addresses get successfully.');
  } catch (error) {
    console.error('Failed to get blocked IP addresses:', error);
  }
};

/**
 * 차단된 IP 주소인지 확인합니다
 */
const ipCheck = (req, res, next) => {
  if (blocked_ip.includes(req.headers['x-forwarded-for'])) {
    return res.status(403).send('Your IP address is blocked.');
  }
  next();
};

const ipBlock = (req, res, next) => {
  try {
    if (detectAttack(req.query) || detectAttack(req.body)) {
      blocked_ip.push(req.headers['x-forwarded-for']);
      // 차단된 IP 주소를 Blocked_ip 모델에 저장합니다
      blockedIP.postBlockedIp(req.headers['x-forwarded-for']);

      console.log(`IP address ${req.headers['x-forwarded-for']} blocked and saved in the database.`);

      return res.status(403).send('Your IP address is blocked');
    }
  } catch {
    return fail(res, 500, `Failed to save blocked IP address ${req.headers['x-forwarded-for']} in the database:`);
  }
  next();
};

module.exports = {
    blockedIpGet,
    ipCheck,
    ipBlock,
}
'use strict';

const { success, fail } = require('../src/functions/responseStatus');
const blockedIP = require('../src/services/blockedIp');

const detectAttack = (searchText) => {
    // 서버 공격 패턴
    const xss_patterns = [/<script>/i, /<img src=/i, /onmouseover=/i, /javascript:/i];
  
    const injection_patterns = [/SELECT\s*.*\s*FROM/i, /INSERT\s+INTO/i, /UPDATE\s+.*\s+SET/i, /DELETE\s+FROM/i];
  
    const patterns = [...xss_patterns, ...injection_patterns];
    return patterns.some((pattern) => pattern.test(searchText));
};
  
  const blocked_ip = [];
  
  // Blocked_ip 모델에 저장된 차단된 IP 주소를 불러옵니다
  const blockedIpGet = async () => {
    try {
      const blocked_ips = await blockedIP.getBlockedIp();
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
    } catch {
      return fail(res, 500, `Failed to save blocked IP address ${req.ip} in the database:`);
    }
    next();
};

module.exports = {
    blockedIpGet,
    ipCheck,
    ipBlock,
}
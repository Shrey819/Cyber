import tls from 'tls';
import dns from 'dns';
import http from 'http';
import { URL } from 'url';

/**
 * Checks if a hostname matches a Subject Alternative Name or Common Name.
 * Supports wildcard patterns like *.example.com.
 * @param {string} hostname
 * @param {string[]} sans
 * @param {string} cn
 * @returns {boolean}
 */
export function matchHostname(hostname, sans = [], cn = '') {
  const target = hostname.toLowerCase();
  const candidates = [...sans, cn].map(s => s.toLowerCase().trim()).filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === target) return true;

    if (candidate.startsWith('*.')) {
      const rootDomain = candidate.slice(2);
      // Wildcard matches sub.domain.com but not domain.com or deep.sub.domain.com
      const parts = target.split('.');
      if (parts.length > 2) {
        const targetRoot = parts.slice(1).join('.');
        if (targetRoot === rootDomain) return true;
      }
    }
  }

  return false;
}

/**
 * Connects via TLS to port 443 and inspects the peer certificate.
 * @param {string} hostname
 * @returns {Promise<{ ok: boolean, cert?: Object, protocol?: string, authorized?: boolean, authError?: string, error?: string }>}
 */
export function inspectTlsCertificate(hostname) {
  return new Promise((resolve) => {
    let resolved = false;

    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false, // Allow inspect even if self-signed or expired
        timeout: 6000
      },
      () => {
        if (resolved) return;
        resolved = true;

        try {
          const cert = socket.getPeerCertificate(true);
          const protocol = socket.getProtocol();
          const authorized = socket.authorized;
          const authError = socket.authorizationError ? String(socket.authorizationError) : null;
          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({ ok: false, error: 'No TLS certificate presented by server on port 443.' });
            return;
          }

          resolve({
            ok: true,
            cert,
            protocol,
            authorized,
            authError
          });
        } catch (err) {
          socket.destroy();
          resolve({ ok: false, error: err.message });
        }
      }
    );

    socket.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({ ok: false, error: err.message });
    });

    socket.on('timeout', () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({ ok: false, error: 'TLS connection timed out (6s).' });
    });
  });
}

/**
 * Tests whether http:// redirects to https://.
 * @param {string} hostname
 * @returns {Promise<{ redirectsToHttps: boolean, statusCode: number, location: string|null }>}
 */
export function checkHttpToHttpsRedirect(hostname) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://${hostname}`,
      { headers: { 'User-Agent': 'VortexAuditBot/1.0' }, timeout: 5000 },
      (res) => {
        const { statusCode } = res;
        const location = res.headers.location || null;
        res.resume(); // Discard body

        const isRedirect = [301, 302, 307, 308].includes(statusCode);
        const redirectsToHttps = isRedirect && location && location.toLowerCase().startsWith('https://');

        resolve({
          redirectsToHttps: Boolean(redirectsToHttps),
          statusCode: statusCode || 0,
          location
        });
      }
    );

    req.on('error', () => {
      resolve({ redirectsToHttps: false, statusCode: 0, location: null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ redirectsToHttps: false, statusCode: 0, location: null });
    });
  });
}

/**
 * Queries DNS records for hostname.
 * Uses public fallback resolvers if local OS port 53 is unavailable.
 * @param {string} hostname
 * @returns {Promise<{ aRecords: string[], aaaaRecords: string[], mxRecords: Array<Object>, txtRecords: string[], nsRecords: string[], dmarcRecord: string|null }>}
 */
export async function queryDnsRecords(hostname) {
  const resolver = new dns.promises.Resolver();
  try {
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {}

  let [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords, dmarcRecords] = await Promise.all([
    resolver.resolve4(hostname).catch(() => []),
    resolver.resolve6(hostname).catch(() => []),
    resolver.resolveMx(hostname).catch(() => []),
    resolver.resolveTxt(hostname).catch(() => []),
    resolver.resolveNs(hostname).catch(() => []),
    resolver.resolveTxt(`_dmarc.${hostname}`).catch(() => [])
  ]);

  // Fallback to native OS lookup if direct resolver returned no A records
  if (aRecords.length === 0) {
    try {
      const lookupResult = await dns.promises.lookup(hostname, { all: true });
      aRecords = lookupResult.filter(r => r.family === 4).map(r => r.address);
      if (aaaaRecords.length === 0) {
        aaaaRecords = lookupResult.filter(r => r.family === 6).map(r => r.address);
      }
    } catch (e) {}
  }

  const flattenedTxt = txtRecords.map(r => (Array.isArray(r) ? r.join('') : String(r)));
  const dmarcStr = dmarcRecords.length > 0 
    ? (Array.isArray(dmarcRecords[0]) ? dmarcRecords[0].join('') : String(dmarcRecords[0]))
    : null;

  return {
    aRecords,
    aaaaRecords,
    mxRecords,
    txtRecords: flattenedTxt,
    nsRecords,
    dmarcRecord: dmarcStr
  };
}

/**
 * Runs deterministic SSL & DNS Audits on a target hostname.
 * 
 * @param {Object} params
 * @param {string} params.hostname - Target domain name (e.g. example.com)
 * @param {string} [params.url] - Target URL (e.g. https://example.com)
 * @returns {Promise<Array<Object>>} Normalized audit findings
 */
export async function auditSslAndDns({ hostname, url = `https://${hostname}` }) {
  const findings = [];
  const cleanHost = hostname.toLowerCase().trim();

  const addFinding = ({ ruleId, title, description, status, severity, evidence, recommendation }) => {
    findings.push({
      rule_id: ruleId,
      category: 'ssl_dns',
      title,
      description,
      status: status || 'failed',
      severity: severity || 'medium',
      confidence: 1.0,
      affected_urls: [url],
      evidence: evidence || {},
      recommendation: recommendation || {}
    });
  };

  // Run TLS inspect, HTTP redirect check, and DNS queries in parallel
  const [tlsResult, redirectResult, dnsResult] = await Promise.all([
    inspectTlsCertificate(cleanHost),
    checkHttpToHttpsRedirect(cleanHost),
    queryDnsRecords(cleanHost)
  ]);

  // ==========================================
  // 1. SSL / TLS CHECKS
  // ==========================================
  if (!tlsResult.ok) {
    addFinding({
      ruleId: 'ssl-connection-failed',
      title: 'HTTPS / TLS Endpoint Unavailable',
      description: `Could not establish a secure TLS connection on port 443: ${tlsResult.error || 'Connection failed'}.`,
      status: 'failed',
      severity: 'critical',
      evidence: { error: tlsResult.error },
      recommendation: {
        action: 'Provision and bind an SSL/TLS certificate to port 443',
        whyItMatters: 'Web browsers block or warn users against visiting websites without valid HTTPS.',
        effort: 'medium',
        docUrl: 'https://letsencrypt.org/getting-started/'
      }
    });
  } else {
    const { cert, protocol, authorized, authError } = tlsResult;

    // A. Certificate Authority Trust & Validity
    if (!authorized) {
      addFinding({
        ruleId: 'ssl-cert-untrusted',
        title: 'Untrusted or Invalid SSL/TLS Certificate',
        description: `The SSL certificate is not trusted by public certificate authorities: ${authError || 'Unknown trust error'}.`,
        status: 'failed',
        severity: 'critical',
        evidence: {
          issuer: cert.issuer?.O || cert.issuer?.CN,
          authError,
          validFrom: cert.valid_from,
          validTo: cert.valid_to
        },
        recommendation: {
          action: 'Replace self-signed or broken certificate with a trusted CA-issued certificate',
          whyItMatters: 'Browsers display a prominent "Your connection is not private" security barrier to visitors.',
          effort: 'medium'
        }
      });
    } else {
      addFinding({
        ruleId: 'ssl-cert-trusted',
        title: 'SSL/TLS Certificate is Valid & Trusted',
        description: `Certificate issued by "${cert.issuer?.O || cert.issuer?.CN || 'Recognized CA'}" is trusted.`,
        status: 'passed',
        severity: 'info',
        evidence: {
          issuer: cert.issuer?.O || cert.issuer?.CN,
          validTo: cert.valid_to,
          protocol
        }
      });
    }

    // B. Certificate Expiration Date & Remaining Days
    if (cert.valid_to) {
      const expiryDate = new Date(cert.valid_to);
      const now = new Date();
      const msRemaining = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        addFinding({
          ruleId: 'ssl-cert-expired',
          title: 'SSL/TLS Certificate Has Expired',
          description: `The SSL certificate expired on ${expiryDate.toLocaleDateString()} (${Math.abs(daysRemaining)} days ago). Visitors will receive browser security warnings.`,
          status: 'failed',
          severity: 'critical',
          evidence: { expiryDate: cert.valid_to, daysRemaining },
          recommendation: {
            action: 'Renew the SSL/TLS certificate immediately',
            whyItMatters: 'An expired certificate breaks all HTTPS encryption trust.',
            effort: 'easy'
          }
        });
      } else if (daysRemaining <= 14) {
        addFinding({
          ruleId: 'ssl-cert-expiring-soon',
          title: 'SSL/TLS Certificate Expires in Less Than 14 Days',
          description: `Certificate expires on ${expiryDate.toLocaleDateString()} (${daysRemaining} days remaining).`,
          status: 'failed',
          severity: 'high',
          evidence: { expiryDate: cert.valid_to, daysRemaining },
          recommendation: {
            action: 'Renew certificate or verify automated renewal (Certbot/ACME) is active',
            whyItMatters: 'Failure to renew will cause unexpected site downtime and security blocks.',
            effort: 'easy'
          }
        });
      } else if (daysRemaining <= 30) {
        addFinding({
          ruleId: 'ssl-cert-expiring-30-days',
          title: 'SSL/TLS Certificate Expires Within 30 Days',
          description: `Certificate expires on ${expiryDate.toLocaleDateString()} (${daysRemaining} days remaining).`,
          status: 'failed',
          severity: 'medium',
          evidence: { expiryDate: cert.valid_to, daysRemaining },
          recommendation: {
            action: 'Plan renewal before expiration',
            effort: 'easy'
          }
        });
      } else {
        addFinding({
          ruleId: 'ssl-cert-expiry-healthy',
          title: 'Certificate Expiry Date Healthy',
          description: `Certificate is valid for another ${daysRemaining} days (expires ${expiryDate.toLocaleDateString()}).`,
          status: 'passed',
          severity: 'info',
          evidence: { daysRemaining, expiryDate: cert.valid_to }
        });
      }
    }

    // C. Hostname Matching (SANs & CN)
    const sans = cert.subjectaltname 
      ? cert.subjectaltname.split(',').map(s => s.replace(/^DNS:/i, '').trim())
      : [];
    const cn = cert.subject?.CN || '';
    const isHostnameMatch = matchHostname(cleanHost, sans, cn);

    if (!isHostnameMatch) {
      addFinding({
        ruleId: 'ssl-hostname-mismatch',
        title: 'SSL Certificate Hostname Mismatch',
        description: `The certificate presented is issued for "${cn}" and SANs [${sans.slice(0, 3).join(', ')}], which does not match requested host "${cleanHost}".`,
        status: 'failed',
        severity: 'critical',
        evidence: { requestedHost: cleanHost, certificateCommonName: cn, subjectAltNames: sans },
        recommendation: {
          action: 'Include the domain name in the certificate Subject Alternative Names (SANs)',
          whyItMatters: 'Browsers reject certificates where the requested domain does not match certificate names.',
          effort: 'medium'
        }
      });
    } else {
      addFinding({
        ruleId: 'ssl-hostname-matched',
        title: 'SSL Certificate Hostname Matches Target',
        description: `Domain "${cleanHost}" successfully matches certificate SANs/CN.`,
        status: 'passed',
        severity: 'info',
        evidence: { matchingCN: cn, sansCount: sans.length }
      });
    }

    // D. TLS Protocol Version (TLS 1.2 vs 1.3)
    if (protocol === 'TLSv1.3') {
      addFinding({
        ruleId: 'ssl-tls13-supported',
        title: 'Modern TLS 1.3 Protocol Active',
        description: 'Server negotiated connection using modern, high-speed TLS 1.3 encryption.',
        status: 'passed',
        severity: 'info',
        evidence: { protocol }
      });
    } else if (protocol === 'TLSv1.2') {
      addFinding({
        ruleId: 'ssl-tls12-supported',
        title: 'TLS 1.2 Connection Active',
        description: 'Server supports secure TLS 1.2. Upgrading to TLS 1.3 is recommended for faster handshakes and 0-RTT support.',
        status: 'passed',
        severity: 'info',
        evidence: { protocol }
      });
    }
  }

  // E. HTTP to HTTPS Auto-Redirect
  if (redirectResult.redirectsToHttps) {
    addFinding({
      ruleId: 'ssl-http-to-https-redirect',
      title: 'HTTP to HTTPS Redirection Active',
      description: `Insecure HTTP requests automatically redirect (${redirectResult.statusCode}) to secure HTTPS: ${redirectResult.location}`,
      status: 'passed',
      severity: 'info',
      evidence: { statusCode: redirectResult.statusCode, destination: redirectResult.location }
    });
  } else {
    addFinding({
      ruleId: 'ssl-missing-https-redirect',
      title: 'Missing Automatic HTTP-to-HTTPS Redirection',
      description: 'The plain HTTP endpoint (port 80) does not redirect traffic to secure HTTPS. Visitors navigating without typing "https://" remain unencrypted.',
      status: 'failed',
      severity: 'high',
      evidence: { statusCode: redirectResult.statusCode, location: redirectResult.location },
      recommendation: {
        action: 'Configure a 301 Permanent Redirect on port 80 to redirect to https://',
        whyItMatters: 'Guarantees that all user traffic is encrypted, even if visitors type plain http://.',
        codeSnippet: '# Nginx redirect block\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}',
        effort: 'easy'
      }
    });
  }

  // ==========================================
  // 2. DNS CHECKS
  // ==========================================
  const { aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords, dmarcRecord } = dnsResult;

  // A. A and AAAA Resolution
  if (aRecords.length === 0 && aaaaRecords.length === 0) {
    addFinding({
      ruleId: 'dns-no-ip-records',
      title: 'Missing DNS A / AAAA Host Records',
      description: `Hostname "${cleanHost}" has no A (IPv4) or AAAA (IPv6) records in public DNS.`,
      status: 'failed',
      severity: 'critical',
      evidence: { aRecords, aaaaRecords },
      recommendation: {
        action: 'Configure an A record pointing to your server IP address in your DNS zone',
        whyItMatters: 'Without an A record, clients cannot resolve the web server IP address.',
        effort: 'easy'
      }
    });
  } else {
    const isDualStack = aRecords.length > 0 && aaaaRecords.length > 0;
    addFinding({
      ruleId: 'dns-ip-resolution-healthy',
      title: isDualStack ? 'Dual-Stack IPv4 & IPv6 Resolution Active' : 'IPv4 DNS Resolution Active',
      description: `Resolved ${aRecords.length} IPv4 address(es) [${aRecords.join(', ')}]${aaaaRecords.length > 0 ? ` and ${aaaaRecords.length} IPv6 address(es)` : ''}.`,
      status: 'passed',
      severity: 'info',
      evidence: { aRecords, aaaaRecords, isDualStack }
    });
  }

  // B. Email Security: SPF Record (v=spf1)
  const spfRecord = txtRecords.find(t => t.toLowerCase().includes('v=spf1'));
  if (spfRecord) {
    addFinding({
      ruleId: 'dns-spf-configured',
      title: 'Sender Policy Framework (SPF) Configured',
      description: `Domain has an active SPF TXT record: "${spfRecord.slice(0, 100)}".`,
      status: 'passed',
      severity: 'info',
      evidence: { spfRecord }
    });
  } else {
    addFinding({
      ruleId: 'dns-missing-spf',
      title: 'Missing SPF Email Authentication Record',
      description: 'No SPF (Sender Policy Framework) TXT record detected. Threat actors can easily spoof your domain in phishing emails.',
      status: 'failed',
      severity: 'low',
      evidence: { txtRecordsFound: txtRecords.length },
      recommendation: {
        action: 'Add a TXT record for SPF to define authorized mail sending servers',
        whyItMatters: 'Protects brand reputation and prevents unauthorized email spoofing.',
        codeSnippet: 'v=spf1 mx ~all',
        effort: 'easy',
        docUrl: 'https://support.google.com/a/answer/33786'
      }
    });
  }

  // C. Email Security: DMARC Record (v=DMARC1)
  if (dmarcRecord && dmarcRecord.toLowerCase().includes('v=dmarc1')) {
    addFinding({
      ruleId: 'dns-dmarc-configured',
      title: 'DMARC Domain Alignment Configured',
      description: `Domain has an active DMARC record at "_dmarc.${cleanHost}": "${dmarcRecord.slice(0, 100)}".`,
      status: 'passed',
      severity: 'info',
      evidence: { dmarcRecord }
    });
  } else {
    addFinding({
      ruleId: 'dns-missing-dmarc',
      title: 'Missing DMARC Email Anti-Spoofing Policy',
      description: `No DMARC TXT record found at "_dmarc.${cleanHost}". Major email providers (Google, Yahoo, Microsoft) require DMARC for domain authenticity.`,
      status: 'failed',
      severity: 'low',
      evidence: { hostQueried: `_dmarc.${cleanHost}` },
      recommendation: {
        action: 'Publish a DMARC TXT record to monitor and prevent email spoofing',
        whyItMatters: 'Enforces alignment and specifies action (none, quarantine, reject) when spoofed emails are received.',
        codeSnippet: 'v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com',
        effort: 'easy',
        docUrl: 'https://dmarc.org/overview/'
      }
    });
  }

  return findings;
}

/**
 * Calculates SSL & DNS Category Score (0 - 100).
 * @param {Array<Object>} sslDnsFindings
 * @returns {number} Score from 0 to 100
 */
export function calculateSslDnsScore(sslDnsFindings) {
  let score = 100;
  for (const f of sslDnsFindings) {
    if (f.status === 'passed') continue;

    if (f.severity === 'critical') {
      score -= 35; // e.g. TLS connection failed, cert untrusted or expired, hostname mismatch
    } else if (f.severity === 'high') {
      score -= 15; // e.g. Missing HTTP-to-HTTPS redirect, cert expires < 14 days
    } else if (f.severity === 'medium') {
      score -= 10; // e.g. Cert expires < 30 days
    } else if (f.severity === 'low') {
      score -= 5;  // e.g. Missing SPF / DMARC
    }
  }

  return Math.max(10, Math.min(100, score));
}

export default {
  inspectTlsCertificate,
  checkHttpToHttpsRedirect,
  queryDnsRecords,
  auditSslAndDns,
  calculateSslDnsScore
};

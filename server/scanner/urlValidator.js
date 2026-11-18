import dns from 'dns';
import { URL } from 'url';

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 * @param {string} ip
 * @returns {boolean}
 */
export function isPrivateOrReservedIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP treated as unsafe
  }

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation / TEST-NET)
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future Use)
  if (b0 >= 240) return true;

  // Broadcast (255.255.255.255)
  if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or reserved.
 * @param {string} ip
 * @returns {boolean}
 */
export function isPrivateOrReservedIPv6(ip) {
  const normalized = ip.toLowerCase();
  // ::1 loopback, :: unspecified
  if (normalized === '::1' || normalized === '::') return true;
  // fe80::/10 link-local
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // fc00::/7 unique local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  return false;
}

/**
 * Normalizes a user input string into a valid web domain or URL.
 * @param {string} input
 * @returns {{ normalizedDomain: string, displayUrl: string, targetUrl: string }}
 */
export function normalizeTargetUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('A valid domain or website URL is required.');
  }

  let cleaned = input.trim();
  if (!cleaned) {
    throw new Error('Domain or URL cannot be empty.');
  }

  // Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  let parsed;
  try {
    parsed = new URL(cleaned);
  } catch (err) {
    throw new Error(`Invalid URL format: "${input}". Please provide a valid domain name or URL.`);
  }

  // Enforce http or https protocol
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.+$/, '');
  if (!hostname || hostname.length > 253) {
    throw new Error('Invalid domain name length.');
  }

  // Disallow forbidden special hostnames
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error(`Access to local or internal host "${hostname}" is prohibited for security.`);
  }

  // Check if hostname is directly an IP address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      throw new Error(`Access to private, loopback, or reserved IP address "${hostname}" is prohibited.`);
    }
  }

  const targetUrl = parsed.origin;
  const displayUrl = `${parsed.protocol}//${hostname}${parsed.port ? `:${parsed.port}` : ''}`;
  const normalizedDomain = hostname;

  return {
    normalizedDomain,
    displayUrl,
    targetUrl
  };
}

/**
 * Asynchronously resolves the domain and verifies that its IP is public.
 * Protects against SSRF by rejecting private IP resolutions.
 * @param {string} hostname
 * @returns {Promise<{ resolvedIp: string, isSafe: boolean }>}
 */
export async function validateSafeHostDns(hostname) {
  try {
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      throw new Error(`Could not resolve host "${hostname}". Hostname does not exist in public DNS.`);
    }

    for (const record of lookupResult) {
      const { address, family } = record;
      if (family === 4) {
        if (isPrivateOrReservedIPv4(address)) {
          throw new Error(`SSRF Block: Domain "${hostname}" resolves to private or reserved IP address ${address}. Scanning blocked.`);
        }
      } else if (family === 6) {
        if (isPrivateOrReservedIPv6(address)) {
          throw new Error(`SSRF Block: Domain "${hostname}" resolves to private IPv6 address ${address}. Scanning blocked.`);
        }
      }
    }

    return {
      resolvedIp: lookupResult[0].address,
      isSafe: true
    };
  } catch (err) {
    if (err.message && err.message.startsWith('SSRF Block:')) {
      throw err;
    }
    throw new Error(`DNS resolution failed for "${hostname}": ${err.message || 'Host unreachable'}`);
  }
}

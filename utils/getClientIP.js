const getClientIP = (req) => {
  // Check for IP in X-Forwarded-For header
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // Get the first IP in case of multiple IPs
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // Check for IP in X-Real-IP header (common with nginx)
  const realIP = req.headers["x-real-ip"];
  if (realIP) {
    return realIP;
  }

  // If no proxy headers, get the remote address
  // Handle both IPv4 and IPv6
  const remoteAddress =
    req.connection.remoteAddress || req.socket.remoteAddress;

  // If IPv6 format, clean it up
  if (remoteAddress && remoteAddress.includes("::ffff:")) {
    return remoteAddress.split("::ffff:")[1];
  }

  return remoteAddress || "Unknown";
};

module.exports = getClientIP;

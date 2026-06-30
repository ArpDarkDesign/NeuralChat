const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

const buckets = new Map();

const supportRateLimiter = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return next();
  }

  if (bucket.count >= MAX_REQUESTS) {
    res.set("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));

    return res.status(429).json({
      message: "Too many support requests. Please try again later.",
    });
  }

  bucket.count += 1;

  return next();
};

module.exports = supportRateLimiter;

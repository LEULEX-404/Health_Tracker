// Simple audit logger middleware — logs every incoming API call
const auditLogger = (req, res, next) => {
  const log = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
  };
  console.log("[AUDIT]", JSON.stringify(log));
  next();
};

export default auditLogger;
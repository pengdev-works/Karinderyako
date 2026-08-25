/**
 * Express Middleware: Geofencing Validator for Poblacion, Laang, Abra
 */

function geofenceValidator(req, res, next) {
  const address = req.body.deliveryAddress || req.body.address || req.body.coverage;
  
  if (!address) {
    return next();
  }

  const normalized = address.toLowerCase();
  const isPoblacion = normalized.includes("poblacion");
  const isLaangOrAbra = normalized.includes("laang") || normalized.includes("abra");

  if (!isPoblacion || !isLaangOrAbra) {
    return res.status(403).json({
      error: "GEOFENCE_RESTRICTION",
      message: "Security Policy Enforcement: Deliveries and business listings are strictly limited to Poblacion, Laang, Abra."
    });
  }

  next();
}

module.exports = geofenceValidator;

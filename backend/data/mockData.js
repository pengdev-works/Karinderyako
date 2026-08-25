/**
 * KarinderyaKo Express.js Backend API — Clean Initial Data Store
 * Service Area: Poblacion, Laang, Abra
 */

const mockData = {
  geofence: {
    municipality: "Laang",
    barangay: "Poblacion",
    province: "Abra",
    postalCode: "2800"
  },

  // Empty initial state ready for real registration & uploads
  karinderyas: [],
  products: [],
  riders: [],
  orders: [],
  auditLogs: [
    {
      id: "log-1",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: "EXPRESS_API",
      action: "SYSTEM_INITIALIZED",
      details: "Express REST API initialized with clean state for Poblacion, Laang, Abra",
      status: "SUCCESS"
    }
  ]
};

module.exports = mockData;

import Organization from '../models/Organization.js';

const tenantMiddleware = async (req, res, next) => {
  // 1. Extract Organization ID
  const orgId = req.headers['x-organization-id'];

  // 2. Validate
  if (!orgId) {
    return res.status(400).json({ error: 'x-organization-id header is required' });
  }

  try {
    // 3. Verify Organization exists
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(401).json({ error: 'Invalid Organization ID' });
    }

    if (org.status !== 'active') {
      return res.status(403).json({ error: 'Organization is not active' });
    }

    // 4. Inject into request
    req.orgId = orgId;
    req.organization = org;
    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    res.status(500).json({ error: 'Tenant validation failed' });
  }
};

export default tenantMiddleware;

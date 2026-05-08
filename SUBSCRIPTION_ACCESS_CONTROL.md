# Subscription-Based Access Control Implementation

## Overview
This system provides complete access control based on subscription status:
- **Free Trial Users**: Get access to ALL features
- **Paid Subscribers**: Get access only to features in their plan tier

## Features by Plan

### Basic Plan
- Unlimited Work order
- Request
- AI

### Professional Plan (Most Popular)
- Unlimited work Order
- Requests
- Asset
- Location
- PM
- Over AI

### Enterprise Plan
- Unlimited work Order
- Requests
- Asset
- Location
- PM
- Over AI
- Analytics
- Material Request

### Premium Plan (Custom Quote)
- Unlimited work Order
- Requests
- Asset
- Location
- PM
- Over AI
- Analytics
- Material Request
- Purchase Order

## Backend Implementation

### 1. Trial Service Updates (`trial.service.js`)

#### `getTrialFeatures()`
Returns ALL features for trial users:
```javascript
// Trial users get full access to all features
const features = getTrialFeatures();
```

#### `getUserAccessibleFeatures(userId)`
Gets the features accessible to a user based on trial or subscription:
```javascript
const features = await trialService.getUserAccessibleFeatures(userId);
// Returns: ['unlimited_work_orders', 'requests', 'asset_tracking', ...]
```

#### `hasFeatureAccess(userId, feature)`
Checks if user has access to a specific feature:
```javascript
const hasAccess = await trialService.hasFeatureAccess(userId, 'analytics');
// Returns: true/false
```

#### `getUserSubscriptionInfo(userId)`
Gets complete subscription info:
```javascript
const info = await trialService.getUserSubscriptionInfo(userId);
// Returns: { plan: 'professional', isTrialPeriod: true/false, features: [...] }
```

### 2. New Endpoints

#### GET `/api/subscriptions/features/subscription-info`
Returns user's subscription plan and accessible features
```javascript
Response: {
  plan: 'professional' | 'basic' | 'enterprise' | 'premium' | 'trial',
  isTrialPeriod: true/false,
  features: ['unlimited_work_orders', 'requests', ...]
}
```

#### GET `/api/subscriptions/features/accessible`
Returns array of accessible features
```javascript
Response: {
  features: ['unlimited_work_orders', 'requests', 'asset_tracking', ...]
}
```

#### GET `/api/subscriptions/features/has-access?feature=analytics`
Checks if user has access to specific feature
```javascript
Response: {
  feature: 'analytics',
  hasAccess: true/false
}
```

## Frontend Implementation

### 1. Hook: `useFeatureAccess()`

Usage in components:
```javascript
import { useFeatureAccess, FEATURES } from '../hooks/useFeatureAccess';

function MyComponent() {
  const { 
    hasFeature,           // Function to check specific feature
    isInTrial,           // Function to check if in trial
    getPlan,             // Function to get current plan
    accessibleFeatures,  // Array of feature names
    subscriptionInfo,    // Object with plan and features
    loading,             // Boolean
    error,               // Error message or null
    refetch              // Function to refresh
  } = useFeatureAccess();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {hasFeature(FEATURES.ANALYTICS) && <AnalyticsDashboard />}
      {isInTrial() && <TrialBanner />}
      Current Plan: {getPlan()}
    </div>
  );
}
```

### 2. Component: `<FeatureGate />`

Wraps content and shows upgrade message if user doesn't have access:
```javascript
import { FeatureGate, FEATURES } from '../components/FeatureGate';

function MyComponent() {
  return (
    <FeatureGate feature={FEATURES.ANALYTICS}>
      <AnalyticsComponent />
    </FeatureGate>
  );
}

// With custom fallback:
<FeatureGate 
  feature={FEATURES.MATERIAL_REQUESTS}
  fallback={<div>Upgrade to access Material Requests</div>}
>
  <MaterialRequestsComponent />
</FeatureGate>

// Without upgrade message:
<FeatureGate 
  feature={FEATURES.PURCHASE_ORDER}
  showUpgradeMessage={false}
>
  <PurchaseOrderComponent />
</FeatureGate>
```

### 3. Available Feature Constants

```javascript
import { FEATURES } from '../hooks/useFeatureAccess';

FEATURES.UNLIMITED_WORK_ORDERS   // All plans
FEATURES.REQUESTS                 // All plans
FEATURES.ASSET_TRACKING           // Professional, Enterprise, Premium
FEATURES.LOCATION_MANAGEMENT      // Professional, Enterprise, Premium
FEATURES.PREVENTIVE_MAINTENANCE   // Professional, Enterprise, Premium
FEATURES.ADVANCED_AI              // Professional, Enterprise, Premium
FEATURES.ANALYTICS                // Enterprise, Premium
FEATURES.MATERIAL_REQUESTS        // Enterprise, Premium
FEATURES.PURCHASE_ORDER           // Premium only
```

## Usage Examples

### Example 1: Conditional Feature Display
```javascript
function Dashboard() {
  const { hasFeature } = useFeatureAccess();

  return (
    <div>
      {hasFeature(FEATURES.UNLIMITED_WORK_ORDERS) && (
        <WorkOrdersSection />
      )}
      
      {hasFeature(FEATURES.ANALYTICS) && (
        <AnalyticsSection />
      )}
      
      {hasFeature(FEATURES.PURCHASE_ORDER) && (
        <PurchaseOrderSection />
      )}
    </div>
  );
}
```

### Example 2: Feature-Restricted Modal
```javascript
function MaterialRequestModal() {
  return (
    <FeatureGate 
      feature={FEATURES.MATERIAL_REQUESTS}
      fallback={<PremiumFeatureUpsell />}
    >
      <MaterialRequestForm />
    </FeatureGate>
  );
}
```

### Example 3: Checking in Backend Route Middleware
```javascript
// Create middleware for feature access
const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    const trialService = require('./trial.service');
    const hasAccess = await trialService.hasFeatureAccess(
      req.user.id, 
      featureName
    );
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Feature not available in your plan' 
      });
    }
    
    next();
  };
};

// Use in routes:
router.post('/analytics/export', 
  authenticate, 
  checkFeatureAccess('analytics'),
  controller.exportAnalytics
);
```

### Example 4: Show Feature Matrix in Pricing
```javascript
function PricingTable() {
  const featureList = [
    { name: 'Work Orders', feature: FEATURES.UNLIMITED_WORK_ORDERS },
    { name: 'Analytics', feature: FEATURES.ANALYTICS },
    { name: 'Purchase Orders', feature: FEATURES.PURCHASE_ORDER },
  ];

  return (
    <table>
      <tbody>
        {featureList.map(item => (
          <tr key={item.feature}>
            <td>{item.name}</td>
            <td><FeatureAccessBadge feature={item.feature} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## How It Works

### Trial Users Flow
1. User registers → Company created with `onFreeTrial: true`
2. Trial subscription created with `isTrialPeriod: true`
3. `getTrialFeatures()` returns ALL features
4. User can access all features during trial period

### Paid Users Flow
1. User upgrades to paid plan (Basic/Professional/Enterprise/Premium)
2. New subscription created with `isTrialPeriod: false` and selected `plan`
3. `getFeaturesByPlan(plan)` returns only plan-specific features
4. User can only access features included in their plan

### Feature Check Flow
1. Component calls `useFeatureAccess()`
2. Hook calls `/api/subscriptions/features/subscription-info`
3. Backend checks if user in trial OR has active subscription
4. Backend returns features array based on status
5. Component checks features array for specific features

## Testing

### Test Trial Access
```bash
# 1. Register new user (auto-creates trial)
# 2. Check trial features:
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/subscriptions/features/accessible

# Should return all features
```

### Test Paid Access
```bash
# 1. Upgrade user to 'basic' plan
# 2. Check accessible features:
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/subscriptions/features/accessible

# Should return only basic plan features
```

### Test Feature Check
```bash
curl -H "Authorization: Bearer token" \
  "http://localhost:3000/api/subscriptions/features/has-access?feature=analytics"

# Returns: { feature: 'analytics', hasAccess: false }
```

## Important Notes

1. **Trial users always get ALL features** - This is intentional to encourage signup and feature exploration
2. **Subscription status checked at request time** - Features are evaluated fresh on each API call
3. **Plan changes are immediate** - User gains/loses access instantly upon plan upgrade/downgrade
4. **Trial expiration blocks access** - After trial ends, user must subscribe or loses feature access
5. **Feature names are lowercase with underscores** - Consistent naming across backend and frontend

## Migration Guide

If updating existing code:

1. Replace old permission checks with feature checks:
   ```javascript
   // Old:
   if (user.plan === 'premium') { ... }
   
   // New:
   if (hasFeature(FEATURES.ANALYTICS)) { ... }
   ```

2. Update middleware to use feature checks:
   ```javascript
   // Old: authorizeRoles('admin', 'manager')
   
   // New: checkFeatureAccess('analytics')
   ```

3. Update navigation/UI to show/hide features dynamically based on `hasFeature()`

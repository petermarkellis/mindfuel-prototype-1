# Node Metrics Implementation

## Overview

This document describes the current implementation of node metrics (potential, total contribution, and success potential) and plans for future enhancement.

## Current Implementation

### Database Schema

The `nodes` table includes the following metric columns:
- `potential` (INTEGER) - Potential score (0-100)
- `total_contribution` (INTEGER) - Total contribution score (0-100) 
- `success_potential` (INTEGER) - Success potential score (0-100)
- `risk` (risk_level ENUM) - Risk assessment level

The `type_risks` table manages risk profiles:
- `node_type` (node_type ENUM) - References node types
- `default_risk` (risk_level ENUM) - Default risk for this type
- `risk_description` (TEXT) - Explanation of risk level
- `risk_factors` (TEXT[]) - Array of specific risk factors

### Random Value Generation

**Status**: ✅ Implemented (Temporary Solution)

For new nodes created through the UI, random values are generated:

```javascript
const generateRandomMetrics = () => {
  return {
    potential: Math.floor(Math.random() * 40) + 60, // 60-100
    totalContribution: Math.floor(Math.random() * 50) + 40, // 40-90
    successPotential: Math.floor(Math.random() * 20) + 80 // 80-100
  };
};
```

**Rationale**: These ranges ensure all nodes have realistic-looking values while we develop the proper calculation logic.

### Type-Based Risk Assignment

**Status**: ✅ Implemented

Risk levels are assigned based on node type using the `type_risks` table:

```javascript
const getRiskForNodeType = async (nodeType) => {
  try {
    const riskData = await typeRiskService.getRiskForType(nodeType);
    return riskData.default_risk;
  } catch (error) {
    // Fallback to hardcoded defaults
    const fallbackRisks = {
      'Opportunity': 'medium',
      'Product': 'high', 
      'Data Asset': 'low',
      'Data Source': 'medium'
    };
    return fallbackRisks[nodeType] || 'notset';
  }
};
```

**Default Risk Levels by Type**:
- **Opportunity**: Medium (market uncertainties, implementation challenges)
- **Product**: High (technical complexity, user adoption risks)
- **Data Asset**: Low (established information resources)
- **Data Source**: Medium (reliability and integration concerns)

### Data Flow

1. **Node Creation** (`Layout.jsx`):
   - Generates random metrics using `generateRandomMetrics()`
   - Passes values to `useSupabaseNodes.createNode()`

2. **Database Storage** (`useSupabaseNodes.js`):
   - Transforms `totalContribution` → `total_contribution`
   - Stores all metrics in database

3. **Data Retrieval** (`dataMigration.js`):
   - Transforms `total_contribution` → `totalContribution`
   - Loads metrics into node data

4. **UI Display** (`SideDrawer.jsx`):
   - Animates progress bars based on metric values
   - Shows percentage values in side panel

## Migration

### 004_update_null_metrics.sql

Updates any existing nodes with NULL metric values:
- Sets random values for consistency
- Adds database comments explaining temporary nature
- Ensures all nodes have displayable metrics

### 005_add_type_risks.sql

Implements type-based risk management:
- Adds 'critical' to risk_level enum
- Creates `type_risks` table with default risk profiles
- Updates existing nodes to use type-appropriate risk levels
- Provides risk descriptions and factor arrays for each type

## Future Enhancement Plans

### Phase 1: Basic Calculation Logic
- [ ] Implement node type-specific base scores
- [ ] Add connection-based contribution calculations
- [ ] Create risk-adjusted potential scoring

### Phase 2: Advanced Analytics
- [ ] Network analysis for contribution scoring
- [ ] Machine learning for success prediction
- [ ] Historical performance tracking

### Phase 3: User Customization
- [ ] Allow manual metric overrides
- [ ] Custom calculation formulas
- [ ] Industry-specific scoring models

## Files Modified

- `src/components/Layout/Layout.jsx` - Random metric generation and type-based risk assignment
- `src/lib/supabase.js` - Added typeRiskService for database queries
- `supabase/migrations/004_update_null_metrics.sql` - Database cleanup for metrics
- `supabase/migrations/005_add_type_risks.sql` - Type-based risk management system
- `docs/METRICS_IMPLEMENTATION.md` - This documentation

## Testing

To verify the implementation:

1. Create a new node through the UI
2. Check that it appears in the side panel with realistic metric values
3. Verify values are persisted in the database
4. Confirm metrics display properly in the progress bars

## Notes

- Current random values are intentionally in reasonable ranges (not 0-100 full range)
- Values are generated at node creation time, not dynamically
- The implementation maintains backward compatibility with existing data
- Database comments indicate the temporary nature of random values

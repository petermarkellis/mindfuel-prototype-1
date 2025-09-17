# Risk Level Styling System

## Overview

This document describes the semantic CSS class system for risk level styling using Tailwind CSS.

## Semantic Risk Classes

Instead of using multiple Tailwind utility classes, we use semantic classes that encapsulate the complete styling for each risk level:

### Available Classes

- `risk-notset` - Gray styling for unassessed risk
- `risk-low` - Green styling for low risk
- `risk-medium` - Yellow styling for medium risk  
- `risk-high` - Orange styling for high risk
- `risk-critical` - Red styling for critical risk

### Class Definitions

```css
.risk-notset {
  @apply bg-gray-50 text-gray-700 border-gray-200;
}

.risk-low {
  @apply bg-green-50 text-green-700 border-green-200;
}

.risk-medium {
  @apply bg-yellow-50 text-yellow-700 border-yellow-200;
}

.risk-high {
  @apply bg-orange-50 text-orange-700 border-orange-200;
}

.risk-critical {
  @apply bg-red-50 text-red-700 border-red-200;
}
```

## Usage

### In Components

```jsx
// Using RiskChip component
<RiskChip risk="high" size="sm" />

// Direct class usage
<span className="risk-high px-2 py-1 rounded-md border">
  High Risk
</span>
```

### In Database

The `risks` table stores the semantic class names:

```sql
INSERT INTO risks (level, label, description, color_class, sort_order) VALUES 
('low', 'Low', 'Minimal risk...', 'risk-low', 2);
```

## Benefits

### 🎨 **Consistent Styling**
- All risk levels use the same color scheme pattern
- Predictable visual hierarchy (gray → green → yellow → orange → red)
- Easy to maintain and update

### 🔧 **Developer Experience**
- Semantic class names are self-documenting
- Less verbose than utility classes
- Autocomplete friendly in IDEs

### 📊 **Scalable System**
- Easy to add new risk levels
- Database-driven color configuration
- Consistent across all components

### 🚀 **Performance**
- Classes are included in Tailwind's safelist
- No runtime style calculations
- Optimized CSS bundle size

## File Locations

- **Tailwind Config**: `tailwind.config.js` - Class definitions
- **Component**: `src/components/BaseComponents/RiskChip.jsx` - Usage example
- **Database**: `supabase/migrations/006_simple_risks_table.sql` - Class storage
- **Documentation**: This file

## Future Enhancements

- [ ] Add hover states for interactive risk elements
- [ ] Support for dark mode variants
- [ ] Animation classes for risk level changes
- [ ] Custom risk level colors per project/tenant

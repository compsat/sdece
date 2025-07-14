
export const FILTER_RULES = {
  'buklod-tao': {
    residency_status: {
      label: "residency_status",
      type: 'string',
      enum: ['May-Ari', 'Umuupa'],
    },
    is_hoa_noa: {
      label: "is_hoa_noa",
      type: 'string',
      enum: ['HOA', 'NOA', 'N/A'],
    },
		household_material: {
      label: "household_material",
			type: 'string',
			enum: [
				'Concrete',
				'Semi-Concrete',
				'Light materials',
				'Makeshift',
        'Natural',
      ],
    },
    landslide_risk: { 
      label: 'landslide_risk', 
      type: 'string', 
      enum: [
        "HIGH RISK", 
        "MEDIUM RISK", 
        "LOW RISK",
      ], 
    },
    earthquake_risk: { 
      label: 'earthquake_risk', 
      type: 'string', 
      enum: [
        "HIGH RISK", 
        "MEDIUM RISK", 
        "LOW RISK",
      ], 
    },
    fire_risk: { 
      label: 'fire_risk', 
      type: 'string', 
      enum: [
        "HIGH RISK", 
        "MEDIUM RISK", 
        "LOW RISK",
      ], 
    },
    flood_risk: { 
      label: 'flood_risk', 
      type: 'string', 
      enum: [
        "HIGH RISK", 
        "MEDIUM RISK", 
        "LOW RISK",
      ], 
    },
    storm_risk: { 
      label: 'storm_risk', 
      type: 'string', 
      enum: [
        "HIGH RISK", 
        "MEDIUM RISK", 
        "LOW RISK",
      ], 
    },
  }
}

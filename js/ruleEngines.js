
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
  },
  'sdece': {
    partner_name: { label: "partner_name", type: 'string', required: true, maxLength: 255 },
		activity_name: { label: 'activity_name', type: 'string', required: true },
		activity_nature: { label: 'activity_nature', type: 'string', required: true, maxLength: 255 },
		ADMU_office: { label: 'ADMU_office', type: 'string', required: true, maxLength: 127 },
  }
}

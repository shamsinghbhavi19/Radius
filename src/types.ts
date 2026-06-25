export interface Creator {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  locality: string;
  lat: number;
  lng: number;
  audienceInLocality: number; // e.g. 87 for 87% audience in locality
  niche: string; // e.g. "Food & Lifestyle", "Tech & Gaming", "Fashion"
  matchScore: number; // e.g. 94
  latencyHours: number; // typical response time, e.g. 2
  velocityTier: 'Free' | 'Velocity';
  followers: string;
  pastWork: {
    brand: string;
    type: string;
    imgUrl: string;
  }[];
}

export interface Batch {
  id: string;
  name: 'Batch A' | 'Batch B' | 'Batch C';
  creatorIds: string[];
  status: 'pending' | 'dispatched' | 'completed' | 'cascaded';
  timeLeftSeconds: number; // time left before auto-cascade to next batch
  totalTimeSeconds: number;
}

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  niche: string;
  deliverable: string;
  centerLocality: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  budget: number;
  spotsTotal: number;
  spotsFilled: number;
  durationHours: number;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  escrowStatus: 'none' | 'locked' | 'content_submitted' | 'verifying' | 'released';
  batches: Batch[];
  activeBatchIndex: number;
}

export interface Submission {
  id: string;
  campaignId: string;
  creatorId: string;
  imageUrl: string;
  actualLat: number;
  actualLng: number;
  exifLat?: number;
  exifLng?: number;
  exifDevice?: string;
  exifDateTime?: string;
  isExifValid: boolean;
  isGeoMatched: boolean;
  geoMatchPercentage: number;
  engagementScore: number;
  verifiedAt?: string;
}

export interface EscrowLog {
  timestamp: string;
  status: 'locked' | 'submitted' | 'verifying' | 'released';
  amount: number;
  txHash: string;
}

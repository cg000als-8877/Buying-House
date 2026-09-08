export type ProductionStageStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

export type ProductionUpdateStatus = 'draft' | 'submitted' | 'published' | 'rejected';

export interface ProductionStage {
  id: string;
  stageId?: string; // Compatibility alias
  orderId: string;
  stageKey: string;
  stageName: string;
  name?: string; // Compatibility alias
  sequence: number;
  enabled: boolean;
  plannedQuantity: number;
  completedQuantity: number;
  targetStartDate?: string;
  targetEndDate?: string;
  targetDate?: string; // Compatibility alias
  actualCompletionDate?: string;
  status: ProductionStageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionPhoto {
  id: string;
  orderId: string;
  productionUpdateId: string;
  storagePath: string;
  thumbnailPath?: string;
  url?: string;
  caption?: string;
  date?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ProductionUpdate {
  id: string;
  orderId: string;
  buyerOrganizationId: string;
  productionStageId: string;
  stageId?: string; // Compatibility alias
  stageKey: string;
  stageName: string;
  productionDate: string;
  date?: string; // Compatibility alias
  plannedQuantity: number;
  actualQuantity: number;
  cumulativeQuantity: number;
  achievementPercent: number;
  achievementPercentage?: number; // Compatibility alias
  remarks?: string;
  issues?: string;
  correctiveAction?: string;
  status: ProductionUpdateStatus;
  publishedAt?: string;
  publishedBy?: string;
  createdBy: string;
  updatedBy?: string;
  photos?: ProductionPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface StageSummary {
  stageId: string;
  stageKey: string;
  stageName: string;
  sequence: number;
  enabled: boolean;
  plannedQuantity: number;
  actualQuantity: number;
  cumulativeQuantity: number;
  achievementPercent: number;
  variance: number;
  variancePercent: number;
  varianceStatus: 'Ahead' | 'On Target' | 'Behind';
  status: ProductionStageStatus;
  lastUpdateDate?: string;
  targetStartDate?: string;
  targetEndDate?: string;
}

export type ProductionHealthStatus = 'Not Started' | 'In Progress' | 'On Track' | 'At Risk' | 'Delayed' | 'Completed';

export interface ProductionSummary {
  orderId: string;
  orderQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  completionPercentage: number;
  currentStageKey: string;
  currentStageName: string;
  status: ProductionHealthStatus;
  daysRemaining?: number;
  lastUpdateDate?: string;
  stages: StageSummary[];
}

export interface DailyProductionStats {
  date: string;
  stageName: string;
  planned: number;
  actual: number;
  cumulative: number;
  achievementPercent: number;
}

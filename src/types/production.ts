export interface ProductionStage {
  stageId: string;
  orderId: string;
  name: string;
  sequence: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  plannedQuantity: number;
  completedQuantity: number;
  targetDate: string;
  actualCompletionDate?: string;
}

export interface ProductionUpdate {
  id: string;
  orderId: string;
  date: string;
  stageId: string;
  plannedQuantity: number;
  actualQuantity: number;
  cumulativeQuantity: number;
  achievementPercentage: number;
  status: 'draft' | 'published';
  remarks?: string;
  issues?: string;
  correctiveAction?: string;
  updatedBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionPhoto {
  id: string;
  orderId: string;
  productionUpdateId: string;
  storagePath: string;
  thumbnailPath?: string;
  caption?: string;
  date: string;
  uploadedBy: string;
  createdAt: string;
}

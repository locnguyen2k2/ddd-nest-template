export const QUEUE_MANAGER_PORT = 'QUEUE_MANAGER_PORT';

export interface QueueStats {
  name: string;
  running: number;
  completed: number;
  success: number;
  failed: number;
  processing: number;
  total: number;
}

export interface QueueMetadata {
  name: string;
  durable: boolean;
  autoDelete: boolean;
  arguments: any;
}

export interface IQueueManager {
  getQueueStats(queueName: string): Promise<QueueStats>;
  getAllQueuesStats(): Promise<QueueStats[]>;
  getQueueMetadata(queueName: string): Promise<QueueMetadata>;
  pauseQueue(queueName: string): Promise<void>;
  resumeQueue(queueName: string): Promise<void>;
  cancelQueue(queueName: string): Promise<void>;
}

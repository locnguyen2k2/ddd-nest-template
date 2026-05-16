export const NOTIFICATION_PUBLISHER_PORT = 'NOTIFICATION_PUBLISHER_PORT';

export interface INotificationPublisher {
  publish(routing: string, message: any): Promise<void>;
  consume(queue: string, handler: (message: any) => Promise<void>): Promise<void>;
}

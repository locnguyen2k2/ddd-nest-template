export const MESSAGE_BROKER = 'MESSAGE_BROKER';

export interface IMessageBroker {
  publish(queue: string, message: any): Promise<void>;
  subscribe(queue: string, callback: (message: any) => Promise<void>): Promise<void>;
}

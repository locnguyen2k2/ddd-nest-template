export const JSON_LOGIC_ENGINE = 'JSON_LOGIC_ENGINE';

export interface JsonLogicEnginePort {
  evaluate(rule: any, context: any): boolean;
}
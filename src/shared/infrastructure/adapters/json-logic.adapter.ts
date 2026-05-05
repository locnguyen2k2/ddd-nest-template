import { Injectable } from "@nestjs/common";
import * as jsonLogic from 'json-logic-js';
import { JsonLogicEnginePort } from "../../application/ports/json-log-engine.port";

@Injectable()
export class JsonLogicEngineAdapter implements JsonLogicEnginePort {
    evaluate(condition: any, context: any): boolean {
        try {
            const result = jsonLogic.apply(condition, context);
            console.dir(context, { depth: null });
            console.dir(condition, { depth: null });
            // console.log(result, "result")
            return result;
        } catch (error) {
            console.error('JSON Logic evaluation failed:', error);
            return false;
        }
    }
}

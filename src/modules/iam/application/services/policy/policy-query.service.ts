import { IAccessRequest, IPolicyRepository, POLICY_REPO } from "@/modules/iam/domain/repositories/policy.repository";
import { PrismaPolicyRepository } from "@/modules/iam/infrastructure/persistence/repositories/policy.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PolicyQueryService {
    constructor(
        private readonly policyRepo: PrismaPolicyRepository,
    ) { }

    async decide(request: IAccessRequest): Promise<boolean> {
        return this.policyRepo.decide(request);
    }
}

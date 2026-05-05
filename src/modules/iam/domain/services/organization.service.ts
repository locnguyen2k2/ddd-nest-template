import { OrganizationRepository } from "../../infrastructure/persistence/repositories/organization.repository";

export class OrgSerevice {
    constructor(
        private readonly orgRepo: OrganizationRepository,
    ) {
    }
}

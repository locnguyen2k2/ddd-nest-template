import { HeaderKeys, KEYS } from "@/common/constant";
import { CanActivate, ExecutionContext, Head, Header, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IOrganizationRepository, ORGANIZATION_REPO } from "../../domain/repositories/organization.repository";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";
import { Organization } from "../../domain/entities/organization.entity";

@Injectable()
export class HeadersAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(ORGANIZATION_REPO) private readonly orgRepo: IOrganizationRepository
    ) { }

    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();

        // Get required headers
        const requiredHeaders = this.reflector.getAllAndOverride<
            string | string[]
        >(KEYS.HEADERS, [context.getHandler(), context.getClass()]);
        let requiredHeadersList: string[] = [];
        if (requiredHeaders) {
            requiredHeadersList = Array.isArray(requiredHeaders)
                ? requiredHeaders
                : [requiredHeaders];
        }

        if (requiredHeadersList.length > 0) {
            const mappedKeys: Map<string, string> = new Map();
            for (const header of requiredHeadersList) {
                if (!request.headers[header]) {
                    throw new BusinessException(`400|${header} header is required`);
                }
                mappedKeys.set(header, request.headers[header]);
            }

            if (mappedKeys.has(HeaderKeys.ORG_ID)) {
                if (!mappedKeys.get(HeaderKeys.ORG_ID)) {
                    throw new BusinessException(`400|${HeaderKeys.ORG_ID} header is required`);
                }

                const orgID = mappedKeys.get(HeaderKeys.ORG_ID)!;
                let org: Organization | null;
                try {
                    org = await this.orgRepo.findById(orgID);
                } catch (e: any) {
                    return false;
                }
                if (!org) {
                    throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization not found');
                }
            } else {
                throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, 'Organization ID is required');
            }
        } else {
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, 'Header key is required');
        }

        return true;
    }
}

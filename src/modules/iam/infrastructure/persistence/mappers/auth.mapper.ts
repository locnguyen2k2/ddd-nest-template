import { UserEntity } from "@/modules/iam/domain/entities/user.entity";
import { AuthResponseDto, TokenResponseDto, UserResponseDto } from "@/modules/iam/presentation/dtos/res/user-response.dto";
import { Role, Organization } from "@internal/rbac/client"
import { UserMapper } from "./user.mapper";

export interface ITokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export class AuthMapper {
    static toResponseDto(tokenResponse: ITokenResponse, user: UserEntity, orgs: Organization[], roles: Role[]) {
        const userResponse = UserMapper.toResponseDto(user, orgs, roles);
        return new AuthResponseDto(
            userResponse,
            new TokenResponseDto(
                tokenResponse.access_token,
                tokenResponse.refresh_token,
                tokenResponse.expires_in,
                tokenResponse.token_type,
            ),
        );
    }
}

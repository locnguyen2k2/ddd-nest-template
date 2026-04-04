import { UserEntity } from "@/modules/iam/domain/entities/user.entity";
import { AuthResponseDto, TokenResponseDto, UserResponseDto } from "@/modules/iam/presentation/dtos/res/user-response.dto";

export class AuthMapper {
    static toResponseDto(expiresIn: number, refreshToken: string, accessToken: string, user: UserEntity) {
        return new AuthResponseDto(
            new UserResponseDto(
                user.id.value,
                user.email,
                user.username,
                user.first_name,
                user.last_name,
                user.status,
                user.created_at,
                user.updated_at,
                user.org_roles,
            ),
            new TokenResponseDto(
                accessToken,
                refreshToken,
                expiresIn,
                'Bearer',
            ),
        );
    }
}

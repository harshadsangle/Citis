export declare class CreateUserDto {
    tenantId?: string;
    email?: string;
    mobile?: string;
    firstName: string;
    lastName?: string;
    password?: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    status?: string;
}
export declare class AssignRoleDto {
    roleId: string;
    institutionId?: string;
    campusId?: string;
}

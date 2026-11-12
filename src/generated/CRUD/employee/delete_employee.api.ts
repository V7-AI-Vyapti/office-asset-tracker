import {
    Controller,
    Injectable,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Employee } from '@entities/employee.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const EmployeeIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class EmployeeIdParamsDto extends createZodDto(EmployeeIdParamsSchema) {}

@Injectable()
export class DeleteEmployeeService {
    async remove(id: number) {
        const record = await Employee.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('employee not found');
        }
        await Employee.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteEmployeeController {
    constructor(private readonly service: DeleteEmployeeService) {}

    @RequirePermission('employee', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/employee/:id',
        tags: ['employee'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'employee deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'employee not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteEmployee(
        @Param() params: EmployeeIdParamsDto,
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const data = await this.service.remove(params.id);
        return apiSuccess(data, {
            message: 'employee deleted',
        });
    }
}

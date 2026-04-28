import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";




export const RequestHeader = createParamDecorator(
    async(targetDTO: any, ctx: ExecutionContext) => {
        const headers = ctx.switchToHttp().getRequest().headers;
        const dto = plainToInstance(targetDTO, headers, {
            excludeExtraneousValues: true
        })

        await validateOrReject(dto);

        return dto;
    }
)
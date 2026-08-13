import { BadRequestException, type ArgumentMetadata, type PipeTransform } from '@nestjs/common'
import { z } from 'zod'

/** HTTP 输入在进入 Controller 前直接由共享 Zod Schema 校验和转换。 */
export class ZodValidationPipe<TSchema extends z.ZodType> implements PipeTransform<
  unknown,
  z.output<TSchema>
> {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): z.output<TSchema> {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException('Invalid request')
    }
    return result.data
  }
}

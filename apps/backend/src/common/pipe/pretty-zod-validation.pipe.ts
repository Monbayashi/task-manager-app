import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError, flattenError } from 'zod';

type ZodValidationPipe = ReturnType<typeof createZodValidationPipe>;

/** ZodErrorのメッセージをわかりやすい形に成形 */
export const PrettyZodValidationPipe = createZodValidationPipe({
  createValidationException: (error) => {
    if (error instanceof ZodError) {
      return new BadRequestException({
        statusCode: 400,
        message: '入力値が不正です',
        errors: flattenError(error).fieldErrors,
      });
    } else {
      return new BadRequestException({
        statusCode: 400,
        message: '入力値が不正です',
        errors: { unkown: ['予期せぬエラーが発生しました'] },
      });
    }
  },
}) as ZodValidationPipe;

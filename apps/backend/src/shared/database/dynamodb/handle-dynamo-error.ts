import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { ConflictException, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';

// NOTE: https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/Programming.Errors.html

/** DyanamoDBエラーハンドリング */
export const handleDynamoError = (err: unknown): never => {
  const dynamoError = err as { __type?: string };
  // DynamoDBによるエラーかチェック
  if (!dynamoError.__type || !dynamoError.__type.endsWith('Exception')) {
    throw new InternalServerErrorException('不明なエラーが発生しました');
  }
  // DyanamoDBによるエラー
  if (dynamoError.__type === 'ConditionalCheckFailedException') throw new ConflictException('条件付き書き込みに失敗しました');
  if (dynamoError.__type === 'ProvisionedThroughputExceededException') throw new ServiceUnavailableException('DynamoDB が混雑しています');
  if (dynamoError.__type === 'ResourceNotFoundException') throw new NotFoundException('データが存在しません');
  if (dynamoError.__type === 'ValidationException') throw new InternalServerErrorException('DynamoDB バリデーションエラー');
  if (dynamoError.__type === 'TransactionCanceledException') {
    const reasons = (dynamoError as TransactionCanceledException).CancellationReasons ?? [];
    // ConditionalCheckFailed
    const failedCond = reasons.find((r) => r?.Code === 'ConditionalCheckFailed');
    if (failedCond) throw new ConflictException('条件付き書き込みに失敗しました');
    // ProvisionedThroughputExceeded
    const throughputExceeded = reasons.find((r) => r?.Code === 'ProvisionedThroughputExceeded');
    if (throughputExceeded) throw new ServiceUnavailableException('DynamoDB のスループット制限を超えています');
    // TransactionConflict
    const transactionConflict = reasons.find((r) => r?.Code === 'TransactionConflict');
    if (transactionConflict) throw new ConflictException('トランザクション競合が発生しました');
    // Other
    throw new InternalServerErrorException('トランザクションがキャンセルされました');
  }
  throw new InternalServerErrorException('DynamoDB エラーが発生しました');
};

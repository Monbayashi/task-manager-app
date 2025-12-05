import { Test, TestingModule } from '@nestjs/testing';
import { SnsClientService } from './sns-client.service';
import { TypedConfigService } from '../../common/config/typed-config.service';
import { ThrottledException, InternalErrorException, SNSServiceException } from '@aws-sdk/client-sns';

jest.mock('@aws-sdk/client-sns', () => ({
  ...jest.requireActual('@aws-sdk/client-sns'),
  SNSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

describe('SnsClientService', () => {
  let service: SnsClientService;
  let mockSend: jest.Mock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnsClientService,
        {
          provide: TypedConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_SNS_TOPIC_ARN') return 'aws_sns_topc_arn';
              if (key === 'AWS_REGION') return 'us-east-1';
              if (key === 'AWS_SNS_ENDPOINT') return undefined;
              if (key === 'INVITATION_RETRY_TIMEOUT') return 1;
            }),
          },
        },
      ],
    }).compile();
    service = module.get<SnsClientService>(SnsClientService);
    // ここで本物のモックにすり替える（これが本命）
    mockSend = jest.fn();
    (service as any).client = { send: mockSend };
    (service as any).logger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('成功 Publish', async () => {
    mockSend.mockResolvedValue({ MessageId: '1' });
    const result = await service.publish('Test Subject', 'Test Message', 'test@example.com');
    expect(result).toEqual({ MessageId: '1' });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('成功 Publish: ThrottledException -> InternalErrorException -> success', async () => {
    const throttledError = new ThrottledException({ message: 'SNS のレート制限', $metadata: {} });
    const internalErrorException = new InternalErrorException({ message: 'SNS の内部エラー', $metadata: {} });
    mockSend.mockRejectedValueOnce(throttledError).mockRejectedValueOnce(internalErrorException).mockResolvedValueOnce({ MessageId: '1' });
    const result = await service.publish('Test Subject', 'Test Message', 'test@example.com');
    expect(result).toEqual({ MessageId: '1' });
    expect(mockSend).toHaveBeenCalledTimes(3);
  });

  it('失敗 Publish: status:500 -> status:503 -> status:503', async () => {
    const serviceException500 = new SNSServiceException({
      name: 'AWS側のエラー',
      $fault: 'server',
      message: '一時的なサービス不可 or 内部障害',
      $metadata: { httpStatusCode: 500 },
    });
    const serviceException503 = new SNSServiceException({
      name: 'AWS側のエラー',
      $fault: 'server',
      message: '内部障害',
      $metadata: { httpStatusCode: 503 },
    });
    mockSend.mockRejectedValueOnce(serviceException500).mockRejectedValue(serviceException503);
    await expect(service.publish('Test Subject', 'Test Message', 'test@example.com')).rejects.toThrow(SNSServiceException);
    expect(mockSend).toHaveBeenCalledTimes(3);
  });

  it('失敗 Publish: リトライの対象外', async () => {
    mockSend.mockRejectedValue(new Error('リトライ対象外'));
    await expect(service.publish('Test Subject', 'Test Message', 'test@example.com')).rejects.toThrow(Error('リトライ対象外'));
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

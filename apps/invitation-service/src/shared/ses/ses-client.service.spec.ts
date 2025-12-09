// ses-client.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SesClientService } from './ses-client.service';
import { TypedConfigService } from '../../common/config/typed-config.service';
import { SendEmailCommand } from '@aws-sdk/client-ses';

// モック設定
jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  SendEmailCommand: jest.fn(),
}));

describe('SesClientService', () => {
  let service: SesClientService;
  let mockSesClient: { send: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SesClientService,
        {
          provide: TypedConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SES_FROM_EMAIL') return 'test@example.com';
              if (key === 'AWS_REGION') return 'ap-northeast-1';
              if (key === 'AWS_SES_ENDPOINT') return undefined;
            }),
          },
        },
      ],
    }).compile();
    service = module.get<SesClientService>(SesClientService);
    mockSesClient = (service as any).client;
    // ロガーのモック
    (service as any).logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  it('成功: メール送信', async () => {
    mockSesClient.send.mockResolvedValue({ MessageId: '12345' });
    await service.publish('SUBJECT', 'メッセージ', 'user@example.com');
    expect(mockSesClient.send).toHaveBeenCalledTimes(1);
    expect(mockSesClient.send).toHaveBeenCalledWith(expect.any(SendEmailCommand));
  });

  it('成功: リトライ後に成功 (Throttling → 成功)', async () => {
    const throttlingError = {
      name: 'Throttling',
      $metadata: { httpStatusCode: 400 },
    };
    mockSesClient.send.mockRejectedValueOnce(throttlingError).mockResolvedValueOnce({ MessageId: 'success' });
    await service.publish('SUBJECT', 'メッセージ', 'user@example.com');
    expect(mockSesClient.send).toHaveBeenCalledTimes(2);
  });

  it('失敗: リトライ後も失敗 (500エラー)', async () => {
    const serverError = {
      name: 'InternalFailure',
      $metadata: { httpStatusCode: 500 },
    };
    mockSesClient.send.mockRejectedValue(serverError);
    await expect(service.publish('SUBJECT', 'メッセージ', 'user@example.com')).rejects.toMatchObject(serverError);
    expect(mockSesClient.send).toHaveBeenCalledTimes(3);
  });

  it('失敗: リトライ対象外のエラー', async () => {
    mockSesClient.send.mockRejectedValue(new Error('ネットワークエラー'));
    await expect(service.publish('SUBJECT', 'メッセージ', 'user@example.com')).rejects.toThrow('ネットワークエラー');
    expect(mockSesClient.send).toHaveBeenCalledTimes(1);
  });
});

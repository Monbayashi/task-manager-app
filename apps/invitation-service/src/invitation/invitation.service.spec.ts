import { Test, TestingModule } from '@nestjs/testing';
import { InvitationService } from './invitation.service';
import { SesClientService } from '../shared/ses/ses-client.service';
import { TypedConfigService } from '../common/config/typed-config.service';
import { DynamoDBRecord } from 'aws-lambda';

describe('InvitationService', () => {
  let service: InvitationService;
  let mockSesPublish: jest.Mock;

  beforeAll(async () => {
    mockSesPublish = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: SesClientService,
          useValue: {
            publish: mockSesPublish,
          },
        },
        {
          provide: TypedConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'INVITATION_LINK_ORIGIN') return 'http://localhost:3000';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    (service as any).logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  const validRecord: DynamoDBRecord = {
    eventName: 'INSERT',
    dynamodb: {
      NewImage: {
        PK: { S: 'TEAM#019ae856-d721-736a-bf4c-ea93833ee099' },
        SK: { S: 'INVITE#019aed22-e0dc-731c-aec0-9abb9c39a13d' },
        type: { S: 'invitation' },
        email: { S: 'test@example.com' },
        token: { S: 'a'.repeat(64) },
        team_name: { S: 'チームA' },
      },
    },
  } as any;

  it('成功: 正しいレコード → SES送信成功', async () => {
    mockSesPublish.mockResolvedValueOnce({ MessageId: 'msg-999' });

    await service.sendInvitationMain(validRecord);
    expect(mockSesPublish).toHaveBeenCalledTimes(1);
    expect(mockSesPublish).toHaveBeenCalledWith('【招待】チームへの招待が届いています', expect.stringContaining('チームA'), 'test@example.com');

    const sentMessage = mockSesPublish.mock.calls[0][1];
    expect(sentMessage).toContain('http://localhost:3000/invitation?');
    expect(sentMessage).toContain('teamId=019ae856-d721-736a-bf4c-ea93833ee099');
    expect(sentMessage).toContain('inviteId=019aed22-e0dc-731c-aec0-9abb9c39a13d');
    expect(sentMessage).toContain(`token=${'a'.repeat(64)}`);
    expect(sentMessage).toContain(`teamName=${encodeURIComponent('チームA')}`);
  });

  it('失敗: データフォーマット不正', async () => {
    const invalidRecord = {
      ...validRecord,
      dynamodb: { NewImage: { PK: { S: '' } } },
    } as DynamoDBRecord;
    await expect(service.sendInvitationMain(invalidRecord)).rejects.toThrow('データフォーマット不正');
    expect(mockSesPublish).not.toHaveBeenCalled();
  });

  it('失敗: SES送信失敗', async () => {
    const sesError = new Error('SES送信失敗');
    mockSesPublish.mockRejectedValueOnce(sesError);
    await expect(service.sendInvitationMain(validRecord)).rejects.toThrow(sesError);
    expect(mockSesPublish).toHaveBeenCalledTimes(1);
  });
});

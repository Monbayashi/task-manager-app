import { Test, TestingModule } from '@nestjs/testing';
import { EventUtilsService } from './event-client.service';
import { DynamoDBRecord } from 'aws-lambda';

describe('EventUtilsService', () => {
  let service: EventUtilsService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventUtilsService],
    }).compile();
    service = module.get<EventUtilsService>(EventUtilsService);
  });

  it('return: invitation', () => {
    const record: DynamoDBRecord = {
      eventID: '1',
      eventName: 'INSERT',
      dynamodb: { NewImage: { type: { S: 'invitation' } } },
    };
    expect(service.classifyEventRecord(record)).toBe('invitation');
  });

  it('return: unkown (eventID = null)', () => {
    const record: DynamoDBRecord = {
      eventID: null,
      eventName: 'INSERT',
      dynamodb: { NewImage: { type: { S: 'invitation' } } },
    } as any;

    expect(service.classifyEventRecord(record)).toBe('unkown');
  });

  it('return: unkown (eventName = MODIFY)', () => {
    const record: DynamoDBRecord = {
      eventID: '1',
      eventName: 'MODIFY',
      dynamodb: { NewImage: { type: { S: 'invitation' } } },
    } as any;
    expect(service.classifyEventRecord(record)).toBe('unkown');
  });

  it('return: unkown (type = other)', () => {
    const record: DynamoDBRecord = {
      eventID: '1',
      eventName: 'INSERT',
      dynamodb: { NewImage: { type: { S: 'other' } } },
    } as any;
    expect(service.classifyEventRecord(record)).toBe('unkown');
  });
});

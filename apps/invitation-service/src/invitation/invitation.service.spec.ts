import { InvitationService } from './invitation.service';

// src/example.spec.ts
describe('InvitationService', () => {
  let service: InvitationService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new InvitationService();
  });
  it('works', () => {
    expect(true).toBe(true);
  });
});

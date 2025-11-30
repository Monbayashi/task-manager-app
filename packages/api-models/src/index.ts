import z from 'zod';

// USERS
export * from './users/index.ts';
// TEAMS
export * from './teams/index.ts';
// TAGS
export * from './tags/index.ts';
// TASKS
export * from './tasks/index.ts';
// INVITATION
export * from './invitation/index.ts';
// COUNTER
export * from './summary/index.ts';

// test
export const getHelloResScheme = z.string({ error: 'helloは文字です。' });

// test
export type GetHelloResDto = z.infer<typeof getHelloResScheme>;

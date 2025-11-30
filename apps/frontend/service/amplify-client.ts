'use client';

import { Amplify } from 'aws-amplify';
import { ResourcesConfig } from 'aws-amplify';

const COGNITO_CONFIG: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_POOL_ID as string,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_DOMAIN as string,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:3000/'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code',
          providers: ['Google'],
        },
      },
    },
  },
};

/** Amplifyの初期設定*/
export const initAmplify = (): void => {
  // Amplify を初期化
  Amplify.configure(COGNITO_CONFIG);
};

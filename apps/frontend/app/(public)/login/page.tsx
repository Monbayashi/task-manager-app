'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { InputField } from '@/components/ui/input/input-field';
import { InputPasswordField } from '@/components/ui/input/input-password-field';
import { setCognitoOauthRedirect } from '@/lib/cognito-utils';
import { LoginFormType, loginFormSchema } from '@/lib/schemas/login-form.schema';
import { isAmplifyAuthError } from '@/service/amplify-is-auth-error';
import { useAlertStore } from '@/store/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInInput, signIn, signInWithRedirect } from 'aws-amplify/auth';
import { useForm } from 'react-hook-form';

/** ログインページ */
export default function LoginPage() {
  const router = useRouter();
  const pathParams = useSearchParams();
  const redirect = pathParams.get('redirect');
  console.log(redirect);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
  });
  const addAlert = useAlertStore((state) => state.addAlert);

  const onLogin = async (data: LoginFormType) => {
    try {
      const signInInput: SignInInput = {
        username: data.email,
        password: data.password,
      };
      await signIn(signInInput);
      router.push(redirect || '/choose-team/');
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        if (err.name === 'UserAlreadyAuthenticatedException') {
          addAlert(`既にログイン済みです`, 'error');
          router.push(redirect || '/choose-team/');
        } else {
          addAlert(`ログインに失敗しました\n${err.message}`, 'error');
        }
      } else {
        addAlert('ログインに失敗しました', 'error');
      }
    }
  };

  // Google ログイン処理
  const onGoogleSignIn = async () => {
    try {
      setCognitoOauthRedirect(redirect ?? '/choose-team');
      await signInWithRedirect({ provider: 'Google' });
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        addAlert(`Googleログインに失敗しました\n${err.message}`, 'error');
      } else {
        addAlert(`Googleログインに失敗しました`, 'error');
      }
    }
  };

  return (
    <AppCard title="ログイン">
      <form onSubmit={handleSubmit(onLogin)} className="mx-auto max-w-lg rounded-md border border-gray-400">
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <InputField<LoginFormType>
            label="Email"
            type="email"
            placeholder="you@example.com"
            name="email"
            register={register}
            error={errors.email?.message}
          />
          <InputPasswordField<LoginFormType>
            label="Password"
            placeholder="********"
            name="password"
            register={register}
            error={errors.password?.message}
          />
          <AppCardButton type="submit" disabled={isSubmitting} name="ログインボタン">
            {isSubmitting ? '送信中...' : 'ログイン'}
          </AppCardButton>
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-gray-300"></span>
            <span className="relative bg-white px-4 text-sm text-gray-400">または</span>
          </div>
          <AppCardButton type="button" disabled={isSubmitting} name="Googleログインボタン" onClick={onGoogleSignIn}>
            <GoogleIcon className="h-5 w-5 shrink-0" />
            Googleでログイン
          </AppCardButton>
        </div>
        <div className="flex items-center justify-center rounded-b-md bg-gray-100 p-4">
          <Link href="/signup/" className="text-center text-sm text-indigo-500 transition duration-100 hover:text-indigo-600 active:text-indigo-700">
            初めてのご利用の方
          </Link>
        </div>
      </form>
    </AppCard>
  );
}

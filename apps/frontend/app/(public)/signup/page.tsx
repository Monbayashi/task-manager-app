'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { InputField } from '@/components/ui/input/input-field';
import { InputPasswordField } from '@/components/ui/input/input-password-field';
import { ConfirmSignupFormType, SignupFormType, confirmSignupFormSchema, signupFormSchema } from '@/lib/schemas/signup-form.schema';
import { isAmplifyAuthError } from '@/service/amplify-is-auth-error';
import { useAlertStore } from '@/store/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfirmSignUpInput, SignUpInput, confirmSignUp, resendSignUpCode, signInWithRedirect, signUp } from 'aws-amplify/auth';
import { useForm } from 'react-hook-form';

/** サインアップページ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const addAlert = useAlertStore((state) => state.addAlert);

  const signupForm = useForm<SignupFormType>({
    resolver: zodResolver(signupFormSchema),
  });
  const confirmSignupForm = useForm<ConfirmSignupFormType>({
    resolver: zodResolver(confirmSignupFormSchema),
    defaultValues: { code: '' },
  });
  // 認証コード確認処理用メールアドレス
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  // サインアップ処理
  const onSignup = async (data: SignupFormType) => {
    try {
      const signUpInput: SignUpInput = {
        username: data.email,
        password: data.password,
      };
      await signUp(signUpInput);
      setStep('confirm');
      setConfirmEmail(data.email);
      addAlert(`メールを確認して、認証コードを入力してください`, 'info');
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        // 既に登録済みのユーザかチェック
        if (err.name === 'UsernameExistsException') {
          const isResendSignUpCode = await onResendSignUpCode(data.email);
          if (isResendSignUpCode) {
            setStep('confirm');
            setConfirmEmail(data.email);
            addAlert(`メールを確認して、認証コードを入力してください`, 'info');
          } else {
            addAlert(`サインアップに失敗しました\n${err.message}`, 'error');
          }
        } else {
          addAlert(`サインアップに失敗しました\n${err.message}`, 'error');
        }
      } else {
        addAlert('サインアップに失敗しました', 'error');
      }
    }
  };

  // 認証コード確認処理
  const onConfirmSignup = async (data: ConfirmSignupFormType) => {
    // typeガード
    if (confirmEmail == null) return setStep('signup');
    try {
      const confirmSignUpInput: ConfirmSignUpInput = {
        username: confirmEmail,
        confirmationCode: data.code,
      };
      await confirmSignUp(confirmSignUpInput);
      router.push('/login');
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        if (
          (err.name === 'InvalidParameterException' && err.message.includes('User is already confirmed')) ||
          (err.name === 'NotAuthorizedException' && err.message.includes('Current status is CONFIRMED'))
        ) {
          addAlert(`サインアップに失敗しました\nこのメールアドレスはすでに登録済みです\n ログインしてください`, 'error');
          router.push('/login');
        } else {
          addAlert(`認証に失敗しました\n${err.message}`, 'error');
        }
      } else {
        addAlert('認証に失敗しました', 'error');
      }
    }
  };

  // Googleサインアップ処理
  const onGoogleSignUp = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        addAlert(`サインアップに失敗しました\n${err.message}`, 'error');
      } else {
        addAlert(`サインアップに失敗しました`, 'error');
      }
    }
  };

  // 認証コード再送 (再送できた場合: true, できなかった場合: false)
  const onResendSignUpCode = async (email: string) => {
    try {
      await resendSignUpCode({ username: email });
      return true;
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        addAlert(`認証コードの再送に失敗しました\n${err.message}`, 'error');
        return false;
      } else {
        addAlert(`認証コードの再送に失敗しました`, 'error');
        return false;
      }
    }
  };

  return (
    <AppCard title="サインアップ">
      {step === 'signup' ? (
        <form onSubmit={signupForm.handleSubmit(onSignup)} className="mx-auto max-w-lg rounded-md border border-gray-400">
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <InputField<SignupFormType>
              label="Email"
              type="email"
              placeholder="you@example.com"
              name="email"
              register={signupForm.register}
              error={signupForm.formState.errors.email?.message}
            />
            <InputPasswordField<SignupFormType>
              label="Password"
              placeholder="********"
              name="password"
              register={signupForm.register}
              error={signupForm.formState.errors.password?.message}
            />
            <InputPasswordField<SignupFormType>
              label="Password (確認)"
              placeholder="********"
              name="confirmPassword"
              register={signupForm.register}
              error={signupForm.formState.errors.confirmPassword?.message}
            />
            <AppCardButton type="submit" disabled={signupForm.formState.isSubmitting} name="サインアップボタン">
              {signupForm.formState.isSubmitting ? '送信中...' : '登録'}
            </AppCardButton>
            <div className="relative flex items-center justify-center">
              <span className="absolute inset-x-0 h-px bg-gray-300"></span>
              <span className="relative bg-white px-4 text-sm text-gray-400">または</span>
            </div>
            <AppCardButton type="button" disabled={signupForm.formState.isSubmitting} name="Googleサインアップボタン" onClick={onGoogleSignUp}>
              <GoogleIcon className="h-5 w-5 shrink-0" />
              Googleで登録
            </AppCardButton>
          </div>
          <div className="flex items-center justify-center rounded-b-md bg-gray-100 p-4">
            <Link href="/login" className="text-center text-sm text-indigo-500 transition duration-100 hover:text-indigo-600 active:text-indigo-700">
              すでにアカウントをお持ちの方
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={confirmSignupForm.handleSubmit(onConfirmSignup)} className="mx-auto max-w-lg rounded-md border border-gray-400">
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <InputField<ConfirmSignupFormType>
              label="コード"
              type="text"
              name="code"
              register={confirmSignupForm.register}
              error={confirmSignupForm.formState.errors.code?.message}
              autoComplete="off"
            />
            <AppCardButton type="submit" disabled={confirmSignupForm.formState.isSubmitting} name="コード認証">
              {confirmSignupForm.formState.isSubmitting ? '送信中...' : 'コード認証'}
            </AppCardButton>
          </div>
        </form>
      )}
    </AppCard>
  );
}

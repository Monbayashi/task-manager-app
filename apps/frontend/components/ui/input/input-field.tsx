'use client';

import { Description, Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type InputFieldProps<T extends FieldValues> = {
  label?: string;
  type?: 'text' | 'email';
  placeholder?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: string;
  description?: string;
  disabled?: boolean;
  defaultValue?: string;
  autoComplete?: 'off' | 'on' | 'one-time-code';
};

/** Input - テキスト/メールアドレス */
export const InputField = <T extends FieldValues>({
  label,
  type = 'text',
  placeholder = '',
  register,
  name,
  error,
  description,
  disabled = false,
  defaultValue,
  autoComplete = 'on',
}: InputFieldProps<T>) => {
  return (
    <Field>
      {label && <Label className="inline-block text-sm text-gray-800 sm:text-base">{label}</Label>}
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : description ? (
        <Description className="text-sm text-gray-500">{description}</Description>
      ) : null}
      <Input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={clsx(
          'w-full rounded border bg-gray-50 px-3 py-2 text-base text-gray-800 ring-orange-400 transition duration-100 outline-none',
          'focus:border-orange-400 focus:ring-2 disabled:bg-gray-100',
          error && 'border-red-400'
        )}
        disabled={disabled}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
      />
    </Field>
  );
};

'use client';

import { useState } from 'react';
import { Description, Field, Input, Label } from '@headlessui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type InputPasswordFieldProps<T extends FieldValues> = {
  label?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: string;
  description?: string;
};

/** Input - パスワード */
export const InputPasswordField = <T extends FieldValues>({
  label = 'パスワード',
  placeholder = '',
  register,
  name,
  error,
  description,
}: InputPasswordFieldProps<T>) => {
  const [show, setShow] = useState(false);
  return (
    <Field>
      <Label className="mb-2 inline-block text-sm text-gray-800 sm:text-base">{label}</Label>
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : description ? (
        <Description className="mt-1 text-sm text-gray-500">{description}</Description>
      ) : null}
      <div className="relative mt-1">
        <Input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...register(name)}
          className={clsx(
            'w-full rounded border bg-gray-50 px-3 py-2 text-base text-gray-800 ring-orange-400 transition duration-100 outline-none focus:ring-2',
            error && 'border-red-400'
          )}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeSlashIcon className="size-6" /> : <EyeIcon className="size-6" />}
        </button>
      </div>
    </Field>
  );
};

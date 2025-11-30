'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Description, Field, Label } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

export type SelectBoxProps = {
  /** 選択中Value */
  selectedValue: string;
  /** 変更イベント */
  onChange: (value: string) => void;
  /** Label テキスト */
  label: string;
  /** Description テキスト */
  description?: string | undefined;
  /** エラーメッセージ */
  error?: string;
  /**  */
  disabled?: boolean;
  /** ItemList */
  itemList: {
    /** Item Value */
    value: string;
    /** Item Text */
    text: string;
    /** Item Type */
    type: 'default' | 'link';
  }[];
};

/** セレクトボックス */
export const Selectbox = (props: SelectBoxProps) => {
  const selected = props.itemList.find((value) => value.value === props.selectedValue);
  return (
    <div className="w-full max-w-md">
      <Field>
        <Label className="text-sm/6 font-medium text-gray-700">{props.label}</Label>
        {props.error ? (
          <p className="text-sm text-red-500">{props.error}</p>
        ) : props.description ? (
          <Description className="text-sm/6">{props.description}</Description>
        ) : null}
        <Listbox value={props.selectedValue} onChange={props.onChange} disabled={props.disabled}>
          <ListboxButton
            className={clsx(
              'relative block w-full rounded-lg border bg-gray-50 py-1.5 pr-8 pl-3 text-left text-sm/6 text-gray-800 ring-orange-400',
              'data-focus:border-orange-400 data-focus:ring-2 data-focus:outline-none'
            )}
          >
            {selected?.text || '未選択'}
            <ChevronDownIcon className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-gray-600" aria-hidden="true" />
          </ListboxButton>
          <ListboxOptions
            anchor="bottom"
            transition
            className={clsx(
              'z-popover w-(--button-width) rounded-xl border bg-white p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
              'transition duration-100 ease-in data-leave:data-closed:opacity-0'
            )}
          >
            {props.itemList.map((item) => (
              <ListboxOption
                key={item.value}
                value={item.value}
                className="group flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 ring-orange-400 outline-none select-none hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
              >
                {item.type === 'link' ? (
                  <>
                    <PlusIcon className="size-4 fill-green-800" />
                    <div className="truncate text-sm/6">{item.text}</div>
                  </>
                ) : (
                  <>
                    <CheckIcon className="invisible size-4 fill-gray-800 group-data-selected:visible" />
                    <div className="truncate text-sm/6">{item.text}</div>
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      </Field>
    </div>
  );
};

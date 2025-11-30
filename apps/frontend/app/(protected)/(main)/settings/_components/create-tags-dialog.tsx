'use client';

import { useState } from 'react';
import { useCreateTag } from '@/api/tags/useCreateTag';
import { useTag } from '@/api/tags/useTag';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { Tag } from '@/components/ui/tag';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';

const DEFAULT_NAME = 'タグ例';
const DEFAULT_COLOR = '#364153';
const DEFAULT_BG_COLOR = '#ffffff';

type CreateTagDialogProps = {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
};

/** 新規タグ登録 ダイアログ */
export const CreateTagDialog = ({ teamId, isOpen, onClose }: CreateTagDialogProps) => {
  const createTag = useCreateTag(teamId);
  const { mutate } = useTag(teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  // タグ名称
  const [tagName, setTagName] = useState(DEFAULT_NAME);
  const [tagColor, setTagColor] = useState(DEFAULT_COLOR);
  const [tagBgColor, setTagBgColor] = useState(DEFAULT_BG_COLOR);

  const onConfirm = async () => {
    await createTag.trigger({ tagName, tagColor: { color: tagColor, backgroundColor: tagBgColor } });
    mutate();
    addAlert(`タグを登録しました`, 'success');
    onClose();
    resetState();
  };

  const resetState = () => {
    setTagName(DEFAULT_NAME);
    setTagColor(DEFAULT_COLOR);
    setTagBgColor(DEFAULT_BG_COLOR);
  };

  const onPreClose = () => {
    onClose();
    resetState();
  };

  return (
    <AppDialog isOpen={isOpen} title="新規タグ登録" type="default" onClose={onPreClose}>
      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="tagName" className="block">
            タグ名称
          </label>
          <input id="tagName" className="block w-32 border" type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <div>
            <label htmlFor="tagColor" className="block">
              文字色
            </label>
            <input id="tagColor" className="border" type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} />
          </div>
          <div>
            <label htmlFor="tagBgColor" className="block">
              背景色
            </label>
            <input id="tagBgColor" className="border" type="color" value={tagBgColor} onChange={(e) => setTagBgColor(e.target.value)} />
          </div>
        </div>
        <hr />
        <div className="">
          <span className="block text-center">表示例</span>
          <Tag tagName={tagName} tagColor={{ color: tagColor, backgroundColor: tagBgColor }} />
        </div>
      </div>

      <div className="mt-4 flex w-full justify-end">
        <button
          type="button"
          className={clsx(
            'inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-200 px-3 py-2 text-sm/6 font-semibold text-gray-800 shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
          )}
          onClick={onConfirm}
        >
          タグ新規登録
        </button>
      </div>
    </AppDialog>
  );
};

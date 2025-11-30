'use client';

import { useEffect, useState } from 'react';
import { useTag } from '@/api/tags/useTag';
import { useUpdateTag } from '@/api/tags/useUpdateTag';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { Tag } from '@/components/ui/tag';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';
import { ActionData } from '../page';

type UpdateTagDialogProps = {
  actionData: ActionData;
  isOpen: boolean;
  onClose: () => void;
};

/** タグ更新 ダイアログ */
export const UpdateTagDialog = ({ actionData, isOpen, onClose }: UpdateTagDialogProps) => {
  const updateTag = useUpdateTag(actionData.teamId, actionData.tagId);
  const { mutate } = useTag(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  // タグ名称
  const [tagName, setTagName] = useState(actionData.tagName);
  const [tagColor, setTagColor] = useState(actionData.tagColor.color);
  const [tagBgColor, setTagBgColor] = useState(actionData.tagColor.backgroundColor);

  const onConfirm = async () => {
    await updateTag.trigger({ tagName, tagColor: { color: tagColor, backgroundColor: tagBgColor } });
    mutate();
    addAlert(`タグを更新しました`, 'success');
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  useEffect(() => {
    setTagName(actionData.tagName);
    setTagColor(actionData.tagColor.color);
    setTagBgColor(actionData.tagColor.backgroundColor);
  }, [actionData]);

  return (
    <AppDialog isOpen={isOpen} title="タグの更新" type="default" onClose={onPreClose}>
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
            'inline-flex cursor-pointer items-center gap-2 rounded-md bg-green-200 px-3 py-2 text-sm/6 font-semibold text-gray-800 shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
          )}
          onClick={onConfirm}
        >
          タグ更新
        </button>
      </div>
    </AppDialog>
  );
};

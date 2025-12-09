'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isAmplifyAuthError } from '@/service/amplify-is-auth-error';
import { useAlertStore } from '@/store/alert';
import { useSidebarStore } from '@/store/sidebar';
import { useUserStore } from '@/store/user';
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowLeftStartOnRectangleIcon, ClipboardDocumentIcon, Cog6ToothIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { signOut } from 'aws-amplify/auth';
import clsx from 'clsx';
import { mutate } from 'swr';
import { SelectBoxProps, Selectbox } from '../ui/selectbox';

const NAV_ITEM = [
  { href: '/home/', icon: <HomeIcon className="size-5" />, title: 'ホーム' },
  { href: '/tasks/', icon: <ClipboardDocumentIcon className="size-5" />, title: 'タスク管理' },
  { href: '/settings/', icon: <Cog6ToothIcon className="size-5" />, title: 'チーム設定' },
];

/**
 * サイドバー
 */
export const SideBar = () => {
  const pathName = usePathname();
  const pathParams = useSearchParams();
  const router = useRouter();
  const onMenuClose = useSidebarStore((state) => state.toggle);
  const isMenuOpen = useSidebarStore((state) => state.isOpen);
  const addAlert = useAlertStore((state) => state.addAlert);
  const userData = useUserStore((s) => s.user);
  const userLogout = useUserStore((s) => s.logout);
  const teamId = pathParams.get('teamId');
  const selectedId = `${pathName}?teamId=${pathParams.get('teamId')}`;

  /** ログアウト処理 */
  const onLogout = async () => {
    try {
      router.push('/login/');
      await signOut();
      userLogout();
      mutate(() => true, undefined, { revalidate: true });
      addAlert(`ログアウトに成功しました`, 'success', 5000);
    } catch (err) {
      if (isAmplifyAuthError(err)) {
        addAlert(`ログアウトに失敗しました\n${err.message}`, 'error');
      } else {
        addAlert(`ログアウトに失敗しました`, 'error');
      }
    }
  };

  /** ユーザ設定画面に遷移 */
  const onUserSetting = async () => {
    router.push('/user/settings/');
  };

  /** チーム変更処理 */
  const onChangeTeam = (url: string) => {
    router.push(url);
  };

  /** 使用データ作成 */
  const userName = userData?.user.name || 'ユーザ名称';
  const teamItems: SelectBoxProps['itemList'] = [
    ...(userData?.teams.map((team) => ({ value: `${pathName}?teamId=${team.teamId}`, text: team.name, type: 'default' as const })) || []),
    { value: '/new-team', text: 'チーム作成', type: 'link' },
  ];

  return (
    <>
      {/* スマホ時のみ Dialog（モーダル） */}
      {isMenuOpen && (
        <Dialog open={isMenuOpen} onClose={onMenuClose} className="z-modal relative lg:hidden">
          <div className="z-modal-backdrop fixed inset-0 bg-black/30" aria-hidden="true" />
          <DialogPanel
            transition
            className="z-modal fixed inset-y-0 left-0 flex h-screen w-64 flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex justify-end px-4 pt-3">
              <button onClick={onMenuClose} className="rounded-md p-2 hover:bg-gray-100 focus:ring-2 focus:ring-orange-400 focus:outline-none">
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <SidebarContent
              pathName={pathName}
              teamId={teamId}
              selectedId={selectedId}
              teamItems={teamItems}
              onChangeTeam={onChangeTeam}
              userName={userName}
              onMenuClose={onMenuClose}
              onUserSetting={onUserSetting}
              onLogout={onLogout}
            />
          </DialogPanel>
        </Dialog>
      )}
      {/* PC時のサイドメニュー */}
      <aside className="fixed hidden h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <SidebarContent
          pathName={pathName}
          teamId={teamId}
          selectedId={selectedId}
          teamItems={teamItems}
          onChangeTeam={onChangeTeam}
          userName={userName}
          onMenuClose={onMenuClose}
          onUserSetting={onUserSetting}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
};

// メニューの中身を共通化
const SidebarContent = ({
  pathName,
  teamId,
  selectedId,
  teamItems,
  onChangeTeam,
  userName,
  onMenuClose,
  onUserSetting,
  onLogout,
}: {
  pathName: string;
  teamId: string | null;
  selectedId: string;
  teamItems: SelectBoxProps['itemList'];
  onChangeTeam: (url: string) => void;
  userName: string;
  onMenuClose: () => void;
  onUserSetting: () => void;
  onLogout: () => void;
}) => (
  <div className="flex flex-1 flex-col px-4 pb-8">
    <h1 className="py-8 text-center text-lg font-bold">タスク管理 App</h1>
    <div className="mt-6 px-2">
      <Selectbox selectedValue={selectedId} onChange={onChangeTeam} label="チーム選択" itemList={teamItems} />
    </div>
    <hr className="my-6 border-gray-500" />
    <nav className="mt-6 space-y-1">
      {NAV_ITEM.map((item) => {
        const isSelectedNav = pathName === item.href;
        return (
          <Link
            key={item.href}
            href={`${item.href}?teamId=${teamId}`}
            onClick={onMenuClose}
            className={clsx(
              'flex items-center rounded-md px-4 py-3 text-lg font-medium transition-colors',
              'ring-orange-400 outline-none hover:underline focus:ring-2',
              isSelectedNav ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            {item.icon}
            <span className="ml-4">{item.title}</span>
          </Link>
        );
      })}
    </nav>
    <div className="mt-auto pt-8">
      <hr className="mb-4 border-gray-300" />
      <Menu>
        <MenuButton
          className={clsx(
            'flex w-full items-center rounded-md px-4 py-3 text-left transition-colors hover:bg-gray-100',
            'ring-orange-400 outline-none hover:underline focus:ring-2'
          )}
        >
          <UserIcon className="mr-5 size-5 text-gray-700" />
          <span className="text-lg font-medium text-gray-700">{userName}</span>
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom"
          className="z-popover origin-top-right rounded-xl border border-gray-400 bg-white py-3 pr-3 pl-1.5 text-base text-gray-800 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <MenuItem>
            <button
              type="button"
              className="group flex w-full items-center gap-2 rounded-lg px-5 py-2 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
              onClick={onUserSetting}
            >
              <Cog6ToothIcon className="mr-1 size-5" />
              <span>ユーザ設定</span>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              type="button"
              className="group flex w-full items-center gap-2 rounded-lg px-5 py-2 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
              onClick={onLogout}
            >
              <ArrowLeftStartOnRectangleIcon className="mr-1 size-5" />
              <span>ログアウト</span>
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  </div>
);

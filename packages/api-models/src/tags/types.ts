import { z } from 'zod';
import { ReqBodyTagsRegisterSchema, ReqBodyTagsUpdateSchema } from './schema.ts';

/**
 * [Response-Body-Type] タグ一覧取得
 */
export type ResBodyTagsType = {
  tags: {
    teamId: string;
    tagId: string;
    tagName: string;
    tagColor: { color: string; backgroundColor: string };
    createdAt: string;
  }[];
};

/**
 * [Request-Body-Type] タグ作成
 */
export type ReqBodyTagsRegisterType = z.infer<typeof ReqBodyTagsRegisterSchema>;

/**
 * [Response-Body-Type] タグ作成
 */
export type ResBodyTagsRegisterType = {
  teamId: string;
  tagId: string;
  tagName: string;
  tagColor: { color: string; backgroundColor: string };
  createdAt: string;
};

/**
 * [Request-Body-Type] タグ更新
 */
export type ReqBodyTagsUpdateType = z.infer<typeof ReqBodyTagsUpdateSchema>;

/**
 * [Response-Body-Type] タグ更新
 */
export type ResBodyTagsUpdateType = {
  teamId: string;
  tagId: string;
  tagName: string;
  tagColor: { color: string; backgroundColor: string };
  createdAt: string;
};

/**
 * [Response-Body-Type] タグ削除
 */
export type ResBodyTagsDeleteType = {
  teamId: string;
  tagId: string;
};

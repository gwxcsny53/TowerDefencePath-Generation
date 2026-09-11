import type { ValidationCode } from '@/core/validation';

export interface ValidationPresentation {
  readonly title: string;
  readonly description: string;
}

export const VALIDATION_PRESENTATION: Readonly<Record<ValidationCode, ValidationPresentation>> = {
  GRID_OUT_OF_RANGE: {
    title: '坐标超出网格范围',
    description: '该地图元素位于当前网格之外。',
  },
  PATH_ISOLATED: {
    title: '存在孤立路线格',
    description: '该路线格没有与其它路线连接。',
  },
  PATH_DISCONNECTED_COMPONENT: {
    title: '存在未接入有效路线的区域',
    description: '该路线区域缺少有效的出生点或终点。',
  },
  SPAWN_NOT_ENDPOINT: {
    title: '出生点位置无效',
    description: '出生点必须位于路线端点。',
  },
  END_NOT_ENDPOINT: {
    title: '终点位置无效',
    description: '终点必须位于路线端点。',
  },
  TOWER_PATH_CONFLICT: {
    title: '塔位与路线冲突',
    description: '塔位不能与路线位于同一网格。',
  },
  JUNCTION_NOT_CONFIGURED: {
    title: '路口尚未配置',
    description: '该路线交叉点需要配置允许进入方向和离开方向。',
  },
  JUNCTION_POSITION_INVALID: {
    title: '路口配置位置已失效',
    description: '当前位置已经不是有效的路口候选。',
  },
  JUNCTION_DUPLICATE_CONFIG: {
    title: '存在重复路口配置',
    description: '同一网格位置只能存在一个路口配置。',
  },
  JUNCTION_DIRECTION_INVALID: {
    title: '路口方向配置无效',
    description: '请检查进入方向、离开方向以及方向角色冲突。',
  },
  JUNCTION_WEIGHT_INVALID: {
    title: '路口权重配置无效',
    description: '每个入口的离开方向权重必须有效且总和为 1。',
  },
  JUNCTION_ENTRY_NOT_CONFIGURED: {
    title: '存在未配置的实际入口',
    description: '怪物可能从该方向进入路口，但没有对应移动规则。',
  },
  SPAWN_CANNOT_REACH_END: {
    title: '出生点无法到达终点',
    description: '从该出生点出发没有有效路线可以到达终点。',
  },
  ROUTE_DEAD_END: {
    title: '路线存在死路',
    description: '怪物可能到达一个不是终点的路线端点。',
  },
  ROUTE_CYCLE: {
    title: '路线存在循环',
    description: '怪物存在沿移动规则重复经过同一有向状态的可能。',
  },
};

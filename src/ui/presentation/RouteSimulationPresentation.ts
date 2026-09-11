import type { RouteSimulationStatus } from '@/core/simulation';

export interface RouteSimulationPresentation {
  readonly title: string;
  readonly description: string;
}

export const ROUTE_SIMULATION_PRESENTATION: Readonly<
  Record<RouteSimulationStatus, RouteSimulationPresentation>
> = {
  'reached-end': { title: '已到达终点', description: '路线已成功到达终点。' },
  'dead-end': { title: '路线进入死路', description: '路线在非终点位置停止。' },
  'junction-not-configured': {
    title: '路口移动规则缺失',
    description: '当前路口没有适用的移动规则。',
  },
  cycle: { title: '路线进入循环', description: '路线重复经过相同的移动状态。' },
  'step-limit': { title: '超过最大模拟步数', description: '路线未能在允许步数内结束。' },
  'invalid-spawn': { title: '出生点无效', description: '无法从当前出生点开始模拟。' },
};

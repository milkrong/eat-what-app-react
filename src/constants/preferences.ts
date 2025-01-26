import { DietType } from '../types/recommendation';

export const DIET_TYPE_OPTIONS: DietType[] = [
  '正常',
  '纯素食',
  '生酮',
  '低碳水',
  '低脂',
  '低糖',
  '高蛋白',
  '高纤维',
  '高钙',
  '高钾',
  '高维生素',
  '低蛋白',
  '低钠',
  '低嘌呤',
  '低胆固醇',
  '低盐',
];

export const CUISINE_TYPE_OPTIONS = [
  '粤菜',
  '川菜',
  '湘菜',
  '鲁菜',
  '苏菜',
  '浙菜',
  '闽菜',
  '徽菜',
  '西餐',
  '日料',
  '韩餐',
  '东南亚',
];

export const ALLERGY_OPTIONS = ['花生', '海鲜', '蛋类', '乳制品', '坚果'];

export const DEFAULT_PREFERENCES = {
  calories_min: 1500,
  calories_max: 2500,
  max_cooking_time: 45,
};

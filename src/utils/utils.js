import { GRADES,PartyGrade, ProgressType } from "../constant/user";

export function formatTimeToChinese(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hour}时${minute}分`;
}

export const getGradeLabel = (value) => {
  const item = GRADES.find(g => g.value === value);
  return item ? item.label : null;
};

export const getProgressTypeName = (value) => {
  const item = ProgressType.find(g => g.name === value);
  return item ? item.name : null;
};

export const getPartyGradeLabel = (value) => {
  const item = PartyGrade.find(p => p.value === value);
  return item ? item.grade : null;
};

export const sanitizeFileName = (name, ext = 'pdf') => {
  // 提取文件名和扩展名
  const parts = name.split('.');
  const extension = parts.length > 1 ? parts.pop().toLowerCase() : ext;
  const rawBaseName = parts.join('.');

  // 只保留中英文+数字
  const cleanBaseName = rawBaseName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

  const truncatedName = cleanBaseName.slice(0, 10) || 'file';

  return `${truncatedName}.${extension}`;
};

// 邮箱是否合规
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email.trim());
};

/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

export const createShortName = name => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .slice(0, 3)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

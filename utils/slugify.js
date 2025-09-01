export const slugify = (text) => {
  if (!text) return ''; // return empty string if undefined/null
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

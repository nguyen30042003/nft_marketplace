// utils/storage.ts

export const setLocalStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      // Kiểm tra nếu đang chạy trên trình duyệt
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  
  export const getLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  };
  
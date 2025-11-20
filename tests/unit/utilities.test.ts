import { describe, it, expect } from '@jest/globals';

describe('Utility Functions', () => {
  describe('Date Utilities', () => {
    const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day);
    };

    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const diffInDays = (date1: Date, date2: Date): number => {
      const diff = date2.getTime() - date1.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should add days to date', () => {
      const date = new Date('2024-01-15');
      const newDate = addDays(date, 5);
      expect(formatDate(newDate)).toBe('2024-01-20');
    });

    it('should calculate difference in days', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-20');
      expect(diffInDays(date1, date2)).toBe(5);
    });

    it('should handle negative day difference', () => {
      const date1 = new Date('2024-01-20');
      const date2 = new Date('2024-01-15');
      expect(diffInDays(date1, date2)).toBe(-5);
    });
  });

  describe('String Utilities', () => {
    const truncate = (str: string, maxLength: number): string => {
      if (str.length <= maxLength) return str;
      return str.substring(0, maxLength - 3) + '...';
    };

    const capitalize = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const slugify = (str: string): string => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    it('should truncate long strings', () => {
      const str = 'This is a very long string that needs truncation';
      expect(truncate(str, 20)).toBe('This is a very lo...');
    });

    it('should not truncate short strings', () => {
      const str = 'Short';
      expect(truncate(str, 20)).toBe('Short');
    });

    it('should capitalize string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should slugify string', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello  World')).toBe('hello-world');
      expect(slugify('Hello-World!')).toBe('hello-world');
    });
  });

  describe('Number Utilities', () => {
    const formatCurrency = (amount: number, currency: string = 'USD'): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    };

    const roundToDecimals = (num: number, decimals: number): number => {
      return Number(num.toFixed(decimals));
    };

    const clamp = (num: number, min: number, max: number): number => {
      return Math.min(Math.max(num, min), max);
    };

    it('should format currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
    });

    it('should round to decimals', () => {
      expect(roundToDecimals(1.2345, 2)).toBe(1.23);
      expect(roundToDecimals(1.2355, 2)).toBe(1.24);
    });

    it('should clamp number within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('Array Utilities', () => {
    const chunk = <T>(array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    const unique = <T>(array: T[]): T[] => {
      return Array.from(new Set(array));
    };

    const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
      return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      }, {} as Record<string, T[]>);
    };

    it('should chunk array', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      expect(chunk(arr, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should get unique values', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4];
      expect(unique(arr)).toEqual([1, 2, 3, 4]);
    });

    it('should group by key', () => {
      const arr = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' },
      ];
      
      const grouped = groupBy(arr, 'type');
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });
  });

  describe('Validation Utilities', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const isValidURL = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const isValidWalletAddress = (address: string): boolean => {
      // Basic validation for crypto wallet addresses
      return /^[a-zA-Z0-9]{26,}$/.test(address);
    };

    it('should validate email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should validate URL', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('not-a-url')).toBe(false);
    });

    it('should validate wallet address', () => {
      expect(isValidWalletAddress('TXYZabcdefghijklmnopqrstuvwxyz123456')).toBe(true);
      expect(isValidWalletAddress('short')).toBe(false);
      expect(isValidWalletAddress('invalid@address')).toBe(false);
    });
  });

  describe('Object Utilities', () => {
    const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>;
      keys.forEach(key => {
        if (key in obj) {
          result[key] = obj[key];
        }
      });
      return result;
    };

    const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
      const result = { ...obj };
      keys.forEach(key => {
        delete result[key];
      });
      return result;
    };

    const deepClone = <T>(obj: T): T => {
      return JSON.parse(JSON.stringify(obj));
    };

    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('should deep clone object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      cloned.b.c = 3;
      expect(obj.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });
  });

  describe('Async Utilities', () => {
    const sleep = (ms: number): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    const retry = async <T>(
      fn: () => Promise<T>,
      maxAttempts: number = 3,
      delay: number = 1000
    ): Promise<T> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxAttempts) throw error;
          await sleep(delay);
        }
      }
      throw new Error('Max attempts reached');
    };

    it('should sleep for specified duration', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      };

      const result = await retry(fn, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const fn = async () => {
        throw new Error('Always fails');
      };

      await expect(retry(fn, 2, 10)).rejects.toThrow('Always fails');
    });
  });

  describe('Crypto Utilities', () => {
    const generateRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const generateReferralCode = (): string => {
      return generateRandomString(8).toUpperCase();
    };

    it('should generate random string of specified length', () => {
      const str = generateRandomString(10);
      expect(str).toHaveLength(10);
      expect(/^[a-zA-Z0-9]+$/.test(str)).toBe(true);
    });

    it('should generate unique referral codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateReferralCode());
      }
      expect(codes.size).toBeGreaterThan(95); // High uniqueness
    });

    it('should generate uppercase referral code', () => {
      const code = generateReferralCode();
      expect(code).toBe(code.toUpperCase());
      expect(code).toHaveLength(8);
    });
  });

  describe('Pagination Utilities', () => {
    const paginate = <T>(array: T[], page: number, pageSize: number) => {
      const offset = (page - 1) * pageSize;
      const paginatedItems = array.slice(offset, offset + pageSize);
      
      return {
        items: paginatedItems,
        currentPage: page,
        pageSize,
        totalItems: array.length,
        totalPages: Math.ceil(array.length / pageSize),
        hasNextPage: offset + pageSize < array.length,
        hasPreviousPage: page > 1,
      };
    };

    it('should paginate array correctly', () => {
      const arr = Array.from({ length: 25 }, (_, i) => i + 1);
      const result = paginate(arr, 2, 10);
      
      expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
      expect(result.currentPage).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should handle last page', () => {
      const arr = Array.from({ length: 25 }, (_, i) => i + 1);
      const result = paginate(arr, 3, 10);
      
      expect(result.items).toEqual([21, 22, 23, 24, 25]);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should handle first page', () => {
      const arr = Array.from({ length: 25 }, (_, i) => i + 1);
      const result = paginate(arr, 1, 10);
      
      expect(result.hasPreviousPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });
  });
});

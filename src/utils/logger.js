/**
 * 统一日志工具
 * 根据环境自动启用/禁用日志输出
 */

const isDev = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * 调试日志 - 仅开发环境输出
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * 错误日志 - 所有环境都输出
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * 警告日志 - 仅开发环境输出
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * 信息日志 - 仅开发环境输出
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;

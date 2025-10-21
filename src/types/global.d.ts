declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

declare namespace NodeJS {
  interface ProcessEnv {
    DB_SERVER?: string;
    DB_PORT?: string;
    DB_NAME?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    EXPRESS_URL?: string;
    SQL_DATE_FORMAT?: string;
    BOT_TOKEN?: string;
    BOT_API?: string;
    CHAT_ID?: string;
  }
}

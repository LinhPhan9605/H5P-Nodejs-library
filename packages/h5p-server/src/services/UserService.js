"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const isBrowser = typeof window !== 'undefined';
class UserService {
    static setUser(user) {
        if (!isBrowser) {
            console.log(typeof window);
            console.log("not isBrowser");
            return;
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    static getUser() {
        if (!isBrowser) {
            console.log(typeof window);
            console.log("not isBrowser");
            return null;
        }
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr)
            return null;
        try {
            return JSON.parse(userStr);
        }
        catch (e) {
            console.error('[UserService] Failed to parse user from localStorage:', e);
            return null;
        }
    }
    static clearUser() {
        if (!isBrowser) {
            console.log(typeof window);
            console.log("not isBrowser");
            return;
        }
        localStorage.removeItem(this.USER_KEY);
    }
}
UserService.USER_KEY = 'h5p_user';
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map

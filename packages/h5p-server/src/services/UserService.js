"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    static USER_KEY = 'h5p_user';
    static setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }
    static getUser() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(this.USER_KEY);
            if (userStr) {
                return JSON.parse(userStr);
            }
        }
        return null;
    }
    static clearUser() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.USER_KEY);
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map
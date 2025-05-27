import { IUser } from '../types';

const isBrowser = typeof window !== 'undefined';

export class UserService {
    private static readonly USER_KEY = 'h5p_user';

    public static setUser(user: IUser): void {
        if (!isBrowser) {
            console.log(typeof window)
            console.log("not isBrowser")
            return
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    public static getUser(): IUser | null {
        if (!isBrowser) {
            console.log(typeof window)
            console.log("not isBrowser")
            return
        };
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as IUser;
        } catch (e) {
            console.error('[UserService] Failed to parse user from localStorage:', e);
            return null;
        }
    }

    public static clearUser(): void {
        if (!isBrowser) {
            console.log(typeof window)
            console.log("not isBrowser")
            return
        };
        localStorage.removeItem(this.USER_KEY);
    }
}

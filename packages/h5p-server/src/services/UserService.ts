import { IUser } from '../types';

export class UserService {
    private static readonly USER_KEY = 'h5p_user';

    public static setUser(user: IUser): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    public static getUser(): IUser | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(this.USER_KEY);
            if (userStr) {
                return JSON.parse(userStr);
            }
        }
        return null;
    }

    public static clearUser(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.USER_KEY);
        }
    }
} 
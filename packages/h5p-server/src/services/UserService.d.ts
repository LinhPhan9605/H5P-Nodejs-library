import { IUser } from '../types';
export declare class UserService {
    private static readonly USER_KEY;
    static setUser(user: IUser): void;
    static getUser(): IUser | null;
    static clearUser(): void;
}

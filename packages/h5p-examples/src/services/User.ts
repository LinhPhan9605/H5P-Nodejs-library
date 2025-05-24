import { IUser } from '@LinhPhan9605/h5p-server';

export class User implements IUser {
    constructor(id: string) {
        this.id = id;
        this.name = 'Anonymous User';
        this.type = 'local';
        this.email = 'anonymous@example.com';
    }

    public email: string;
    public id: string;
    public name: string;
    public type: 'local';
} 
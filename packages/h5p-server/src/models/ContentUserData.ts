import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

interface ContentUserDataAttributes {
    id: number;
    content_id: string;
    user_id: string;
    sub_content_id: number | null;
    data_type: string;
    data: any;
    preload: boolean;
    invalidate: boolean;
    created_at: Date;
    updated_at: Date;
}

class ContentUserData extends Model<ContentUserDataAttributes> implements ContentUserDataAttributes {
    public id!: number;
    public content_id!: string;
    public user_id!: string;
    public sub_content_id!: number | null;
    public data_type!: string;
    public data!: any;
    public preload!: boolean;
    public invalidate!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
}

ContentUserData.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        content_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sub_content_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        data_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        preload: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        invalidate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: 'h5p_content_user_data',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['content_id', 'user_id', 'sub_content_id', 'data_type']
            }
        ]
    }
);

export default ContentUserData; 
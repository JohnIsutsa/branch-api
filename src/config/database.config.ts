import { registerAs } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

export default registerAs(
    "database",
    (): DataSourceOptions => ({
        type: process.env.DB_TYPE === "postgres" ? "postgres" : "mysql",
        url: process.env.DB_URL,
        entities: ["dist/**/*.entity{.ts,.js}"],
        migrations: ["dist/src/database/migrations/*.js"],
        synchronize: false,
        ssl: process.env.DB_SSL === "true",
    })
);
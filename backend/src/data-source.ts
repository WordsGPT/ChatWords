import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "db",
    synchronize: true,
    logging: true,
    entities: ["Experiment"],
    migrations: [],
})
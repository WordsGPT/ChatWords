import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "database/db.sqlite",
            synchronize: true,
            logging: ["error", "warn"],
            autoLoadEntities: true,
            migrationsRun: true,
        })
    ]
})

export class DatabaseModule {
}


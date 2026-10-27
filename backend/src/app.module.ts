import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DosesModule } from './doses/doses.module';
import { HealthController } from './health.controller';
import { MedicinesModule } from './medicines/medicines.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
      type: 'postgres' as const,
      host: c.get<string>('DB_HOST', 'localhost'),
      port: Number(c.get<string>('DB_PORT', '5432')),
      username: c.get<string>('DB_USER', 'postgres'),
      password: c.get<string>('DB_PASSWORD', 'postgres'),
      database: c.get<string>('DB_NAME', 'medicine_reminder'),
      autoLoadEntities: true,
      synchronize: c.get<string>('DB_SYNC', 'false') === 'true',
      }),
   }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      context: ({ req }: { req: unknown }) => ({ req }),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    MedicinesModule,
    DosesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

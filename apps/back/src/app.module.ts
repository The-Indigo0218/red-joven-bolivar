import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YoungModule } from './young/young.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { MatchingModule } from './matching/matching.module';
import { DemandModule } from './demand/demand.module';
import { GroupsModule } from './groups/groups.module';
import { AiModule } from './ai/ai.module';
import { CommonModule } from './common/common.module';
import { SkillsModule } from './skills/skills.module';
import { RouteModule } from './route/route.module';
import { SocialActivityModule } from './social-activity/social-activity.module';
import { CivicCoinsModule } from './civiccoins/civiccoins.module';
import { RedemptionsModule } from './redemptions/redemptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'red_joven_bolivar'),
        autoLoadEntities: true,
        // synchronize solo para desarrollo/hackathon. Desactivar en producción.
        synchronize: true,
      }),
    }),
    YoungModule,
    OpportunitiesModule,
    MatchingModule,
    DemandModule,
    GroupsModule,
    AiModule,
    CommonModule,
    SkillsModule,
    RouteModule,
    SocialActivityModule,
    CivicCoinsModule,
    RedemptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

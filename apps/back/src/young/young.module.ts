import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoungController } from './young.controller';
import { YoungService } from './young.service';
import { YoungProfile } from './young.entity';

@Module({
  imports: [TypeOrmModule.forFeature([YoungProfile])],
  controllers: [YoungController],
  providers: [YoungService],
  exports: [YoungService],
})
export class YoungModule {}

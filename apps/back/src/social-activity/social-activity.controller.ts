import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  SocialActivity,
  type SocialActivityCategory,
} from './social-activity.entity';
import {
  SocialActivityService,
  type CreateSocialActivityInput,
  type SocialActivitiesResponse,
} from './social-activity.service';

const SOCIAL_ACTIVITY_CATEGORIES: SocialActivityCategory[] = [
  'enseñanza',
  'voluntariado',
  'obra',
];

export class CreateSocialActivityDto implements CreateSocialActivityInput {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  pointsReward!: number;

  @IsIn(SOCIAL_ACTIVITY_CATEGORIES)
  category!: SocialActivityCategory;

  @IsString()
  barrio!: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  requiredSkillIds?: string[];
}

@Controller('social-activities')
export class SocialActivityController {
  constructor(private readonly activityService: SocialActivityService) {}

  // GET /social-activities
  @Get()
  findAll(): Promise<SocialActivitiesResponse> {
    return this.activityService.findAll();
  }

  // POST /social-activities
  @Post()
  create(@Body() dto: CreateSocialActivityDto): Promise<SocialActivity> {
    return this.activityService.create(dto);
  }
}

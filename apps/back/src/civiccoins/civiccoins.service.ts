import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { SkillsService } from '../skills/skills.service';
import type { Skill } from '../skills/skill.entity';
import { SocialActivityService } from '../social-activity/social-activity.service';
import { YoungService } from '../young/young.service';
import { CivicCoinTransaction } from './civiccoin-transaction.entity';

export interface CivicCoinHistoryItem {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  validatedBy?: string;
  createdAt: string;
}

export interface CivicCoinsBalanceResponse {
  youngId: string;
  balance: number;
  history: CivicCoinHistoryItem[];
}

export interface EarnCivicCoinsResponse {
  transactionId: string;
  pointsEarned: number;
  newBalance: number;
  activity: string;
}

export interface SuggestedActivity {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  category: string;
  barrio: string;
  requiredSkills: Skill[];
  affinityScore: number; // 0..100
}

export interface SuggestedActivitiesResponse {
  items: SuggestedActivity[];
}

// Saldo, historial, acreditación y sugerencias de CivicCoins (Diferenciador 2).
@Injectable()
export class CivicCoinsService {
  constructor(
    @InjectRepository(CivicCoinTransaction)
    private readonly txRepo: Repository<CivicCoinTransaction>,
    private readonly youngService: YoungService,
    private readonly activityService: SocialActivityService,
    private readonly skillsService: SkillsService,
    private readonly aiService: AiService,
  ) {}

  async getBalance(youngId: string): Promise<CivicCoinsBalanceResponse> {
    await this.youngService.findOne(youngId); // 404 si no existe
    const txs = await this.txRepo.find({
      where: { youngId },
      order: { createdAt: 'DESC' },
    });

    const balance = txs.reduce(
      (acc, t) => acc + (t.type === 'earned' ? t.amount : -t.amount),
      0,
    );

    const history: CivicCoinHistoryItem[] = txs.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      ...(t.validatorId ? { validatedBy: t.validatorId } : {}),
      createdAt: t.createdAt.toISOString(),
    }));

    return { youngId, balance, history };
  }

  async earn(
    youngId: string,
    activityId: string,
    validatorId: string,
  ): Promise<EarnCivicCoinsResponse> {
    await this.youngService.findOne(youngId);
    await this.youngService.findOne(validatorId); // validador también es joven
    const activity = await this.activityService.findOne(activityId);

    const tx = await this.txRepo.save(
      this.txRepo.create({
        youngId,
        type: 'earned',
        amount: activity.pointsReward,
        activityId: activity.id,
        validatorId,
        description: `Actividad social: ${activity.title}`,
      }),
    );

    const { balance } = await this.getBalance(youngId);
    return {
      transactionId: tx.id,
      pointsEarned: activity.pointsReward,
      newBalance: balance,
      activity: activity.title,
    };
  }

  // Registra un gasto de puntos (usado por RedemptionModule al canjear).
  async spend(
    youngId: string,
    amount: number,
    description: string,
  ): Promise<number> {
    await this.txRepo.save(
      this.txRepo.create({
        youngId,
        type: 'redeemed',
        amount,
        activityId: null,
        validatorId: null,
        description,
      }),
    );
    const { balance } = await this.getBalance(youngId);
    return balance;
  }

  // GET /civiccoins/activities — sugerencias por afinidad (MCP_HOOK: SOCIAL_MATCHING).
  async suggestActivities(
    youngId: string,
  ): Promise<SuggestedActivitiesResponse> {
    const profile = await this.youngService.findOne(youngId);
    const youngSkills = await this.skillsService.getYoungSkills(youngId);
    const activities = (await this.activityService.findAll()).items;

    const scores = await this.aiService.suggestSocialActivities(
      { barrio: profile.barrio, skillIds: youngSkills.map((s) => s.id) },
      activities,
    );
    const scoreById = new Map(scores.map((s) => [s.activityId, s.affinityScore]));

    // Resuelve las habilidades requeridas de todas las actividades en un lote.
    const allSkillIds = [
      ...new Set(activities.flatMap((a) => a.requiredSkillIds)),
    ];
    const skills = await this.skillsService.getByIds(allSkillIds);
    const skillById = new Map(skills.map((s) => [s.id, s]));

    const items: SuggestedActivity[] = activities
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        pointsReward: a.pointsReward,
        category: a.category,
        barrio: a.barrio,
        requiredSkills: a.requiredSkillIds
          .map((id) => skillById.get(id))
          .filter((s): s is Skill => Boolean(s)),
        affinityScore: scoreById.get(a.id) ?? 0,
      }))
      .sort((x, y) => y.affinityScore - x.affinityScore);

    return { items };
  }
}

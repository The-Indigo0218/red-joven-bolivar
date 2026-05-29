import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CivicCoinsService } from '../civiccoins/civiccoins.service';
import { YoungService } from '../young/young.service';
import { RedemptionCatalog } from './redemption-catalog.entity';
import { Redemption } from './redemption.entity';

export interface RedemptionCatalogResponse {
  items: RedemptionCatalog[];
}

export interface RedemptionResponse {
  redemptionId: string;
  partner: string;
  pointsSpent: number;
  newBalance: number;
  voucherCode: string;
}

// Catálogo de aliados y canjes de CivicCoins (Diferenciador 2).
@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(RedemptionCatalog)
    private readonly catalogRepo: Repository<RedemptionCatalog>,
    @InjectRepository(Redemption)
    private readonly redemptionRepo: Repository<Redemption>,
    private readonly youngService: YoungService,
    private readonly civicCoinsService: CivicCoinsService,
  ) {}

  async getCatalog(): Promise<RedemptionCatalogResponse> {
    const items = await this.catalogRepo.find({ order: { pointsCost: 'ASC' } });
    return { items };
  }

  async redeem(
    youngId: string,
    catalogItemId: string,
  ): Promise<RedemptionResponse> {
    await this.youngService.findOne(youngId);

    const item = await this.catalogRepo.findOne({
      where: { id: catalogItemId },
    });
    if (!item) {
      throw new NotFoundException(
        `Ítem de catálogo ${catalogItemId} no encontrado`,
      );
    }

    const { balance } = await this.civicCoinsService.getBalance(youngId);
    if (balance < item.pointsCost) {
      throw new ConflictException(
        `Saldo insuficiente: tenés ${balance} CivicCoins y el canje cuesta ${item.pointsCost}`,
      );
    }

    const voucherCode = this.buildVoucher(item.partner);
    const redemption = await this.redemptionRepo.save(
      this.redemptionRepo.create({
        youngId,
        catalogItemId,
        pointsSpent: item.pointsCost,
        voucherCode,
      }),
    );

    const newBalance = await this.civicCoinsService.spend(
      youngId,
      item.pointsCost,
      `Canje: ${item.partner} — ${item.description}`,
    );

    return {
      redemptionId: redemption.id,
      partner: item.partner,
      pointsSpent: item.pointsCost,
      newBalance,
      voucherCode,
    };
  }

  private buildVoucher(partner: string): string {
    const prefix = partner
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 4)
      .toUpperCase();
    return `RJB-${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }
}

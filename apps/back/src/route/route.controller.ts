import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RouteService, type GrowthRouteResponse } from './route.service';

@Controller('opportunities')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // GET /opportunities/:id/route?youngId=   (MCP_HOOK: GAP_ANALYSIS + ROUTE_GENERATION)
  @Get(':id/route')
  generateRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('youngId', ParseUUIDPipe) youngId: string,
  ): Promise<GrowthRouteResponse> {
    return this.routeService.generateRoute(id, youngId);
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({ description: 'Team name', example: 'Marketing Team' })
  @IsOptional()
  @IsString()
  readonly name?: string;
}

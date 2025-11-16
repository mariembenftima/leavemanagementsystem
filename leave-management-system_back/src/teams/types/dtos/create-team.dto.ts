import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: 'Team name', example: 'Engineering Team' })
  @IsString()
  readonly name: string;
}

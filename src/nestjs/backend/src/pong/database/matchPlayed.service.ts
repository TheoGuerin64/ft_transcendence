import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPlayed } from './matchPlayed.entity';

@Injectable()
export class MatchPlayedService {
  constructor(
    @InjectRepository(MatchPlayed)
    private readonly MatchPlayedModel: Repository<MatchPlayed>,
  ) {}

  create(MatchPlayedData: DeepPartial<MatchPlayed>): MatchPlayed {
    const MatchPlayed = this.MatchPlayedModel.create(MatchPlayedData);
    this.MatchPlayedModel.save(MatchPlayed);
    return MatchPlayed;
  }
}

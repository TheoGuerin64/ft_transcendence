import { DeepPartial, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPlayed } from './matchPlayed.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MatchPlayedService {
  constructor(
    @InjectRepository(MatchPlayed)
    private readonly MatchPlayedModel: Repository<MatchPlayed>,
    private readonly userService: UserService,
  ) {}

  create(MatchPlayedData: DeepPartial<MatchPlayed>): MatchPlayed {
    const MatchPlayed = this.MatchPlayedModel.create(MatchPlayedData);
    this.MatchPlayedModel.save(MatchPlayed);
    return MatchPlayed;
  }

  async find(login: string): Promise<MatchPlayed[]> {
    //works but I think it's possible to find the same result with only one find
    const matchesPlayed = await this.MatchPlayedModel.find({
      where: [{ users: { login } }],
      relations: ['users'],
    });
    const arrayID = [];
    for (let x = 0; x < matchesPlayed.length; x++) {
      arrayID.push(matchesPlayed[x].id);
    }
    const matchesData = await this.MatchPlayedModel.find({
      where: [{ id: In(arrayID) }],
      relations: ['users'],
    });
    return matchesData;
  }
}

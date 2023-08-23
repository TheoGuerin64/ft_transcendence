import { DeepPartial, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPlayed } from './matchPlayed.entity';

@Injectable()
export class MatchPlayedService {
  constructor(
    @InjectRepository(MatchPlayed)
    private readonly MatchPlayedModel: Repository<MatchPlayed>,
  ) {}

  /**
   * create and save data from a match which has been played
   * @param MatchPlayedData match data
   * @returns match created
   */
  create(MatchPlayedData: DeepPartial<MatchPlayed>): MatchPlayed {
    const MatchPlayed = this.MatchPlayedModel.create(MatchPlayedData);
    this.MatchPlayedModel.save(MatchPlayed);
    return MatchPlayed;
  }

  /**
   * find all matches played by a user based on his login
   * @param login the login of the user
   * @returns all matches found
   */
  async find(login: string): Promise<MatchPlayed[]> {
    /*
    find all matches where the user is in it
    problem => in the users array, I only got the user I search, not the second one
    solution which work but not clean => save ID and make a second request
    */
    const matchesPlayed = await this.MatchPlayedModel.find({
      where: [{ users: { login } }],
      relations: ['users'],
    });

    //save all ID of this matches
    const arrayID = [];
    for (let x = 0; x < matchesPlayed.length; x++) {
      arrayID.push(matchesPlayed[x].id);
    }

    //get all the matches with all data in it
    const matchesData = await this.MatchPlayedModel.find({
      where: [{ id: In(arrayID) }],
      relations: ['users'],
    });
    return matchesData;
  }
}

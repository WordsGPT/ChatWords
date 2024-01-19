import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


export type User = any;

@Injectable()
export class UsersService {
  USER_NAME = process.env.USER_NAME || "test";
  USER_PASSWORD = process.env.USER_PASSWORD || "test";
  
  constructor(private configService: ConfigService) {
  }
  private readonly users = [
    {
      userId: 1,
      username: this.USER_NAME,
      password: this.USER_PASSWORD,
    }
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
import { Injectable } from '@nestjs/common';
const USER_NAME = process.env.USER_NAME || "test";
const USER_PASSWORD = process.env.USER_PASSWORD || "test";

export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: USER_NAME,
      password: USER_PASSWORD,
    }
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
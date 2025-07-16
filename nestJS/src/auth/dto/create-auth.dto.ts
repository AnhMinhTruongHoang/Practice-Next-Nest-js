import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'username is not empty' })
  username: string;

  @IsNotEmpty({ message: 'password is not empty' })
  password: string;
}

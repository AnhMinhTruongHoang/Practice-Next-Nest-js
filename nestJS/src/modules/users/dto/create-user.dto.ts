import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'name is not empty!' })
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format!' })
  email: string;

  @IsNotEmpty({ message: 'password is required!' })
  password: string;

  phone: string;

  address: string;

  image: string;

  role: string;
}

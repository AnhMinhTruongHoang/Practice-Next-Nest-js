import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) {
      return true;
    } else {
      return false;
    }
  };

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    // check email

    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException('Email exist');
    }
    // hash_password

    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * +pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return { results, totalPages };
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Invalid ID');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    // check email

    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException('Email exist');
    }
    // hash_password
    const dayjs = require('dayjs');
    const codeId = uuidv4();
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(1, 'day'),
    });
    /// send mail
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Activate your account at your mail',
        template: 'register.hbs',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      });
    } catch (err) {
      console.error('Email send error:', err);
      throw new InternalServerErrorException('Filed to send mail !');
    }

    ///

    return {
      _id: user._id,
    };
  }
}

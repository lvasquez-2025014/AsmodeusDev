import { prop, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export enum LogEventType {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGIN_FAILED = 'LOGIN_FAILED',
  GOOGLE_LOGIN = 'GOOGLE_LOGIN',
}

export class Log extends TimeStamps {
  @prop({ required: true, enum: LogEventType })
  event!: LogEventType;

  @prop({ trim: true, default: '' })
  userName!: string;

  @prop({ trim: true, default: '' })
  email!: string;

  @prop({ trim: true, default: '' })
  ip!: string;

  @prop({ trim: true, default: '' })
  userAgent!: string;

  @prop({ trim: true, default: '' })
  country!: string;

  @prop({ trim: true, default: '' })
  city!: string;

  @prop({ default: false })
  success!: boolean;
}

export const LogModel = getModelForClass(Log);

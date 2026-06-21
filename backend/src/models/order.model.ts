import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { User } from './user.model';
import { Product } from './product.model';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  PAYPAL = 'paypal',
  BINANCE = 'binance',
  TRANSFERENCIA = 'transferencia',
}

export class Order extends TimeStamps {
  @prop({ ref: () => Product, required: true })
  product!: Ref<Product>;

  @prop({ ref: () => User })
  buyer?: Ref<User>;

  @prop({ trim: true, default: '' })
  buyerName!: string;

  @prop({ trim: true, default: '' })
  buyerEmail!: string;

  @prop({ trim: true, required: true })
  planDuration!: string;

  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ enum: PaymentMethod, required: true })
  method!: PaymentMethod;

  @prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @prop({ default: 0 })
  salesCounted!: number;
}

export const OrderModel = getModelForClass(Order);

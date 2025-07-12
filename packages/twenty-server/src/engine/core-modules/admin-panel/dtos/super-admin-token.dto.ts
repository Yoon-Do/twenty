import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuperAdminTokenDto {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field({ nullable: true })
  expiresAt?: Date;
}
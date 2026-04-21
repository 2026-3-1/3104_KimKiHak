import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    LecturesModule,
    ReviewsModule,
    SearchModule,
    SubscriptionsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

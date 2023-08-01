import { User } from '@src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('authentication')
@Index('auth_provider_iden_unique_idx', ['category', 'identification'], { unique: true })
export class Authentication {
  /**
   * authentication 레코드 아이디
   *
   * @uuid
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * FK: user.id
   */
  @Column({ name: 'user_id' })
  userId!: string;

  /**
   * 인증 카테고리 (email, phone, kakao, apple 등)
   */
  @Column({ name: 'category', length: 64 })
  category!: string;

  /**
   * 식별자
   *
   * email address, phone number 등
   */
  @Column({ name: 'identification', length: 64 })
  identification!: string;

  /**
   * 비밀번호
   */
  @Column({ name: 'password', length: 256 })
  password!: string;

  /**
   * 생성 날짜
   *
   * @format date-time
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date | string;

  /**
   * 수정 날짜
   *
   * @format date-time
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date | string;

  /**
   * FK: user.id
   */
  @ManyToOne(() => User, (user) => user.authentications, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_authentication_user' })
  user!: User;
}

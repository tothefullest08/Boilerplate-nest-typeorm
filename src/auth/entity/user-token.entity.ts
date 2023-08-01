import { User } from '@src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_token')
export class UserToken {
  /**
   * user_token 레코드 아이디
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
   * access_token
   */
  @Column({ name: 'access_token', length: 512 })
  accessToken!: string;

  /**
   * refresh_token
   */
  @Column({ name: 'refresh_token', length: 512 })
  refreshToken!: string;

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
  @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', createForeignKeyConstraints: true })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_user_token_user' })
  user!: User;
}

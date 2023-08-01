import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Authentication } from '@src/auth/entity/auth.entity';

@Entity('user')
export class User {
  /**
   * 유저 테이블 아이디
   *
   * @uuid
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * 닉네임
   */
  @Column({ name: 'nickname', length: 32 })
  nickname!: string;

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
   * OneToMany Authentication
   */
  @OneToMany(() => Authentication, (authentication) => authentication.user)
  authentications!: Authentication[];
}

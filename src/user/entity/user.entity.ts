import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
   * @minLength 1
   * @maxLength 5
   */
  @Column({ name: 'nickname', length: 16 })
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
}

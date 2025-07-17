import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from './Tenant';
import { Question } from './Question';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.categories)
  tenant!: Tenant;

  @OneToMany(() => Question, (question) => question.category)
  questions!: Question[];

  @Column('jsonb', { nullable: true })
  rubric?: { min: number; max: number; storyPoints: number; note?: string }[];
} 